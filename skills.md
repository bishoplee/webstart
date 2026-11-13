# WebStart — Engineering Standards & Reusable Project Skills (`skills.md`)

This document codifies reusable project-specific engineering instructions, architectural patterns, security guardrails, and quality gates for developing and maintaining **WebStart**. Every contributor and coding agent must follow these conventions.

---

## 1. Core Tooling & Commands

- **Package Manager**: Always use **Bun** (`bun install`, `bun add`, `bun run <script>`). Never use `npm`, `yarn`, or `pnpm`, and always keep `bun.lock` committed.
- **Database Migrations**:
  - Generate migrations: `bun run db:generate` (`drizzle-kit generate`)
  - Apply migrations: `bun run db:migrate` (`drizzle-kit migrate`)
  - Seed initial templates & demo workspace: `bun run db:seed`
- **Verification Pipeline**:
  - Typecheck: `bun run typecheck` (`tsc --noEmit`)
  - Lint: `bun run lint`
  - Unit & Integration Tests: `bun run test` (`vitest run`)
  - End-to-End Tests: `bun run test:e2e` (`playwright test`)
  - Production Build Check: `bun run build` (`next build`)

---

## 2. Server-Side Authorization & Workspace Isolation Skill

### Rule
Never trust client-passed `workspaceId`, `role`, or `projectId` without verifying ownership on the server. Do not rely on Clerk public metadata alone or hidden UI buttons for access control.

### Pattern
1. All `/dashboard/*` pages and administrative Server Actions must invoke `requireWorkspaceContext(allowedRoles)` from `src/lib/auth/context.ts`.
2. Every Drizzle query on tenant tables (`clients`, `projects`, `questionnaire_templates`, etc.) **must** include `eq(table.workspaceId, ctx.workspaceId)` in its `where` clause.
3. Client Portal actions (`/portal/projects/[token]`) must verify the token via `verifyInvitationToken(rawToken)` which:
   - Computes `sha256(rawToken)` and queries `project_questionnaire_sessions`.
   - Checks that `revoked_at IS NULL` and `expires_at > NOW()`.
   - For mutations (autosave, upload, submit), verifies that the session is currently editable (`project.status` in `['INVITATION_SENT', 'IN_PROGRESS', 'AWAITING_CLIENT_RESPONSE']`).
4. **Internal Notes Isolation**: Queries returning project details to a Client session must never select or serialize `project_notes` with `visibility = 'INTERNAL'` or `clients.internal_notes` / `projects.internal_notes`.

---

## 3. Server Action & Input Validation Skill

### Rule
Every Server Action and Route Handler must validate inputs using shared **Zod** schemas before executing business logic, wrap multi-table writes in a Drizzle transaction (`db.transaction(...)`), and return a structured result (`ActionResult<T>`).

### Pattern
```typescript
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```
- Never leak raw PostgreSQL or Drizzle stack traces to the browser.
- Log unexpected server errors safely without logging raw tokens, secrets, or sensitive PII.
- Record an audit entry in `project_activity_logs` inside the same transaction for significant project lifecycle actions.
- Call `revalidatePath(...)` after mutations to keep Server Components synchronized.

---

## 4. Questionnaire Engine & Debounced Autosave Skill

### Rule
Questionnaire state must be persisted to PostgreSQL per section/question and never held exclusively in browser memory or `localStorage`. Furthermore, the UI must **never** display a "Saved" indicator until the server explicitly confirms persistence.

### Pattern
1. **Conditional Logic Consistency**:
   - Define conditional rules declaratively in `src/lib/questionnaire/conditions.ts`.
   - Use the exact same pure function `isQuestionVisible(question, currentResponses)` on both the client wizard and the server-side validator/completion calculator.
   - Hidden conditional questions (e.g., E-Commerce follow-ups when E-Commerce is not selected) are excluded from required-field denominator calculations.
2. **Autosave State Machine**:
   - States: `IDLE` → `DIRTY` → `SAVING` → `SAVED` (with timestamp) or `ERROR` (with retry button and local draft backup for network recovery).
   - Debounce field changes (800ms) and trigger an immediate flush on section navigation (`Next` / `Previous` / `"Save & Continue Later"`).
3. **Template Versioning**:
   - When creating a `project_questionnaire_session`, record `template_id`, `template_version`, and a JSONB snapshot of the template structure so future template edits by admins do not break active or completed submissions.

---

## 5. Secure File Upload & Storage Adapter Skill

### Rule
Never store binary files in PostgreSQL, never expose Cloudinary API secrets to the client, and never trust browser-supplied `File.type` alone.

### Pattern
1. Implement all storage operations behind `StorageProvider` (`src/lib/storage/types.ts`).
2. On upload:
   - Verify authentication (valid workspace admin or active project invitation token).
   - Validate file size (`<= 10MB`) and inspect magic bytes from the file buffer (`src/lib/storage/validate-file.ts`) against allowed types (`PNG`, `JPEG`, `WEBP`, `PDF`, `DOCX`, safe `SVG`).
   - Sanitize the original filename and generate a non-predictable storage key (`workspaces/${workspaceId}/projects/${projectId}/${uuid}-${safeName}`).
   - Persist metadata in `project_files` and log the upload in `project_activity_logs`.
3. On download/view:
   - Route through `/api/files/[fileId]` which verifies workspace membership or matching project session token before redirecting to a short-lived signed URL or streaming the file.

---

## 6. Project Brief Generation Skill (20-Section Standard)

### Rule
Generated project briefs must be deterministic, grounded strictly in persisted database records, and clearly distinguish between **Client-Provided Information**, **Agency Observations**, **Technical Recommendations**, and **Unconfirmed Assumptions**. Never fabricate client requirements.

### Pattern
- The brief builder (`src/lib/brief/builder.ts`) compiles all 20 required sections:
  1. Project Identification
  2. Client Profile
  3. Business Overview
  4. Project Background
  5. Business Objectives
  6. Target Audience
  7. Proposed Website Structure
  8. Content Requirements
  9. Branding and Design Requirements
  10. Functional Requirements (including conditional follow-up details)
  11. Technical Requirements
  12. Integrations
  13. User Roles
  14. Infrastructure Requirements
  15. Budget Expectations
  16. Project Timeline
  17. Outstanding Questions (automatically populated from unanswered fields & open clarification requests)
  18. Assumptions
  19. Risks and Dependencies
  20. Recommended Next Steps
- Every generated brief increments `version` in `project_documents` and supports:
  - Interactive HTML preview
  - Clean `@media print` printable view
  - Downloadable `.md` (Markdown) export
  - Downloadable `.pdf` export (built with a serverless-safe Node PDF library)

---

## 7. UI/UX & Brand Implementation Skill

### Brand Tokens
- **Deep Navy**: `#202D3B` (Primary dark surfaces / headings / sidebar)
- **Steel Blue**: `#355C7D` (Secondary interactive accents / badges)
- **Soft Background**: `#F7F9FC` (Light mode canvas background)
- **Primary Accent (Lime)**: `#A2D514` (Primary CTA highlights, progress accents; ensure accessible dark text `#202D3B` on `#A2D514` backgrounds for WCAG contrast)
- **Secondary Text**: `#64748B`
- **Border**: `#E2E8F0`
- Support both **Light Mode** and **Dark Mode** cleanly.

### UX Completeness Checklist
- **No Dead Buttons**: Every button, menu item, filter, and modal trigger must perform its real action.
- **Real Database Metrics**: Dashboard cards and reports must query live PostgreSQL aggregations (`COUNT`, `GROUP BY`) — never hardcoded numbers.
- **Four States Per View**: Every data-driven view must implement:
  1. Loading state (skeletons / spinners)
  2. Empty state (clear explanation + primary CTA)
  3. Error state (friendly message + retry action)
  4. Populated state (responsive table on desktop, stacked cards on mobile)

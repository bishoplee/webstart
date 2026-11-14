# WebStart — Phased Implementation Plan (`docs/IMPLEMENTATION_PLAN.md`)

This document defines the structured, phase-by-phase engineering plan for building, verifying, and deploying **WebStart** according to `prompt.md` and `Architect.md`.

---

## Phase Overview

| Phase | Name | Primary Deliverable | Status |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Repository & Architecture Foundation | Architecture docs, Next.js + Bun + Tailwind + shadcn/ui + TypeScript foundation | Completed |
| **Phase 1** | Database, Auth & Multi-Tenant RBAC | Neon + Drizzle schema & migrations, Clerk integration, workspace sync & RBAC guards | Completed |
| **Phase 2** | Public Website & Administrative Foundation | Public pages (`/` to `/terms`), Agency Dashboard, Client & Project CRUD, Search & Filters | Completed |
| **Phase 3** | Adaptive Questionnaire Engine & Client Portal | 7 adaptive templates, 11 sections, conditional logic, token auth, debounced autosave, wizard UI | Completed |
| **Phase 4** | File Uploads & Administrative Review System | Storage adapter (Cloudinary), magic-byte validation, section review, clarifications, audit logs | Pending |
| **Phase 5** | Project Document Generation (20-Section Brief) | Deterministic brief builder, HTML preview, printable layout, Markdown & PDF exports, versioning | Pending |
| **Phase 6** | Notifications, Reporting & Analytics | Resend email integration with graceful fallback, live reporting charts & metrics | Pending |
| **Phase 7** | Quality Assurance (Unit, Integration, E2E) | Vitest unit & integration suites, Playwright E2E full 16-step journey, security & mobile checks | Pending |
| **Phase 8** | Production Readiness & Deployment Handover | `.env.example`, health check (`/api/health`), `DATABASE.md`, `SECURITY.md`, `DEPLOYMENT.md`, production build verification | Pending |

---

## Detailed Phase Breakdown

### PHASE 0: Repository & Architecture Foundation
- **Objective**: Establish a clean, documented Next.js App Router + Bun + TypeScript + Tailwind CSS + shadcn/ui foundation with linting, testing harnesses, and core documentation.
- **Files & Modules**:
  - `Architect.md`, `skills.md`, `docs/IMPLEMENTATION_PLAN.md`, `README.md`, `CHANGELOG.md`, `.env.example`
  - `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/globals.css`
  - `src/components/ui/*` (shadcn/ui components), brand color tokens (`#202D3B`, `#355C7D`, `#F7F9FC`, `#A2D514`)
- **Completion Criteria**:
  - `bun install`, `bun run typecheck`, and `bun run lint` succeed cleanly.

---

### PHASE 1: Database, Authentication & Multi-Tenant RBAC
- **Objective**: Implement the complete relational schema in Drizzle ORM for Neon PostgreSQL, configure Clerk authentication, synchronize users/workspaces, and enforce server-side role-based access control (`SUPER_ADMIN`, `ADMIN`, `PROJECT_MANAGER`, `CLIENT`).
- **Files & Modules**:
  - `drizzle.config.ts`, `src/db/index.ts`, `src/db/schema.ts`, `src/db/seed.ts`, `drizzle/*`
  - `src/middleware.ts` (Clerk route protection)
  - `src/lib/auth/context.ts`, `src/lib/auth/permissions.ts`, `src/lib/auth/tokens.ts`
  - `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`, `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
  - `src/components/layout/dashboard-shell.tsx`, `src/components/layout/portal-shell.tsx`
- **Completion Criteria**:
  - All 15+ database tables (`users`, `workspaces`, `workspace_members`, `clients`, `projects`, `questionnaire_templates`, `questionnaire_sections`, `questionnaire_questions`, `project_questionnaire_sessions`, `questionnaire_responses`, `project_files`, `project_notes`, `project_activity_logs`, `clarification_requests`, `project_documents`) are defined with relations, constraints, and generated migrations.
  - Role-based guards and workspace isolation checks are unit-tested.

---

### PHASE 2: Public Website & Administrative Foundation (Modules A, B, C)
- **Objective**: Build the public-facing informational pages and the core agency workspace for managing clients, projects, invitations, statuses, and team members.
- **Files & Modules**:
  - Public routes: `/`, `/about`, `/how-it-works`, `/contact`, `/privacy`, `/terms`
  - Admin routes: `/dashboard`, `/dashboard/clients`, `/dashboard/clients/[id]`, `/dashboard/projects`, `/dashboard/projects/[id]`, `/dashboard/users`, `/dashboard/settings`
  - Server Actions: `src/actions/clients.ts`, `src/actions/projects.ts`, `src/actions/workspace.ts`
  - Validation schemas: `src/lib/validations/client.ts`, `src/lib/validations/project.ts`
- **Completion Criteria**:
  - Live database-driven dashboard cards and recent activity lists.
  - Full Client CRUD (with duplicate email/organisation check, search, filter, archive).
  - Full Project creation wizard (client selection or inline creation, website category, template assignment, manager assignment, target date, budget range, secure hashed invitation token generation & copyable link).

---

### PHASE 3: Adaptive Questionnaire Engine & Client Portal (Sections 7, 8, 9)
- **Objective**: Build the configurable questionnaire engine with 7 website category templates, 11 logical discovery sections, conditional feature follow-up groups, real-time progress calculation, and debounced server-confirmed autosave.
- **Files & Modules**:
  - `src/lib/questionnaire/default-templates.ts` (7 templates: Corporate, E-commerce, Educational, NGO, Portfolio, Web App/Portal, Custom + 11 core sections + conditional follow-ups for Online Payments, Booking, User Accounts, E-Commerce, etc.)
  - `src/lib/questionnaire/conditions.ts`, `src/lib/questionnaire/completion.ts`
  - `src/app/dashboard/templates/page.tsx` & template configuration UI
  - Client portal routes: `/portal`, `/portal/projects/[token]`, `/portal/projects/[token]/review`, `/portal/projects/[token]/submitted`
  - `src/actions/questionnaire.ts` (debounced autosave, section save, final submission with status transition & lock)
- **Completion Criteria**:
  - Clients can access `/portal/projects/[token]`, navigate sections, see conditional follow-up questions appear dynamically, experience reliable server-confirmed autosave, review complete/incomplete sections, and submit their questionnaire (locking ordinary edits).

---

### PHASE 4: File Upload System & Administrative Review System (Sections 10, 11)
- **Objective**: Enable secure drag-and-drop file uploads via a provider-independent storage interface (Cloudinary default) and build the comprehensive agency review workflow (section review status, internal notes, clarification requests & client responses, activity audit trail).
- **Files & Modules**:
  - `src/lib/storage/types.ts`, `src/lib/storage/cloudinary.ts`, `src/lib/storage/validate-file.ts`
  - `src/app/api/uploads/route.ts`, `src/app/api/files/[id]/route.ts`
  - `src/components/questionnaire/file-uploader.tsx`
  - `src/components/projects/project-review-workspace.tsx`, `src/components/projects/clarification-panel.tsx`, `src/components/projects/internal-notes-panel.tsx`
  - `src/actions/review.ts`, `src/actions/clarifications.ts`
- **Completion Criteria**:
  - Files are validated on the server (size, extension, magic bytes), stored via the storage adapter, and accessible only to authorized workspace members or the owning project session.
  - Admins can mark sections reviewed, flag incomplete items, add private internal notes (strictly hidden from clients), request section/question clarifications, reopen submissions, and approve discovery.
  - Clients can view and respond to clarification requests when a project is in `AWAITING_CLIENT_RESPONSE`.

---

### PHASE 5: Project Document Generation (Section 12)
- **Objective**: Convert persisted client discovery data and agency review observations into a structured 20-section development-ready Project Brief with HTML preview, print layout, Markdown export, and serverless PDF export.
- **Files & Modules**:
  - `src/lib/brief/builder.ts` (20-section rule-based compiler separating Client-Provided Information, Agency Observations, Technical Recommendations, and Unconfirmed Assumptions)
  - `src/lib/brief/markdown-exporter.ts`, `src/lib/brief/pdf-exporter.ts`
  - `src/app/api/projects/[id]/brief/pdf/route.ts`, `src/app/api/projects/[id]/brief/markdown/route.ts`
  - `src/components/documents/project-brief-viewer.tsx`
- **Completion Criteria**:
  - Admins can generate, version, regenerate, preview in HTML, print, and download `.md` and `.pdf` project briefs containing all 20 specified sections based strictly on persisted project data.

---

### PHASE 6: Notifications, Search, Filtering & Reporting (Sections 17, 18)
- **Objective**: Implement the optional Resend email notification service (for invitations, reminders, submissions, clarifications, approvals, archiving) with graceful fallback when unconfigured, plus live administrative analytics and reporting.
- **Files & Modules**:
  - `src/lib/notifications/email-service.ts`, `src/lib/notifications/templates.ts`
  - `src/components/dashboard/reports-panel.tsx`
- **Completion Criteria**:
  - Notification events trigger emails when `RESEND_API_KEY` is configured and gracefully fall back to copyable links + clear admin status warnings when unconfigured.
  - Reports accurately display Projects by Status, Projects by Category, Monthly Project Creation, Discovery Completion Rate, and Outstanding Client Submissions from live PostgreSQL queries.

---

### PHASE 7: Quality Assurance & Comprehensive Testing (Section 20)
- **Objective**: Verify unit, integration, and end-to-end functionality, security isolation, and mobile/desktop responsiveness.
- **Files & Modules**:
  - `tests/unit/*` (validation schemas, RBAC checks, completion calculator, conditional rules, status transitions, token hashing/validation)
  - `tests/integration/*` (client/project creation, autosave, submission lock, clarification cycle, file metadata, brief generation)
  - `tests/e2e/*` (full 16-step Admin-to-Client-to-Admin discovery and brief generation workflow + cross-tenant access denial tests)
- **Completion Criteria**:
  - All unit, integration, and E2E tests pass; zero TypeScript or ESLint errors.

---

### PHASE 8: Deployment Readiness & Final Documentation (Section 19)
- **Objective**: Finalize production build configuration, health check endpoint (`/api/health`), and comprehensive operational documentation.
- **Files & Modules**:
  - `src/app/api/health/route.ts`
  - `docs/DATABASE.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, `README.md`, `CHANGELOG.md`, `.env.example`
- **Completion Criteria**:
  - `bun run build` succeeds cleanly with all routes verified and documentation complete.

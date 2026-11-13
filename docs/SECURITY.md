# WebStart — Security & Privacy Specification (`docs/SECURITY.md`)

---

## 1. Authentication & Role-Based Authorization (RBAC)

- **Identity Provider**: Clerk handles primary authentication (`/sign-in`, `/sign-up`).
- **Server-Side Role Resolution**: Roles (`SUPER_ADMIN`, `ADMIN`, `PROJECT_MANAGER`, `CLIENT`) and workspace memberships are stored in PostgreSQL (`workspace_members`) and checked on the server before every read or mutation.
- **Strict Tenant Isolation**: Every query filters by the authenticated user's `workspace_id`. Cross-workspace IDOR attempts return `403 Forbidden` or `404 Not Found`.
- **Internal Notes Protection**: Records in `project_notes` with `visibility = 'INTERNAL'` and internal notes fields on `clients`/`projects` are stripped from all client portal responses.

---

## 2. Invitation Token Security

- **Generation**: 32 cryptographically random bytes (`256-bit` entropy) encoded as URL-safe Base64.
- **Storage at Rest**: Only `SHA-256(rawToken)` is stored in `project_questionnaire_sessions.invitation_token_hash`.
- **Lifecycle Controls**:
  - Automatic expiry (`expires_at`, default 30 days, configurable by administrators).
  - Instant revocation (`revoked_at`) and token rotation when re-issuing invitations.
  - Automatic edit locking upon final submission (`submitted_at`), which can only be reopened by an administrator or targeted clarification request.

---

## 3. File Upload Security

- **Browser MIME Distrust**: Uploaded files are validated on the server by inspecting magic bytes (file buffer signatures), file extensions, and byte size limits (`<= 10 MB`).
- **Allowed Formats**: `PNG`, `JPEG`, `WEBP`, sanitized `SVG`, `PDF`, `DOCX`. Executable, script, and archive formats are rejected.
- **Private Access Control**: Cloudinary API secrets are strictly server-only. File downloads are mediated through an authenticated route handler that verifies workspace or session ownership.

---

## 4. Data Protection & NDPA Compliance

- **No Credential Collection**: Section 7 (*Technical & Infrastructure Requirements*) explicitly instructs clients never to submit passwords, API keys, or secret credentials.
- **Audit Logging**: Sensitive lifecycle events are recorded in `project_activity_logs` without logging raw tokens, passwords, or private credentials.
- **Privacy & Retention**: Supports client archiving, file deletion, and structured data export in alignment with the **Nigeria Data Protection Act (NDPA)** and GDPR principles.

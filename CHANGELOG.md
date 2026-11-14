# Changelog

All notable architectural and implementation milestones for **WebStart** are documented in this file.

## [0.4.0] - Phase 3: Questionnaire Engine & Client Portal
### Added
- Built Questionnaire Server Actions (`src/actions/questionnaire.ts`) for debounced section autosave, final submission with completeness verification and edit locking, and client clarification responses.
- Built Section 4 interactive Page Specification Builder (`src/components/questionnaire/page-builder-input.tsx`) for standard and custom website pages.
- Built Guided Questionnaire Wizard (`src/components/questionnaire/questionnaire-wizard.tsx`) with one-section-per-screen navigation, dynamic conditional follow-up groups (Online Payments, Booking, User Accounts, E-Commerce), honest server-confirmed autosave indicators, local draft recovery, and Section 7 security reminders.
- Built Section 11 Final Review & Submission experience (`src/components/questionnaire/questionnaire-review.tsx`) and Clarification Responder (`src/components/questionnaire/clarification-responder.tsx`).
- Implemented all Client Portal routes: `/portal` (`src/app/portal/page.tsx`), `/portal/projects/[token]` (`src/app/portal/projects/[token]/page.tsx`), `/portal/projects/[token]/review` (`src/app/portal/projects/[token]/review/page.tsx`), and `/portal/projects/[token]/submitted` (`src/app/portal/projects/[token]/submitted/page.tsx`).
- Added Phase 3 unit and integration test suite (`tests/unit/phase3-questionnaire-engine.test.ts`).

## [0.3.0] - Phase 2: Administrative Foundation & Public Website
### Added
- Built public website routes (`/`, `/about`, `/how-it-works`, `/contact`, `/privacy`, `/terms`) and shared `PublicShell` layout (`src/components/layout/public-shell.tsx`).
- Implemented Zod validation schemas for Client and Project operations (`src/lib/validations/client.ts`, `src/lib/validations/project.ts`).
- Implemented the 7 adaptive website category questionnaire templates and 11 core discovery sections (`src/lib/questionnaire/default-templates.ts`), conditional rule evaluator (`src/lib/questionnaire/conditions.ts`), and completion calculator (`src/lib/questionnaire/completion.ts`).
- Implemented repository data layer (`src/lib/data/repository.ts`) and Server Actions (`src/actions/clients.ts`, `src/actions/projects.ts`, `src/actions/workspace.ts`).
- Built Module A (Agency Dashboard `/dashboard`), Module B (Client Directory `/dashboard/clients` & Client Profile `/dashboard/clients/[id]`), Module C (Discovery Projects `/dashboard/projects` & Project Workspace `/dashboard/projects/[id]`), plus `/dashboard/templates`, `/dashboard/users`, and `/dashboard/settings`.
- Added unit and integration tests for Phase 2 (`tests/unit/phase2-admin-foundation.test.ts`).

## [0.2.0] - Phase 1: Database and Authentication
### Added
- Configured Drizzle ORM + Neon Serverless PostgreSQL (`drizzle.config.ts`, `src/db/index.ts`, `src/db/schema.ts`).
- Defined all 15 relational tables (`users`, `workspaces`, `workspace_members`, `clients`, `projects`, `questionnaire_templates`, `questionnaire_sections`, `questionnaire_questions`, `project_questionnaire_sessions`, `questionnaire_responses`, `project_files`, `project_notes`, `project_activity_logs`, `clarification_requests`, `project_documents`) with UUID primary keys, foreign key cascades, composite indexes, and generated SQL migration (`drizzle/0000_eminent_cobalt_man.sql`).
- Implemented Clerk authentication middleware (`src/middleware.ts`), sign-in/sign-up routes (`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`, `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`), and server-side PostgreSQL user/workspace synchronization (`src/lib/auth/context.ts`).
- Implemented server-side RBAC permission matrix across `SUPER_ADMIN`, `ADMIN`, `PROJECT_MANAGER`, and `CLIENT` (`src/lib/auth/permissions.ts`), including internal note isolation and project status transition validation.
- Implemented cryptographic invitation token generation, SHA-256 hashing at rest, and session state evaluation (`src/lib/auth/tokens.ts`).
- Built responsive protected application layouts (`src/components/layout/dashboard-shell.tsx`, `src/components/layout/portal-shell.tsx`, `src/app/dashboard/layout.tsx`).
- Added unit test suite (`tests/unit/phase1-auth-db.test.ts`).

## [0.1.0] - Phase 0: Repository and Architecture Foundation
### Added
- Created system architecture specification (`Architect.md`), reusable project engineering skills (`skills.md`), and phased implementation roadmap (`docs/IMPLEMENTATION_PLAN.md`).
- Initialized Next.js App Router + TypeScript project configured for Bun (`package.json`, `bun.lock`, `tsconfig.json`, `next.config.ts`).
- Configured Tailwind CSS v4 with the WebStart brand identity (`#202D3B` Deep Navy, `#355C7D` Steel Blue, `#F7F9FC` Soft Background, `#A2D514` Primary Accent, `#64748B` Secondary Text, `#E2E8F0` Border) and light/dark mode support.
- Installed and configured core `shadcn/ui` primitives (`button`, `card`, `input`, `textarea`, `label`, `badge`, `select`, `checkbox`, `dialog`, `dropdown-menu`, `tabs`, `table`, `progress`, `skeleton`, `separator`, `tooltip`, `alert`, `switch`, `avatar`).
- Configured environment validation (`src/lib/env.ts`) and documented `.env.example`.
- Added operational documentation (`docs/DATABASE.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`).
- Configured ESLint and Vitest unit testing harness (`vitest.config.ts`, `tests/unit/foundation.test.ts`).

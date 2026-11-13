# WebStart

> **From client ideas to development-ready projects.**

WebStart is a full-stack client onboarding, website requirements discovery, and project initiation platform built for web development agencies. It replaces scattered WhatsApp threads, spreadsheets, and unstructured emails with an adaptive discovery workflow that produces structured 20-section development briefs.

---

## Core Capabilities

- **Multi-Tenant Agency Workspace (`/dashboard`)**: Role-based access control (`SUPER_ADMIN`, `ADMIN`, `PROJECT_MANAGER`, `CLIENT`) with strict workspace isolation.
- **Client & Project Management**: Full client CRM profile management, project lifecycle tracking (`Draft` → `Invitation Sent` → `In Progress` → `Submitted` → `Under Review` ⇄ `Awaiting Client Response` → `Approved` → `Archived`), and secure hashed invitation tokens.
- **Adaptive Discovery Questionnaire Engine (`/portal/projects/[token]`)**:
  - 7 pre-configured website category templates (*Corporate*, *E-commerce*, *Educational Institution*, *NGO / Non-profit*, *Personal / Portfolio*, *Web Application / Customer Portal*, *Custom Website*).
  - 11 structured discovery sections with conditional follow-up question groups (e.g., *Online Payments*, *Booking*, *User Accounts*, *E-Commerce*) and interactive custom page builder.
  - Debounced server-confirmed autosave, progress tracking, and mobile-first wizard interface.
- **Secure File Upload System**: Provider-independent storage interface (Cloudinary default) with drag-and-drop uploads, server-side magic-byte validation, and authenticated download access.
- **Administrative Review & Clarifications**: Section-level review states, private internal notes, targeted clarification requests tied to specific sections/questions, and an immutable project audit log.
- **20-Section Project Brief Generator**: Deterministic project brief synthesis separating *Client-Provided Information*, *Agency Observations*, *Technical Recommendations*, and *Unconfirmed Assumptions*, with HTML preview, printable layout, Markdown export, and serverless PDF export.

---

## Technology Stack

- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS v4, shadcn/ui, Lucide Icons
- **Forms & Validation**: React Hook Form, Zod
- **Database & ORM**: Neon Serverless PostgreSQL, Drizzle ORM, Drizzle Kit
- **Authentication**: Clerk + SHA-256 Hashed Session Invitation Tokens
- **File Storage**: Provider-independent adapter (Cloudinary)
- **Email Notifications**: Resend (optional with graceful fallback)
- **Package Manager & Test Runner**: Bun, Vitest

---

## Getting Started

### 1. Prerequisites
- [Bun](https://bun.sh/) (`>= 1.1`)
- A [Neon PostgreSQL](https://neon.tech/) database
- A [Clerk](https://clerk.com/) application

### 2. Install Dependencies
```bash
bun install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and populate your credentials:
```bash
cp .env.example .env.local
```

### 4. Database Migrations & Seed
```bash
bun run db:generate
bun run db:migrate
bun run db:seed
```

### 5. Run Development Server
```bash
bun run dev
```

### 6. Quality Checks
```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

---

## Project Documentation

- [`Architect.md`](./Architect.md) — System architecture, ADRs, directory layout, and data flow.
- [`skills.md`](./skills.md) — Reusable project engineering standards and security patterns.
- [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) — Phased implementation roadmap.
- [`docs/DATABASE.md`](./docs/DATABASE.md) — Relational schema, constraints, and migration guide.
- [`docs/SECURITY.md`](./docs/SECURITY.md) — RBAC, token hashing, file validation, and NDPA compliance.
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — Vercel deployment and external provider configuration.

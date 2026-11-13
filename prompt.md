# WEBSTART
## Master Product Engineering & Implementation Prompt

**Product:** WebStart
**Product Category:** Client Discovery, Website Requirements & Project Initiation Platform
**Document:** Master Agent Instruction / prompt.md
**Deployment Target:** Vercel Free Tier
**Architecture:** Full-stack, serverless, database-backed web application
**Primary Language:** TypeScript

---

# 1. YOUR ROLE AND RESPONSIBILITIES

You are acting as a senior product architect, senior full-stack developer, UI/UX designer, database architect, security engineer, QA engineer and DevOps engineer.

Your responsibility is to design, implement, test and prepare WebStart for production deployment.

Do not approach this as a simple contact form or static website.

WebStart is a structured client onboarding and website project discovery platform that helps a web development agency collect, organise, analyse and convert client requirements into actionable software development documentation.

You must think like a product engineer.

Your implementation must prioritise:

1. Clear architecture.
2. Maintainable code.
3. Good user experience.
4. Data integrity.
5. Security.
6. Responsive design.
7. Reliable form submissions.
8. Deployment simplicity.
9. Low operating costs.
10. Future extensibility.

## 1.1 Working Instructions

Before writing code:

- Inspect the existing repository.
- Identify existing frameworks, dependencies and conventions.
- Do not overwrite existing working code without justification.
- Read available project instructions and architecture documents.
- Identify missing requirements.
- Establish an implementation plan.

If the repository is empty, initialise the application using the architecture defined in this document.

If a critical decision is missing, ask the project owner.
Do not ask questions whose answers can reasonably be handled using the recommended defaults in this specification.

Provide a concise implementation synopsis before major work.

Maintain the following project documentation:

- `README.md`
- `Architect.md`
- `skills.md`
- `CHANGELOG.md`
- `.env.example`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/DATABASE.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`

Update documentation whenever architecture or important implementation decisions change.

## 1.2 Agent Behaviour

Work in clearly defined implementation phases.

At the beginning of each phase, state:

- What is being implemented.
- Why it is necessary.
- Which files or modules are affected.
- What constitutes completion.

At the end of each phase, report:

- What has been completed.
- What was tested.
- What remains incomplete.
- Known issues.
- The next recommended task.

Never claim that a feature works when it has not been tested.

Do not leave important buttons, forms, menus or dashboard actions as decorative placeholders.

If a feature is not implemented, clearly identify it.

---

# 2. PRODUCT VISION

WebStart provides a guided process through which a development agency can onboard a new website client.

It replaces scattered WhatsApp conversations, emails, spreadsheets and unstructured requirement documents with a centralised discovery workflow.

The platform should allow an agency to:

- Register and manage clients.
- Create website discovery projects.
- Invite clients to complete questionnaires.
- Collect business information.
- Understand project objectives.
- Identify target audiences.
- Define website pages and content.
- Collect design and branding requirements.
- Identify functional requirements.
- Collect technical and infrastructure information.
- Establish project budgets and timelines.
- Collect supporting files.
- Review client submissions.
- Identify missing information.
- Generate structured project documentation.
- Track project discovery progress.
- Export completed project briefs.

The platform must be useful for different website categories without forcing every client through the same questionnaire.

---

# 3. PRODUCT USERS AND ACCESS CONTROL

Implement role-based access control.

## 3.1 User Roles

### A. Platform Owner / Super Administrator

The primary agency owner.

Permissions:

- Manage the agency workspace.
- Manage administrators.
- Create and manage clients.
- Create and manage projects.
- Configure questionnaire templates.
- Review all project submissions.
- View and download submitted files.
- Generate project documentation.
- Change project statuses.
- Manage platform settings.

### B. Agency Administrator

Permissions:

- Create and manage clients.
- Create projects.
- Invite clients.
- Review submissions.
- Manage project requirements.
- Generate project briefs.
- Access assigned projects.

### C. Project Manager

Permissions:

- Manage assigned projects.
- Request additional information.
- Add internal notes.
- Generate documentation.

### D. Client

Permissions:
- Access only projects assigned to them.
- Complete questionnaires.
- Save progress.
- Upload documents.
- Review and update responses before submission.
- Respond to clarification requests.

Clients must never access internal agency notes,

## 3.2 Authentication

Use Clerk for authentication.

Implement:

- Secure sign-in.
- Secure sign-out.
- Passwordless or supported email authentication.
- Protected application routes.
- Role-based route access.
- Session-aware navigation.

Store application roles and workspace memberships in PostgreSQL.

Do not rely exclusively on client-editable profile metadata to determine permissions.

Enforce authorization on the server for every sensitive operation.

---

# 4. TECHNOLOGY STACK

Use the following stack unless an existing project constraint

## Frontend

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide icons.
- React Hook Form.
- Zod validation.

## Backend

- Next.js Server Actions where appropriate.
- Next.js Route Handlers for external APIs and integrations.
- Server-side business logic.
- TypeScript.

## Database

- Neon PostgreSQL.
- Drizzle ORM.
- Drizzle Kit for schema migrations.

## Authentication

- Clerk.

## File Storage

Implement a provider-independent storage interface.

Initial recommended provider: Cloudinary.

Support secure uploads, file validation, deletion and download access.

Do not store uploaded binary files directly in PostgreSQL.

Never expose storage API secrets to the browser.

## Deployment

- Vercel.
- Neon PostgreSQL.
- Clerk.
- Cloudinary.

## Package Manager

Use Bun.

Commit the Bun lockfile.

Do not introduce Firebase or Supabase.

Do not introduce MongoDB.

Avoid unnecessary paid services.

---

# 5. APPLICATION STRUCTURE

Build two distinct application experiences.

## 5.1 Public Website

Routes:

- `/`
- `/about`
- `/how-it-works`
- `/contact`
- `/privacy`
- `/terms`
- `/sign-in`
- `/sign-up`

The public homepage should explain:

- What WebStart does.
- Who it serves.
- How the discovery process works.
- Why structured project discovery matters.
- How clients begin their onboarding process.

Include clear calls to action.

Do not make the public website more elaborate than the actual product.

## 5.2 Authenticated Application

Routes:

- `/dashboard`
- `/dashboard/clients`
- `/dashboard/clients/[id]`
- `/dashboard/projects`
- `/dashboard/projects/[id]`
- `/dashboard/templates`
- `/dashboard/users`
- `/dashboard/settings`

Client-facing routes:

- `/portal`
- `/portal/projects/[token]`
- `/portal/projects/[token]/review`
- `/portal/projects/[token]/submitted`

Use a consistent authenticated application layout.

Provide appropriate loading, error, empty and success states.

---

# 6. CORE PRODUCT MODULES

## MODULE A: DASHBOARD

Create an administrative dashboard.

Display:

- Total clients.
- Total projects.
- Projects in progress.
- Completed discovery projects.
- Projects awaiting client submissions.
- Projects requiring clarification.
- Recently created projects.
- Recently submitted questionnaires.
- Outstanding client tasks.

Include project status summaries.

Suggested statuses:

- Draft
- Invitation Sent
- In Progress
- Submitted
- Under Review
- Awaiting Client Response
- Approved
- Archived

Provide quick actions:

- Add Client.
- Create Project.
- Invite Client.
- Review Submissions.

Dashboard figures must come from actual database records.

Do not use fabricated statistics.

## MODULE B: CLIENT MANAGEMENT

Allow administrators to create client records.

Client information:

- Organisation name.
- Organisation type.
- Industry.
- Contact person's name.
- Contact email.
- Phone number.
- WhatsApp number.
- Website address.
- Physical address.
- Country.
- City.
- Business description.
- Social media links.
- Internal notes.

Features:

- Search clients.
- Filter clients.
- View client profile.
- Edit client information.
- View associated projects.
- View project history.
- Archive clients.

Avoid duplicate client records where possible.

## MODULE C: PROJECT MANAGEMENT

Each client may have multiple website projects.

Project fields:

- Project name.
- Project reference number.
- Client ID.
- Website category.
- Project description.
- Project objectives.
- Project manager.
- Project status.
- Creation date.
- Target launch date.
- Estimated budget range.
- Discovery completion percentage.
- Internal notes.

Project creation must allow the administrator to:

1. Select an existing client.
2. Create a new client if necessary.
3. Select a website category.
4. Select a questionnaire template.
5. Set a target completion date.
6. Assign a project manager.
7. Generate a unique invitation link.
8. Send or copy the invitation.

A project must not be publicly accessible simply because its ID is known.

Use secure invitation tokens with expiry and revocation support.

---

# 7. CLIENT DISCOVERY QUESTIONNAIRE ENGINE

This is the central feature of WebStart.

Build a dynamic, configurable questionnaire engine.

The questionnaire must be divided into logical sections.

Clients should be able to:

- Complete one section at a time.
- See their progress.
- Save progress automatically.
- Return later.
- Navigate between completed sections.
- Upload supporting documents.
- Review all answers before submission.
- Submit the completed questionnaire.

Persist responses to the database.

Do not keep the entire questionnaire only in browser state.

## 7.1 Questionnaire Sections

SECTION 1: CLIENT AND BUSINESS INFORMATION

Collect:

- Organisation name.
- Business registration name, if applicable.
- Business description.
- Industry.
- Organisation type.
- Year established.
- Physical address.
- Operating locations.
- Primary contact.
- Contact email.
- Phone number.
- WhatsApp number.
- Existing website.
- Social media links.

SECTION 2: PROJECT OBJECTIVES

Ask:

- Why do you need a website?
- What business problem should it solve?
- What are your primary objectives?
- What should visitors accomplish?
- What would make the project successful?
- Is this a new website or a redesign?
- What are your major expectations?

Allow multiple objectives.

Suggested choices:

- Establish online presence.
- Generate leads.
- Sell products.
- Promote services.
- Publish information.
- Accept online payments.
- Manage customers.
- Manage students or members.
- Automate business processes.
- Other.

Include an explanation field.

SECTION 3: TARGET AUDIENCE

Collect:

- Primary audience.
- Secondary audience.
- Age groups.
- Geographical locations.
- Languages.
- Visitor expectations.
- Typical visitor problems.
- Desired visitor actions.

SECTION 4: WEBSITE STRUCTURE AND CONTENT

Allow the client to select expected pages.

Suggested pages:

- Home.
- About Us.
- Services.
- Products.
- Our Team.
- Projects.
- Portfolio.
- News.
- Blog.
- Gallery.
- Testimonials.
- FAQ.
- Contact.
- Careers.
- Downloads.
- Custom pages.

Allow custom page creation.

For each selected page, allow:

- Page name.
- Purpose.
- Content availability.
- Special requirements.

Ask whether the client will provide content or expects the development agency to assist with content creation.

SECTION 5: DESIGN AND BRANDING

Collect:

- Existing logo availability.
- Logo upload.
- Primary brand colour.
- Secondary brand colour.
- Existing brand guidelines.
- Preferred design style.
- Preferred fonts, if any.
- Existing photography.
- Preferred websites and design references.
- Competitor websites.
- Design preferences.
- Things the client dislikes.

Allow multiple reference URLs.

Allow supporting image uploads.

Suggested design styles:

- Corporate.
- Minimalist.
- Modern.
- Creative.
- Luxury.
- Professional.
- Youthful.
- Traditional.
- Other.

SECTION 6: FUNCTIONAL REQUIREMENTS

Allow clients to select features.

Suggested features:

- Contact forms.
- User registration.
- User login.
- Administrative dashboard.
- Content management.
- Online payments.
- Shopping cart.
- Product management.
- Booking and appointments.
- Search.
- Live chat.
- Email notifications.
- SMS notifications.
- Document downloads.
- Membership management.
- Customer management.
- Reporting.
- Analytics.
- Multiple user roles.
- Approval workflows.
- Third-party integrations.
- API connectivity.
- Other.

IMPORTANT:

Do not stop at feature selection.

For each selected feature, reveal relevant follow-up questions.

Examples:

ONLINE PAYMENT:

- What will customers pay for?
- Which currencies are required?
- Which payment methods are preferred?
- Is automatic payment confirmation required?
- Are refunds necessary?

BOOKING:

- Who manages availability?
- Can users reschedule?
- Are payments required?
- Should booking confirmations be sent?
- Are there different appointment types?

USER ACCOUNTS:

- Who can register?
- Is registration open or invitation-only?
- What user information is required?
- Are different access levels necessary?

E-COMMERCE:

- How many product categories?
- How many products initially?
- Is inventory tracking necessary?
- Are delivery fees required?
- Is order tracking required?
- Are discount codes needed?

Build these as configurable conditional question groups.

SECTION 7: TECHNICAL AND INFRASTRUCTURE REQUIREMENTS

Collect:

- Existing domain.
- Domain registrar.
- Existing hosting provider.
- Hosting access availability.
- Existing source code availability.
- Existing database availability.
- Existing business email.
- Required third-party integrations.
- Expected website traffic.
- Expected number of users.
- Expected data storage.
- Backup requirements.
- Maintenance expectations.

Never ask clients to submit passwords or secret credentials through the questionnaire.

SECTION 8: CONTENT MANAGEMENT

Collect:

- Who will manage the website?
- Who will publish announcements?
- Who will update services?
- Who will upload photographs?
- Who will manage enquiries?
- Number of administrators.
- Required administrative roles.
- Training requirements.

SECTION 9: BUDGET AND TIMELINE

Collect:

- Budget range.
- Preferred launch date.
- Project urgency.
- Preferred payment arrangement.
- Expected revision arrangements.
- Post-launch support requirements.
- Maintenance expectations.

Allow an optional explanation.

SECTION 10: LEGAL AND COMPLIANCE

Collect:

- Privacy policy availability.
- Terms and conditions availability.
- Cookie requirements.
- Copyright ownership.
- Data collection requirements.
- Regulatory requirements.
- Other compliance considerations.

SECTION 11: FINAL REVIEW AND SUBMISSION

Show the client:

- Completed sections.
- Incomplete sections.
- Uploaded documents.
- Selected features.
- Key project expectations.

Allow editing before final submission.

Require explicit confirmation before submission.

After submission:

- Save the final submission timestamp.
- Change project status to Submitted.
- Lock ordinary editing.
- Notify the agency.
- Show a confirmation page.

Allow administrators to reopen a submission or request
clarification.

---

# 8. ADAPTIVE QUESTIONNAIRE TEMPLATES

Do not force every website type into an identical questionnaire.

Provide initial templates for:

1. Corporate / Business Website.
2. E-commerce Website.
3. Educational Institution Website.
4. NGO / Non-profit Website.
5. Personal / Portfolio Website.
6. Web Application / Customer Portal.
7. Custom Website.

The general discovery sections should be reusable.

Specialised sections should appear only when relevant.

Examples:

EDUCATIONAL WEBSITE:

- School name and levels.
- Admission information.
- Academic programmes.
- Student portal requirements.
- Parent portal requirements.
- Online application.
- Fee payments.
- Results and academic records.
- Learning management.
- Staff management.

NGO WEBSITE:

- Mission and vision.
- Programme areas.
- Beneficiaries.
- Donation requirements.
- Volunteer registration.
- Impact reports.
- Events.
- Partnerships.

CORPORATE WEBSITE:

- Business services.
- Service enquiries.
- Portfolio.
- Case studies.
- Lead generation.
- Team profiles.
- Branch locations.

E-COMMERCE:

- Product catalogue.
- Product variations.
- Shopping cart.
- Checkout.
- Payment integration.
- Inventory.
- Shipping.
- Orders.
- Customer accounts.

CUSTOM WEBSITE:

- General discovery.
- Detailed process description.
- User roles.
- Business workflows.
- Integrations.
- Data requirements.
- Reporting.
- Special technical requirements.

Administrators should be able to select and configure templates for future projects.

---

# 9. QUESTIONNAIRE EXPERIENCE

Design the questionnaire as a guided wizard.

Requirements:

- One logical section per screen.
- Clear section titles.
- Short explanatory text.
- Progress indicator.
- Previous and Next controls.
- Save and continue later.
- Autosave with debounce.
- Visible saving and saved indicators.
- Required-field validation.
- Conditional questions.
- Mobile-friendly input controls.
- Helpful examples.
- Clear error messages.

Avoid presenting an overwhelming wall of questions.

Use conditional rendering to keep the experience focused.

Preserve entered data when navigating between sections.

Implement robust autosave error handling.

Do not show a successful save indicator until the server confirms persistence.

Support recovery after browser refresh or session expiry.

---

# 10. FILE UPLOAD SYSTEM

Clients may submit:

- Logos.
- Business profiles.
- Brand guidelines.
- Photographs.
- PDF documents.
- Design references.

Implement:

- Drag-and-drop upload.
- Upload progress.
- File type validation.
- File size limits.
- Secure server-side validation.
- Safe file naming.
- File metadata storage.
- Project ownership verification.
- Authenticated file access.
- File deletion.
- Upload failure recovery.

Do not trust MIME types supplied by the browser alone.

Use a storage adapter so the storage provider can be changed without rewriting application logic.

Never expose Cloudinary API secrets in client-side code.

Do not make private client documents publicly accessible through predictable URLs.

---

# 11. ADMINISTRATIVE REVIEW SYSTEM

Administrators need a detailed project review interface.

For each project, display:

- Client information.
- Project overview.
- Questionnaire responses.
- Selected features.
- Uploaded documents.
- Budget and timeline.
- Completion percentage.
- Outstanding questions.
- Internal notes.
- Activity history.

Provide review actions:

- Mark section as reviewed.
- Flag incomplete information.
- Request clarification.
- Add internal comments.
- Reopen questionnaire.
- Approve discovery.
- Archive project.

Clarification requests should identify the relevant questionnaire section.

Clients should receive a notification and be able to respond to the requested information.

Keep internal notes private.

Maintain an audit trail of significant project actions.

---

# 12. PROJECT DOCUMENT GENERATION

This is a major product differentiator.

After a client submits a questionnaire, administrators should be able to generate a structured project brief.

The generated document should contain:

1. Project identification.
2. Client profile.
3. Business overview.
4. Project background.
5. Business objectives.
6. Target audience.
7. Proposed website structure.
8. Content requirements.
9. Branding and design requirements.
10. Functional requirements.
11. Technical requirements.
12. Integrations.
13. User roles.
14. Infrastructure requirements.
15. Budget expectations.
16. Project timeline.
17. Outstanding questions.
18. Assumptions.
19. Risks and dependencies.
20. Recommended next steps.

Distinguish clearly between:

- Client-provided information.
- Agency observations.
- Technical recommendations.
- Unconfirmed assumptions.

Do not invent client requirements.

Provide:

- HTML preview.
- Printable document layout.
- PDF export.
- Markdown export.

If PDF generation requires a Node-compatible library, ensure it works within the selected Vercel deployment environment.

Generated documents must be based on persisted project data.

Allow administrators to regenerate the brief after approved changes.

---

# 13. DATABASE ARCHITECTURE

Use PostgreSQL with Drizzle ORM.

Design a relational database with appropriate foreign keys, indexes, constraints and timestamps.

Recommended entities:

## users

- id
- clerk_user_id
- email
- full_name
- created_at
- updated_at

## workspaces

- id
- name
- slug
- created_at
- updated_at

## workspace_members

- id
- workspace_id
- user_id
- role
- created_at

## clients

- id
- workspace_id
- organisation_name
- organisation_type
- industry
- business_description
- contact_name
- contact_email
- phone
- whatsapp
- website
- address
- city
- country
- social_links (JSONB)
- created_at
- updated_at

## projects

- id
- workspace_id
- client_id
- project_name
- reference_number
- website_category
- description
- status
- manager_id
- target_launch_date
- budget_range
- created_at
- updated_at
- submitted_at

## questionnaire_templates

- id
- workspace_id
- name
- website_category
- description
- is_active
- version
- created_at
- updated_at

## questionnaire_sections

- id
- template_id
- section_key
- title
- description
- sort_order
- is_required

## questionnaire_questions

- id
- section_id
- question_key
- label
- description
- input_type
- options (JSONB)
- validation_rules (JSONB)
- conditional_rules (JSONB)
- sort_order
- is_required

## project_questionnaire_sessions

- id
- project_id
- template_id
- template_version
- invitation_token_hash
- expires_at
- submitted_at
- created_at
- updated_at

## questionnaire_responses

- id
- session_id
- question_id
- response_value (JSONB)
- created_at
- updated_at

## project_files

- id
- project_id
- uploaded_by
- storage_provider
- storage_key
- original_filename
- mime_type
- file_size
- created_at

## project_notes

- id
- project_id
- author_id
- note
- visibility
- created_at

## project_activity_logs

- id
- project_id
- actor_id
- action
- details (JSONB)
- created_at

## clarification_requests

- id
- project_id
- section_key
- question_key
- message
- status
- requested_by
- resolved_at
- created_at

## project_documents

- id
- project_id
- document_type
- version
- storage_key
- generated_at
- generated_by

Adjust the schema where necessary after architectural review.

Important:

- Use UUID primary keys where appropriate.
- Add workspace ownership to tenant-specific records.
- Add created_at and updated_at consistently.
- Use database transactions for multi-record operations.
- Add appropriate uniqueness constraints.
- Add indexes for frequently queried columns.
- Use migrations.
- Never rely on frontend validation alone.

Store questionnaire answers in a flexible JSONB-compatible format while retaining question and template references.

Preserve historical template versions so that changing a questionnaire template does not corrupt existing submissions.

---

# 14. MULTI-TENANCY AND DATA ISOLATION

Design the application to support multiple agency workspaces.

Every client, project, questionnaire and document must belong to the appropriate workspace.

Implement server-side workspace isolation.

A user must not access another workspace's data by changing a URL or API request.

Do not rely on hidden navigation items as security controls.

Verify workspace membership and permissions on every sensitive server operation.

---

# 15. UI/UX DESIGN SYSTEM

The interface should feel like a polished modern SaaS product.

Design direction:

- Clean.
- Modern.
- Professional.
- Spacious.
- Friendly.
- Minimal.
- Responsive.

Avoid excessive gradients, unnecessary animations and overcrowded dashboard layouts.

Use:

- Consistent spacing.
- Clear typography hierarchy.
- Reusable components.
- Accessible colour contrast.
- Responsive tables.
- Clear status indicators.
- Thoughtful empty states.
- Helpful tooltips.
- Skeleton loading states.
- Toast notifications.

## Suggested Brand Identity

Product: WebStart

Tagline: From client ideas to development-ready projects.

Suggested palette:

- Deep Navy: #202D3B
- Blue: #355C7D
- Soft Background: #F7F9FC
- White: #FFFFFF
- Primary Accent: #A2D514
- Secondary Text: #64748B
- Border: #E2E8F0

Use the palette as a starting point.

Support light mode and dark mode.

## Responsive Requirements

Desktop:

- Sidebar navigation.
- Top navigation bar.
- Main content area.
- Dashboard cards.
- Data tables.

Tablet:

- Collapsible navigation.
- Responsive content grids.

Mobile:

- Mobile navigation.
- Single-column layouts.
- Touch-friendly controls.
- Simplified tables.
- Comfortable questionnaire navigation.

The client questionnaire must be especially well optimised for mobile devices.

---

# 16. SECURITY REQUIREMENTS

Security is not optional.

Implement:

- Server-side authentication checks.
- Role-based authorisation.
- Workspace-level data isolation.
- Input validation using Zod.
- Safe database queries through Drizzle.
- Secure invitation tokens.
- Token hashing at rest.
- Token expiry and revocation.
- Upload validation.
- Rate limiting on sensitive endpoints.
- CSRF protections where applicable.
- Secure cookie handling.
- Environment-variable protection.
- Safe error handling.
- Audit logging.

Never:

- Hardcode API keys.
- Commit `.env` files.
- Expose database credentials.
- Expose private storage secrets.
- Trust client-supplied user roles.
- Trust project IDs without ownership checks.
- Store plaintext invitation secrets.
- Accept arbitrary file uploads.
- Return sensitive database errors to users.

Avoid logging passwords, tokens, private client data or unnecessary personal information.

Implement appropriate data retention and deletion capabilities.

Consider applicable privacy requirements, including the Nigeria Data Protection Act where relevant.

---

# 17. EMAIL AND NOTIFICATIONS

Prepare an optional Resend integration.

Notification events:

- Client invitation.
- Questionnaire reminder.
- Questionnaire submitted.
- Clarification requested.
- Clarification answered.
- Discovery approved.
- Project archived.

Email templates should be reusable.

If email credentials are unavailable:

- Do not break the application.
- Provide copyable invitation links.
- Record the notification state accurately.
- Show a clear configuration warning to administrators.

Do not claim an email has been sent unless the provider confirms successful delivery acceptance.

---

# 18. SEARCH, FILTERING AND REPORTING

Implement administrative search and filters.

Search:

- Client name.
- Organisation.
- Project name.
- Project reference.
- Contact email.

Filters:

- Project status.
- Website category.
- Project manager.
- Creation date.
- Submission date.

Provide basic reporting:

- Projects by status.
- Projects by category.
- Monthly project creation.
- Discovery completion rate.
- Outstanding client submissions.

Reports must use real database data.

---

# 19. PERFORMANCE AND DEPLOYMENT

The application must be suitable for Vercel's free hosting tier and compatible with serverless execution.

Design for:

- Stateless application instances.
- Server-side rendering where appropriate.
- Static generation for public content.
- Efficient database queries.
- Pagination.
- Database connection pooling.
- Optimised images.
- Lazy loading where appropriate.
- Minimal dependencies.
- Efficient client-side JavaScript.

Use Neon serverless-compatible database connections and an appropriate pooled connection string for deployment.

Do not depend on:

- Persistent Node.js processes.
- Local filesystem storage for permanent uploads.
- Long-running background workers.
- Local SQLite production storage.
- In-memory session persistence.
- Server-local files surviving deployments.

Do not assume that a free tier has unlimited usage.

Document potential provider limits and upgrade requirements.

## Required deployment configuration

Prepare:

- `vercel.json` only if necessary.
- `.env.example`.
- Production build configuration.
- Database migration instructions.
- Deployment documentation.
- Health-check endpoint.
- Production error handling.

Required environment variables should be documented.

Examples:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

DATABASE_URL=

NEXT_PUBLIC_APP_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
EMAIL_FROM=

TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

Optional integrations must not prevent the application from starting when they are intentionally unconfigured.

Do not expose secret environment variables through NEXT_PUBLIC_ variables.

Document the distinction between development and production environment variables.

---

# 20. TESTING REQUIREMENTS

Implement a practical test strategy.

## Unit Tests

Test:

- Validation schemas.
- Permission checks.
- Questionnaire completion calculations.
- Conditional question logic.
- Project status transitions.
- Invitation token validation.

## Integration Tests

Test:

- Client creation.
- Project creation.
- Questionnaire persistence.
- Autosave.
- Submission.
- Clarification requests.
- File metadata persistence.
- Document generation.

## End-to-End Tests

Test the following complete journey:

1. Administrator signs in.
2. Administrator creates a client.
3. Administrator creates a project.
4. Administrator generates an invitation.
5. Client opens the invitation.
6. Client completes questionnaire sections.
7. Client uploads supporting files.
8. Client saves progress.
9. Client returns later.
10. Client reviews answers.
11. Client submits the questionnaire.
12. Administrator reviews the submission.
13. Administrator requests clarification.
14. Client responds.
15. Administrator approves discovery.
16. Administrator generates a project brief.

Test responsive behaviour on desktop and mobile.

Test access restrictions by attempting to access another client's project.

---

# 21. IMPLEMENTATION PHASES

Do not attempt to build the entire platform in one unstructured coding session.

Follow this implementation sequence.

## PHASE 0: REPOSITORY AND ARCHITECTURE

- Inspect repository.
- Confirm Bun availability.
- Establish Next.js application structure.
- Configure TypeScript.
- Configure Tailwind.
- Install shadcn/ui.
- Establish linting and formatting.
- Create Architect.md.
- Create implementation plan.

Deliverable:
A clean, documented application foundation.

## PHASE 1: DATABASE AND AUTHENTICATION

- Configure Neon.
- Configure Drizzle.
- Create initial schema.
- Generate migrations.
- Configure Clerk.
- Implement user synchronisation.
- Implement workspace membership.
- Implement role-based permissions.
- Create protected layouts.

Deliverable:
A functional authenticated application foundation.

## PHASE 2: ADMINISTRATIVE FOUNDATION

- Dashboard.
- Client management.
- Project management.
- Search and filters.
- Project status management.

Deliverable:
Administrators can manage clients and projects.

## PHASE 3: QUESTIONNAIRE ENGINE

- Questionnaire templates.
- Sections and questions.
- Conditional question logic.
- Validation.
- Progress tracking.
- Autosave.
- Invitation tokens.
- Client portal.

Deliverable:
Clients can complete and save discovery questionnaires.

## PHASE 4: FILE UPLOADS AND REVIEW

- Storage integration.
- File management.
- Administrative review.
- Internal notes.
- Clarification requests.
- Activity history.

Deliverable:
A complete client-to-agency discovery workflow.

## PHASE 5: DOCUMENT GENERATION

- Project brief builder.
- HTML preview.
- PDF export.
- Markdown export.
- Document versioning.

Deliverable:
Administrators can convert submitted requirements into structured project documentation.

## PHASE 6: NOTIFICATIONS AND REPORTING

- Email templates.
- Invitation notifications.
- Submission notifications.
- Clarification notifications.
- Dashboard statistics.
- Reports.

Deliverable:
A more complete agency management experience.

## PHASE 7: QUALITY ASSURANCE

- Unit tests.
- Integration tests.
- End-to-end tests.
- Responsive testing.
- Security review.
- Performance review.
- Error handling.
- Accessibility checks.

Deliverable:
A tested release candidate.

## PHASE 8: DEPLOYMENT

- Configure Vercel.
- Configure Neon production database.
- Configure Clerk production instance.
- Configure file storage.
- Configure environment variables.
- Run production migrations.
- Deploy.
- Test production workflows.
- Document handover.

Deliverable:
A working production deployment.

---

# 22. MVP PRIORITIES

The first release must not become unnecessarily complex.

Prioritise the following:

MUST HAVE:

- Authentication.
- Administrator dashboard.
- Client management.
- Project management.
- Secure client invitations.
- Adaptive questionnaire.
- Autosave.
- File uploads.
- Questionnaire submission.
- Administrative review.
- Project brief generation.
- PDF export.
- Responsive interface.
- Vercel deployment.

SHOULD HAVE:

- Email notifications.
- Clarification requests.
- Activity history.
- Questionnaire template management.
- Basic reports.
- Markdown export.

FUTURE:

- AI-assisted requirements analysis.
- AI-generated technical recommendations.
- AI-generated preliminary project estimates.
- Proposal generation.
- Client approval workflows.
- Agency branding and white-labelling.
- Multiple agency workspaces.
- Subscription billing.
- External project management integrations.
- Automated development handoff.

Do not implement future features before the core workflow is stable.

---

# 23. AI-READINESS

Design the application so that AI capabilities can be introduced later without restructuring the entire system.

Future AI functionality may include:

- Summarising client requirements.
- Identifying missing requirements.
- Detecting conflicting answers.
- Recommending website architecture.
- Suggesting suitable technology stacks.
- Generating preliminary sitemaps.
- Producing technical requirement documents.
- Identifying project risks.
- Generating development estimates.

For now, implement a reliable rule-based project brief generation system.

Never allow AI-generated recommendations to silently overwrite original client responses.

Keep client-provided information separate from AI-generated suggestions.

---

# 24. DEFINITION OF DONE

A feature is complete only when:

- Its interface is implemented.
- Its business logic works.
- Data is persisted correctly.
- Validation is implemented.
- Access permissions are enforced.
- Loading states exist.
- Error states exist.
- Empty states exist where applicable.
- Relevant tests pass.
- Documentation is updated.

The MVP is ready for release when:

1. An administrator can sign in.
2. An administrator can create a client.
3. An administrator can create a project.
4. An administrator can invite a client.
5. The client can access the invitation securely.
6. The client can complete the correct questionnaire.
7. The client can save and resume progress.
8. The client can upload supporting documents.
9. The client can submit the questionnaire.
10. The administrator can review the submission.
11. The administrator can request clarification.
12. The administrator can approve discovery.
13. The administrator can generate and export a development-ready project brief.
14. Unauthorised users cannot access private information.
15. The application works on desktop and mobile.
16. The application builds and deploys successfully.

---

# 25. FINAL INSTRUCTION TO THE CODING AGENT

Build WebStart as a serious, maintainable software product.

Do not sacrifice architecture for speed.

Do not overengineer the MVP.

Do not install unnecessary dependencies.

Do not introduce alternative technologies without documenting why.

Do not create fake data in production.

Use seed data only for development and demonstration.

Keep business logic separate from presentation logic.

Use reusable components and consistent naming conventions.

Prefer straightforward, readable code over clever abstractions.

Whenever you encounter a technical limitation, explain the limitation and recommend a practical alternative.

Maintain an accurate implementation checklist.

At every major milestone, run the appropriate tests.

Before declaring the project complete:

- Run linting.
- Run type checking.
- Run tests.
- Run the production build.
- Inspect the generated routes.
- Verify authentication.
- Verify workspace isolation.
- Verify the complete client onboarding workflow.
- Verify deployment configuration.

Your ultimate objective is not merely to produce a website that looks good.

Your objective is to deliver a working platform that an agency can use repeatedly to transform client ideas into clear, structured and development-ready projects.

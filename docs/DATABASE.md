# WebStart — Database Architecture (`docs/DATABASE.md`)

**Database Engine:** Neon Serverless PostgreSQL  
**ORM & Migrations:** Drizzle ORM + Drizzle Kit  

---

## 1. Design Principles

1. **Multi-Tenant Isolation**: Every tenant-specific entity (`clients`, `projects`, `questionnaire_templates`, etc.) stores a non-nullable `workspace_id` foreign key referencing `workspaces.id`.
2. **UUID Primary Keys**: All primary keys use PostgreSQL `uuid` (`defaultRandom()`).
3. **Immutable Template Versioning**: When a `project_questionnaire_sessions` record is created, it records both `template_id` and `template_version` (along with a JSONB snapshot of sections/questions) so editing a questionnaire template never corrupts historical submissions.
4. **Hashed Secrets at Rest**: Invitation tokens are never stored in plaintext. Only `invitation_token_hash` (SHA-256 hex digest) is persisted.
5. **Flexible JSONB + Relational Integrity**: Questionnaire answers are stored in `questionnaire_responses.response_value` (`jsonb`) keyed by `session_id` and `question_id` (`UNIQUE(session_id, question_id)`), enabling fast `ON CONFLICT DO UPDATE` autosaves.

---

## 2. Core Entities

- `users`: Synchronized from Clerk (`id`, `clerk_user_id`, `email`, `full_name`, `created_at`, `updated_at`).
- `workspaces`: Agency tenant workspaces (`id`, `name`, `slug`, `created_at`, `updated_at`).
- `workspace_members`: Role assignments (`id`, `workspace_id`, `user_id`, `role`, `created_at`).
- `clients`: Agency client organisations (`id`, `workspace_id`, `organisation_name`, `organisation_type`, `industry`, `business_description`, `contact_name`, `contact_email`, `phone`, `whatsapp`, `website`, `address`, `city`, `country`, `social_links`, `internal_notes`, `is_archived`, `created_at`, `updated_at`).
- `projects`: Website discovery projects (`id`, `workspace_id`, `client_id`, `project_name`, `reference_number`, `website_category`, `description`, `objectives`, `status`, `manager_id`, `target_launch_date`, `budget_range`, `completion_percentage`, `internal_notes`, `created_at`, `updated_at`, `submitted_at`).
- `questionnaire_templates`: Configurable category templates (`id`, `workspace_id`, `name`, `website_category`, `description`, `is_active`, `version`, `created_at`, `updated_at`).
- `questionnaire_sections`: Logical wizard steps (`id`, `template_id`, `section_key`, `title`, `description`, `sort_order`, `is_required`).
- `questionnaire_questions`: Individual prompts & conditional follow-ups (`id`, `section_id`, `question_key`, `label`, `description`, `input_type`, `options`, `validation_rules`, `conditional_rules`, `sort_order`, `is_required`).
- `project_questionnaire_sessions`: Active/completed client discovery sessions (`id`, `project_id`, `template_id`, `template_version`, `template_snapshot`, `section_review_states`, `invitation_token_hash`, `expires_at`, `revoked_at`, `submitted_at`, `created_at`, `updated_at`).
- `questionnaire_responses`: Persisted answers (`id`, `session_id`, `question_id`, `question_key`, `section_key`, `response_value`, `created_at`, `updated_at`).
- `project_files`: Uploaded asset metadata (`id`, `project_id`, `section_key`, `category`, `uploaded_by`, `storage_provider`, `storage_key`, `original_filename`, `mime_type`, `file_size`, `created_at`).
- `project_notes`: Internal agency notes & observations (`id`, `project_id`, `author_id`, `note`, `visibility`, `created_at`).
- `project_activity_logs`: Immutable audit log (`id`, `project_id`, `actor_id`, `action`, `details`, `created_at`).
- `clarification_requests`: Section/question clarification workflow (`id`, `project_id`, `section_key`, `question_key`, `message`, `client_response`, `status`, `requested_by`, `resolved_at`, `created_at`).
- `project_documents`: Generated 20-section project briefs (`id`, `project_id`, `document_type`, `version`, `content_snapshot`, `storage_key`, `generated_at`, `generated_by`).

---

## 3. Migration Workflow

```bash
# 1. Generate SQL migrations after editing src/db/schema.ts
bun run db:generate

# 2. Apply migrations to Neon PostgreSQL
bun run db:migrate

# 3. Seed default workspace & 7 adaptive templates (development/initial setup)
bun run db:seed
```

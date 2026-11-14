CREATE TYPE "public"."clarification_status" AS ENUM('OPEN', 'ANSWERED', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('PROJECT_BRIEF', 'MARKDOWN_EXPORT', 'PDF_EXPORT');--> statement-breakpoint
CREATE TYPE "public"."note_visibility" AS ENUM('INTERNAL', 'BRIEF_OBSERVATION');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('DRAFT', 'INVITATION_SENT', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'AWAITING_CLIENT_RESPONSE', 'APPROVED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."question_input_type" AS ENUM('TEXT', 'TEXTAREA', 'SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX', 'NUMBER', 'DATE', 'URL', 'EMAIL', 'COLOR', 'PAGE_BUILDER', 'FILE_UPLOAD');--> statement-breakpoint
CREATE TYPE "public"."website_category" AS ENUM('CORPORATE', 'ECOMMERCE', 'EDUCATION', 'NGO', 'PORTFOLIO', 'WEB_APP', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."workspace_role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'CLIENT');--> statement-breakpoint
CREATE TABLE "clarification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"section_key" text NOT NULL,
	"question_key" text,
	"message" text NOT NULL,
	"client_response" text,
	"status" "clarification_status" DEFAULT 'OPEN' NOT NULL,
	"requested_by" uuid NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"organisation_name" text NOT NULL,
	"organisation_type" text,
	"industry" text,
	"business_description" text,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"phone" text,
	"whatsapp" text,
	"website" text,
	"address" text,
	"city" text,
	"country" text,
	"social_links" jsonb DEFAULT '{}'::jsonb,
	"internal_notes" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_label" text DEFAULT 'System' NOT NULL,
	"action" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"document_type" "document_type" DEFAULT 'PROJECT_BRIEF' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"storage_key" text NOT NULL,
	"content_snapshot" jsonb DEFAULT '{}'::jsonb,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"generated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "project_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"section_key" text DEFAULT 'general',
	"category" text DEFAULT 'supporting_document',
	"uploaded_by" text NOT NULL,
	"storage_provider" text DEFAULT 'cloudinary' NOT NULL,
	"storage_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"note" text NOT NULL,
	"visibility" "note_visibility" DEFAULT 'INTERNAL' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_questionnaire_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"template_version" integer DEFAULT 1 NOT NULL,
	"invitation_token_hash" text NOT NULL,
	"section_review_states" jsonb DEFAULT '{}'::jsonb,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"project_name" text NOT NULL,
	"reference_number" text NOT NULL,
	"website_category" "website_category" DEFAULT 'CORPORATE' NOT NULL,
	"description" text,
	"objectives" text,
	"status" "project_status" DEFAULT 'DRAFT' NOT NULL,
	"manager_id" uuid,
	"target_launch_date" timestamp with time zone,
	"budget_range" text,
	"completion_percentage" integer DEFAULT 0 NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "questionnaire_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"question_key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"input_type" "question_input_type" DEFAULT 'TEXT' NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb,
	"validation_rules" jsonb DEFAULT '{}'::jsonb,
	"conditional_rules" jsonb DEFAULT 'null'::jsonb,
	"sort_order" integer DEFAULT 1 NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaire_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_key" text NOT NULL,
	"section_key" text NOT NULL,
	"response_value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaire_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"section_key" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 1 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaire_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"website_category" "website_category" NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "workspace_role" DEFAULT 'ADMIN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clarification_requests" ADD CONSTRAINT "clarification_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clarification_requests" ADD CONSTRAINT "clarification_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_activity_logs" ADD CONSTRAINT "project_activity_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_activity_logs" ADD CONSTRAINT "project_activity_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_questionnaire_sessions" ADD CONSTRAINT "project_questionnaire_sessions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_questionnaire_sessions" ADD CONSTRAINT "project_questionnaire_sessions_template_id_questionnaire_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."questionnaire_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_questions" ADD CONSTRAINT "questionnaire_questions_section_id_questionnaire_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."questionnaire_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_session_id_project_questionnaire_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."project_questionnaire_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_question_id_questionnaire_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questionnaire_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_sections" ADD CONSTRAINT "questionnaire_sections_template_id_questionnaire_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."questionnaire_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_templates" ADD CONSTRAINT "questionnaire_templates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clarification_requests_project_idx" ON "clarification_requests" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "clarification_requests_status_idx" ON "clarification_requests" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "clients_workspace_idx" ON "clients" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "clients_contact_email_idx" ON "clients" USING btree ("workspace_id","contact_email");--> statement-breakpoint
CREATE INDEX "clients_org_name_idx" ON "clients" USING btree ("workspace_id","organisation_name");--> statement-breakpoint
CREATE INDEX "project_activity_logs_project_idx" ON "project_activity_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_documents_project_idx" ON "project_documents" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_documents_project_type_version_idx" ON "project_documents" USING btree ("project_id","document_type","version");--> statement-breakpoint
CREATE INDEX "project_files_project_idx" ON "project_files" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_notes_project_idx" ON "project_notes" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_sessions_token_hash_idx" ON "project_questionnaire_sessions" USING btree ("invitation_token_hash");--> statement-breakpoint
CREATE INDEX "project_sessions_project_idx" ON "project_questionnaire_sessions" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_workspace_ref_idx" ON "projects" USING btree ("workspace_id","reference_number");--> statement-breakpoint
CREATE INDEX "projects_workspace_status_idx" ON "projects" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "projects_client_idx" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE UNIQUE INDEX "questionnaire_questions_section_key_idx" ON "questionnaire_questions" USING btree ("section_id","question_key");--> statement-breakpoint
CREATE INDEX "questionnaire_questions_sort_idx" ON "questionnaire_questions" USING btree ("section_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "questionnaire_responses_session_question_idx" ON "questionnaire_responses" USING btree ("session_id","question_id");--> statement-breakpoint
CREATE INDEX "questionnaire_responses_session_key_idx" ON "questionnaire_responses" USING btree ("session_id","question_key");--> statement-breakpoint
CREATE UNIQUE INDEX "questionnaire_sections_template_key_idx" ON "questionnaire_sections" USING btree ("template_id","section_key");--> statement-breakpoint
CREATE INDEX "questionnaire_sections_sort_idx" ON "questionnaire_sections" USING btree ("template_id","sort_order");--> statement-breakpoint
CREATE INDEX "questionnaire_templates_workspace_idx" ON "questionnaire_templates" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "questionnaire_templates_category_idx" ON "questionnaire_templates" USING btree ("workspace_id","website_category");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_user_idx" ON "workspace_members" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "workspace_members_user_idx" ON "workspace_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspaces_slug_idx" ON "workspaces" USING btree ("slug");
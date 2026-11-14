import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// -----------------------------------------------------------------------------
// 1. Enums
// -----------------------------------------------------------------------------

export const workspaceRoleEnum = pgEnum("workspace_role", [
  "SUPER_ADMIN",
  "ADMIN",
  "PROJECT_MANAGER",
  "CLIENT",
]);

export const websiteCategoryEnum = pgEnum("website_category", [
  "CORPORATE",
  "ECOMMERCE",
  "EDUCATION",
  "NGO",
  "PORTFOLIO",
  "WEB_APP",
  "CUSTOM",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "DRAFT",
  "INVITATION_SENT",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "AWAITING_CLIENT_RESPONSE",
  "APPROVED",
  "ARCHIVED",
]);

export const questionInputTypeEnum = pgEnum("question_input_type", [
  "TEXT",
  "TEXTAREA",
  "SELECT",
  "MULTI_SELECT",
  "RADIO",
  "CHECKBOX",
  "NUMBER",
  "DATE",
  "URL",
  "EMAIL",
  "COLOR",
  "PAGE_BUILDER",
  "FILE_UPLOAD",
]);

export const noteVisibilityEnum = pgEnum("note_visibility", [
  "INTERNAL",
  "BRIEF_OBSERVATION",
]);

export const clarificationStatusEnum = pgEnum("clarification_status", [
  "OPEN",
  "ANSWERED",
  "RESOLVED",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "PROJECT_BRIEF",
  "MARKDOWN_EXPORT",
  "PDF_EXPORT",
]);

// -----------------------------------------------------------------------------
// 2. JSONB Type Definitions
// -----------------------------------------------------------------------------

export interface SocialLinksJson {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  other?: string;
}

export interface QuestionOptionItem {
  value: string;
  label: string;
  description?: string;
}

export interface ValidationRulesJson {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  placeholder?: string;
  exampleText?: string;
}

export interface ConditionalConditionItem {
  questionKey: string;
  comparator: "EQUALS" | "NOT_EQUALS" | "INCLUDES" | "NOT_EMPTY";
  value?: string | number | boolean;
}

export interface ConditionalRulesJson {
  operator: "AND" | "OR";
  conditions: ConditionalConditionItem[];
}

export type SectionReviewStatus =
  | "PENDING"
  | "REVIEWED"
  | "FLAGGED"
  | "NEEDS_CLARIFICATION";

// -----------------------------------------------------------------------------
// 3. Relational Tables (Section 13 Specification)
// -----------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_clerk_user_id_idx").on(table.clerkUserId),
    index("users_email_idx").on(table.email),
  ]
);

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("workspaces_slug_idx").on(table.slug)]
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: workspaceRoleEnum("role").notNull().default("ADMIN"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("workspace_members_workspace_user_idx").on(
      table.workspaceId,
      table.userId
    ),
    index("workspace_members_user_idx").on(table.userId),
  ]
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    organisationName: text("organisation_name").notNull(),
    organisationType: text("organisation_type"),
    industry: text("industry"),
    businessDescription: text("business_description"),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    website: text("website"),
    address: text("address"),
    city: text("city"),
    country: text("country"),
    socialLinks: jsonb("social_links").$type<SocialLinksJson>().default({}),
    internalNotes: text("internal_notes"),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("clients_workspace_idx").on(table.workspaceId),
    index("clients_contact_email_idx").on(table.workspaceId, table.contactEmail),
    index("clients_org_name_idx").on(table.workspaceId, table.organisationName),
  ]
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    projectName: text("project_name").notNull(),
    referenceNumber: text("reference_number").notNull(),
    websiteCategory: websiteCategoryEnum("website_category")
      .notNull()
      .default("CORPORATE"),
    description: text("description"),
    objectives: text("objectives"),
    status: projectStatusEnum("status").notNull().default("DRAFT"),
    managerId: uuid("manager_id").references(() => users.id, {
      onDelete: "set null",
    }),
    targetLaunchDate: timestamp("target_launch_date", { withTimezone: true }),
    budgetRange: text("budget_range"),
    completionPercentage: integer("completion_percentage").notNull().default(0),
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("projects_workspace_ref_idx").on(
      table.workspaceId,
      table.referenceNumber
    ),
    index("projects_workspace_status_idx").on(table.workspaceId, table.status),
    index("projects_client_idx").on(table.clientId),
  ]
);

export const questionnaireTemplates = pgTable(
  "questionnaire_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    websiteCategory: websiteCategoryEnum("website_category").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("questionnaire_templates_workspace_idx").on(table.workspaceId),
    index("questionnaire_templates_category_idx").on(
      table.workspaceId,
      table.websiteCategory
    ),
  ]
);

export const questionnaireSections = pgTable(
  "questionnaire_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => questionnaireTemplates.id, { onDelete: "cascade" }),
    sectionKey: text("section_key").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(1),
    isRequired: boolean("is_required").notNull().default(true),
  },
  (table) => [
    uniqueIndex("questionnaire_sections_template_key_idx").on(
      table.templateId,
      table.sectionKey
    ),
    index("questionnaire_sections_sort_idx").on(
      table.templateId,
      table.sortOrder
    ),
  ]
);

export const questionnaireQuestions = pgTable(
  "questionnaire_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => questionnaireSections.id, { onDelete: "cascade" }),
    questionKey: text("question_key").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    inputType: questionInputTypeEnum("input_type").notNull().default("TEXT"),
    options: jsonb("options").$type<QuestionOptionItem[]>().default([]),
    validationRules: jsonb("validation_rules")
      .$type<ValidationRulesJson>()
      .default({}),
    conditionalRules: jsonb("conditional_rules")
      .$type<ConditionalRulesJson | null>()
      .default(null),
    sortOrder: integer("sort_order").notNull().default(1),
    isRequired: boolean("is_required").notNull().default(false),
  },
  (table) => [
    uniqueIndex("questionnaire_questions_section_key_idx").on(
      table.sectionId,
      table.questionKey
    ),
    index("questionnaire_questions_sort_idx").on(
      table.sectionId,
      table.sortOrder
    ),
  ]
);

export const projectQuestionnaireSessions = pgTable(
  "project_questionnaire_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => questionnaireTemplates.id, { onDelete: "restrict" }),
    templateVersion: integer("template_version").notNull().default(1),
    invitationTokenHash: text("invitation_token_hash").notNull(),
    sectionReviewStates: jsonb("section_review_states")
      .$type<Record<string, SectionReviewStatus>>()
      .default({}),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("project_sessions_token_hash_idx").on(
      table.invitationTokenHash
    ),
    index("project_sessions_project_idx").on(table.projectId),
  ]
);

export const questionnaireResponses = pgTable(
  "questionnaire_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => projectQuestionnaireSessions.id, {
        onDelete: "cascade",
      }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questionnaireQuestions.id, { onDelete: "cascade" }),
    questionKey: text("question_key").notNull(),
    sectionKey: text("section_key").notNull(),
    responseValue: jsonb("response_value").$type<unknown>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("questionnaire_responses_session_question_idx").on(
      table.sessionId,
      table.questionId
    ),
    index("questionnaire_responses_session_key_idx").on(
      table.sessionId,
      table.questionKey
    ),
  ]
);

export const projectFiles = pgTable(
  "project_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sectionKey: text("section_key").default("general"),
    category: text("category").default("supporting_document"),
    uploadedBy: text("uploaded_by").notNull(),
    storageProvider: text("storage_provider").notNull().default("cloudinary"),
    storageKey: text("storage_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("project_files_project_idx").on(table.projectId)]
);

export const projectNotes = pgTable(
  "project_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    note: text("note").notNull(),
    visibility: noteVisibilityEnum("visibility").notNull().default("INTERNAL"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("project_notes_project_idx").on(table.projectId)]
);

export const projectActivityLogs = pgTable(
  "project_activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorLabel: text("actor_label").notNull().default("System"),
    action: text("action").notNull(),
    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("project_activity_logs_project_idx").on(table.projectId)]
);

export const clarificationRequests = pgTable(
  "clarification_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sectionKey: text("section_key").notNull(),
    questionKey: text("question_key"),
    message: text("message").notNull(),
    clientResponse: text("client_response"),
    status: clarificationStatusEnum("status").notNull().default("OPEN"),
    requestedBy: uuid("requested_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("clarification_requests_project_idx").on(table.projectId),
    index("clarification_requests_status_idx").on(
      table.projectId,
      table.status
    ),
  ]
);

export const projectDocuments = pgTable(
  "project_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    documentType: documentTypeEnum("document_type")
      .notNull()
      .default("PROJECT_BRIEF"),
    version: integer("version").notNull().default(1),
    storageKey: text("storage_key").notNull(),
    contentSnapshot: jsonb("content_snapshot")
      .$type<Record<string, unknown>>()
      .default({}),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    generatedBy: uuid("generated_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("project_documents_project_idx").on(table.projectId),
    uniqueIndex("project_documents_project_type_version_idx").on(
      table.projectId,
      table.documentType,
      table.version
    ),
  ]
);

// -----------------------------------------------------------------------------
// 4. Drizzle Relations
// -----------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  workspaceMemberships: many(workspaceMembers),
  managedProjects: many(projects),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  clients: many(clients),
  projects: many(projects),
  templates: many(questionnaireTemplates),
}));

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    user: one(users, {
      fields: [workspaceMembers.userId],
      references: [users.id],
    }),
  })
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [clients.workspaceId],
    references: [workspaces.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  manager: one(users, {
    fields: [projects.managerId],
    references: [users.id],
  }),
  sessions: many(projectQuestionnaireSessions),
  files: many(projectFiles),
  notes: many(projectNotes),
  activityLogs: many(projectActivityLogs),
  clarificationRequests: many(clarificationRequests),
  documents: many(projectDocuments),
}));

export const questionnaireTemplatesRelations = relations(
  questionnaireTemplates,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [questionnaireTemplates.workspaceId],
      references: [workspaces.id],
    }),
    sections: many(questionnaireSections),
    sessions: many(projectQuestionnaireSessions),
  })
);

export const questionnaireSectionsRelations = relations(
  questionnaireSections,
  ({ one, many }) => ({
    template: one(questionnaireTemplates, {
      fields: [questionnaireSections.templateId],
      references: [questionnaireTemplates.id],
    }),
    questions: many(questionnaireQuestions),
  })
);

export const questionnaireQuestionsRelations = relations(
  questionnaireQuestions,
  ({ one, many }) => ({
    section: one(questionnaireSections, {
      fields: [questionnaireQuestions.sectionId],
      references: [questionnaireSections.id],
    }),
    responses: many(questionnaireResponses),
  })
);

export const projectQuestionnaireSessionsRelations = relations(
  projectQuestionnaireSessions,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [projectQuestionnaireSessions.projectId],
      references: [projects.id],
    }),
    template: one(questionnaireTemplates, {
      fields: [projectQuestionnaireSessions.templateId],
      references: [questionnaireTemplates.id],
    }),
    responses: many(questionnaireResponses),
  })
);

export const questionnaireResponsesRelations = relations(
  questionnaireResponses,
  ({ one }) => ({
    session: one(projectQuestionnaireSessions, {
      fields: [questionnaireResponses.sessionId],
      references: [projectQuestionnaireSessions.id],
    }),
    question: one(questionnaireQuestions, {
      fields: [questionnaireResponses.questionId],
      references: [questionnaireQuestions.id],
    }),
  })
);

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
}));

export const projectNotesRelations = relations(projectNotes, ({ one }) => ({
  project: one(projects, {
    fields: [projectNotes.projectId],
    references: [projects.id],
  }),
  author: one(users, {
    fields: [projectNotes.authorId],
    references: [users.id],
  }),
}));

export const projectActivityLogsRelations = relations(
  projectActivityLogs,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectActivityLogs.projectId],
      references: [projects.id],
    }),
    actor: one(users, {
      fields: [projectActivityLogs.actorId],
      references: [users.id],
    }),
  })
);

export const clarificationRequestsRelations = relations(
  clarificationRequests,
  ({ one }) => ({
    project: one(projects, {
      fields: [clarificationRequests.projectId],
      references: [projects.id],
    }),
    requester: one(users, {
      fields: [clarificationRequests.requestedBy],
      references: [users.id],
    }),
  })
);

export const projectDocumentsRelations = relations(
  projectDocuments,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectDocuments.projectId],
      references: [projects.id],
    }),
    generator: one(users, {
      fields: [projectDocuments.generatedBy],
      references: [users.id],
    }),
  })
);

// -----------------------------------------------------------------------------
// 5. Inferred Entity Types
// -----------------------------------------------------------------------------

export type UserRecord = typeof users.$inferSelect;
export type WorkspaceRecord = typeof workspaces.$inferSelect;
export type WorkspaceMemberRecord = typeof workspaceMembers.$inferSelect;
export type ClientRecord = typeof clients.$inferSelect;
export type ProjectRecord = typeof projects.$inferSelect;
export type QuestionnaireTemplateRecord =
  typeof questionnaireTemplates.$inferSelect;
export type QuestionnaireSectionRecord =
  typeof questionnaireSections.$inferSelect;
export type QuestionnaireQuestionRecord =
  typeof questionnaireQuestions.$inferSelect;
export type ProjectQuestionnaireSessionRecord =
  typeof projectQuestionnaireSessions.$inferSelect;
export type QuestionnaireResponseRecord =
  typeof questionnaireResponses.$inferSelect;
export type ProjectFileRecord = typeof projectFiles.$inferSelect;
export type ProjectNoteRecord = typeof projectNotes.$inferSelect;
export type ProjectActivityLogRecord = typeof projectActivityLogs.$inferSelect;
export type ClarificationRequestRecord =
  typeof clarificationRequests.$inferSelect;
export type ProjectDocumentRecord = typeof projectDocuments.$inferSelect;

export type WorkspaceRole = (typeof workspaceRoleEnum.enumValues)[number];
export type WebsiteCategory = (typeof websiteCategoryEnum.enumValues)[number];
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type QuestionInputType =
  (typeof questionInputTypeEnum.enumValues)[number];
export type NoteVisibility = (typeof noteVisibilityEnum.enumValues)[number];
export type ClarificationStatus =
  (typeof clarificationStatusEnum.enumValues)[number];
export type DocumentType = (typeof documentTypeEnum.enumValues)[number];

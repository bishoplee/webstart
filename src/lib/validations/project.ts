import { z } from "zod";
import {
  projectStatusEnum,
  websiteCategoryEnum,
} from "@/db/schema";

export const WEBSITE_CATEGORY_LABELS: Record<
  (typeof websiteCategoryEnum.enumValues)[number],
  string
> = {
  CORPORATE: "Corporate / Business Website",
  ECOMMERCE: "E-Commerce Website",
  EDUCATION: "Educational Institution Website",
  NGO: "NGO / Non-Profit Website",
  PORTFOLIO: "Personal / Portfolio Website",
  WEB_APP: "Web Application / Customer Portal",
  CUSTOM: "Custom Website / Platform",
};

export const PROJECT_STATUS_LABELS: Record<
  (typeof projectStatusEnum.enumValues)[number],
  string
> = {
  DRAFT: "Draft",
  INVITATION_SENT: "Invitation Sent",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  AWAITING_CLIENT_RESPONSE: "Awaiting Client Response",
  APPROVED: "Approved",
  ARCHIVED: "Archived",
};

export const projectCreateSchema = z
  .object({
    clientMode: z.enum(["existing", "new"]).default("existing"),
    clientId: z.string().uuid().optional().or(z.literal("")),
    // Inline new client fields when clientMode === "new"
    newOrganisationName: z.string().trim().optional().or(z.literal("")),
    newOrganisationType: z.string().trim().optional().or(z.literal("")),
    newIndustry: z.string().trim().optional().or(z.literal("")),
    newContactName: z.string().trim().optional().or(z.literal("")),
    newContactEmail: z.string().trim().optional().or(z.literal("")),
    newPhone: z.string().trim().optional().or(z.literal("")),

    projectName: z
      .string()
      .trim()
      .min(3, "Project name must be at least 3 characters.")
      .max(160, "Project name is too long."),
    websiteCategory: z.enum(websiteCategoryEnum.enumValues),
    templateId: z.string().min(1, "Please select a questionnaire template."),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    objectives: z.string().trim().max(2000).optional().or(z.literal("")),
    managerId: z.string().optional().or(z.literal("")),
    targetLaunchDate: z.string().optional().or(z.literal("")),
    budgetRange: z.string().trim().max(120).optional().or(z.literal("")),
    internalNotes: z.string().trim().max(4000).optional().or(z.literal("")),
    generateInvitationImmediately: z.boolean().default(true),
    invitationExpiryDays: z.coerce.number().int().min(1).max(180).default(30),
  })
  .superRefine((data, ctx) => {
    if (data.clientMode === "existing" && !data.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["clientId"],
        message: "Please select an existing client.",
      });
    }
    if (data.clientMode === "new") {
      if (!data.newOrganisationName || data.newOrganisationName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newOrganisationName"],
          message: "Organisation name is required for a new client.",
        });
      }
      if (!data.newContactName || data.newContactName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newContactName"],
          message: "Contact person's name is required for a new client.",
        });
      }
      if (
        !data.newContactEmail ||
        !z.string().email().safeParse(data.newContactEmail).success
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newContactEmail"],
          message: "A valid contact email is required for a new client.",
        });
      }
    }
  });

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

export const projectStatusUpdateSchema = z.object({
  projectId: z.string().min(1),
  nextStatus: z.enum(projectStatusEnum.enumValues),
  reason: z.string().trim().max(500).optional(),
});

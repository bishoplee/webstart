"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspaceContext } from "@/lib/auth/context";
import {
  projectCreateSchema,
  projectStatusUpdateSchema,
  type ProjectCreateInput,
} from "@/lib/validations/project";
import {
  createClientRecord,
  createProjectWithSession,
  rotateOrRevokeInvitationToken,
  transitionProjectStatus,
} from "@/lib/data/repository";
import type { ProjectRecord, ProjectStatus } from "@/db/schema";
import type { ActionResult } from "./clients";

export async function createProjectAction(
  rawInput: ProjectCreateInput
): Promise<
  ActionResult<{
    project: ProjectRecord;
    rawInvitationToken: string;
    invitationPath: string;
  }>
> {
  try {
    const ctx = await requireWorkspaceContext("projects:create");
    const parsed = projectCreateSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please review the project fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;
    let targetClientId = data.clientId ?? "";

    // Inline client creation if requested
    if (data.clientMode === "new") {
      const createdClient = createClientRecord(ctx.workspaceId, {
        organisationName: data.newOrganisationName!,
        organisationType: data.newOrganisationType,
        industry: data.newIndustry,
        contactName: data.newContactName!,
        contactEmail: data.newContactEmail!,
        phone: data.newPhone,
      });
      targetClientId = createdClient.id;
    }

    const result = createProjectWithSession({
      workspaceId: ctx.workspaceId,
      actorId: ctx.userId,
      actorLabel: ctx.fullName,
      clientId: targetClientId,
      projectName: data.projectName,
      websiteCategory: data.websiteCategory,
      templateId: data.templateId,
      description: data.description,
      objectives: data.objectives,
      managerId: data.managerId || ctx.userId,
      targetLaunchDate: data.targetLaunchDate
        ? new Date(data.targetLaunchDate)
        : null,
      budgetRange: data.budgetRange,
      internalNotes: data.internalNotes,
      generateInvitationImmediately: data.generateInvitationImmediately,
      invitationExpiryDays: data.invitationExpiryDays,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      data: {
        project: result.project,
        rawInvitationToken: result.rawInvitationToken,
        invitationPath: `/portal/projects/${result.rawInvitationToken}`,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Unable to create project.",
    };
  }
}

export async function updateProjectStatusAction(params: {
  projectId: string;
  nextStatus: ProjectStatus;
  reason?: string;
}): Promise<ActionResult<ProjectRecord>> {
  try {
    const ctx = await requireWorkspaceContext("projects:manage");
    const parsed = projectStatusUpdateSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid status transition input.",
      };
    }

    const updated = transitionProjectStatus({
      workspaceId: ctx.workspaceId,
      projectId: parsed.data.projectId,
      actorId: ctx.userId,
      actorLabel: ctx.fullName,
      nextStatus: parsed.data.nextStatus,
      reason: parsed.data.reason,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${params.projectId}`);

    return {
      success: true,
      data: updated,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to transition project status.",
    };
  }
}

export async function manageProjectInvitationAction(params: {
  projectId: string;
  action: "ROTATE" | "REVOKE";
  expiryDays?: number;
}): Promise<
  ActionResult<{
    rawToken?: string;
    invitationPath?: string;
    expiresAt: string;
  }>
> {
  try {
    const ctx = await requireWorkspaceContext("projects:invite");
    const result = rotateOrRevokeInvitationToken({
      workspaceId: ctx.workspaceId,
      projectId: params.projectId,
      actorId: ctx.userId,
      actorLabel: ctx.fullName,
      action: params.action,
      expiryDays: params.expiryDays,
    });

    revalidatePath(`/dashboard/projects/${params.projectId}`);
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      data: {
        rawToken: result.rawToken,
        invitationPath: result.rawToken
          ? `/portal/projects/${result.rawToken}`
          : undefined,
        expiresAt: new Date(result.session.expiresAt).toISOString(),
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to update invitation token.",
    };
  }
}

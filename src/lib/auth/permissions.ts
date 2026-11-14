import type {
  NoteVisibility,
  ProjectStatus,
  WorkspaceRole,
} from "@/db/schema";

export type PermissionAction =
  | "workspace:manage"
  | "users:manage"
  | "templates:manage"
  | "clients:create"
  | "clients:edit"
  | "clients:view"
  | "clients:archive"
  | "projects:create"
  | "projects:view_all"
  | "projects:manage"
  | "projects:invite"
  | "projects:review"
  | "projects:request_clarification"
  | "projects:internal_notes"
  | "projects:generate_brief"
  | "projects:change_status"
  | "portal:complete_questionnaire";

const ROLE_PERMISSIONS: Record<WorkspaceRole, ReadonlySet<PermissionAction>> = {
  SUPER_ADMIN: new Set<PermissionAction>([
    "workspace:manage",
    "users:manage",
    "templates:manage",
    "clients:create",
    "clients:edit",
    "clients:view",
    "clients:archive",
    "projects:create",
    "projects:view_all",
    "projects:manage",
    "projects:invite",
    "projects:review",
    "projects:request_clarification",
    "projects:internal_notes",
    "projects:generate_brief",
    "projects:change_status",
  ]),
  ADMIN: new Set<PermissionAction>([
    "clients:create",
    "clients:edit",
    "clients:view",
    "clients:archive",
    "projects:create",
    "projects:view_all",
    "projects:manage",
    "projects:invite",
    "projects:review",
    "projects:request_clarification",
    "projects:internal_notes",
    "projects:generate_brief",
    "projects:change_status",
  ]),
  PROJECT_MANAGER: new Set<PermissionAction>([
    "clients:view",
    "projects:manage",
    "projects:review",
    "projects:request_clarification",
    "projects:internal_notes",
    "projects:generate_brief",
  ]),
  CLIENT: new Set<PermissionAction>(["portal:complete_questionnaire"]),
};

export function hasPermission(
  role: WorkspaceRole,
  action: PermissionAction
): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export function isAgencyStaffRole(role: WorkspaceRole): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "PROJECT_MANAGER"
  );
}

/**
 * Ensures internal notes are strictly hidden from Client roles.
 */
export function canViewProjectNote(
  role: WorkspaceRole,
  visibility: NoteVisibility
): boolean {
  if (role === "CLIENT") {
    return false;
  }
  if (visibility === "INTERNAL" || visibility === "BRIEF_OBSERVATION") {
    return isAgencyStaffRole(role);
  }
  return false;
}

/**
 * Enforces workspace and project-level access rules across all 4 roles.
 */
export function canAccessProject(params: {
  userRole: WorkspaceRole;
  userWorkspaceId: string;
  userId: string;
  projectWorkspaceId: string;
  projectManagerId?: string | null;
  assignedClientProjectIds?: string[];
  projectId: string;
}): boolean {
  // Never allow cross-workspace access
  if (params.userWorkspaceId !== params.projectWorkspaceId) {
    return false;
  }

  if (params.userRole === "SUPER_ADMIN" || params.userRole === "ADMIN") {
    return true;
  }

  if (params.userRole === "PROJECT_MANAGER") {
    // Project managers can access projects assigned to them (or unassigned workspace projects if permitted)
    return (
      !params.projectManagerId || params.projectManagerId === params.userId
    );
  }

  if (params.userRole === "CLIENT") {
    return Boolean(
      params.assignedClientProjectIds?.includes(params.projectId)
    );
  }

  return false;
}

const VALID_STATUS_TRANSITIONS: Record<
  ProjectStatus,
  ReadonlyArray<ProjectStatus>
> = {
  DRAFT: ["INVITATION_SENT", "IN_PROGRESS", "ARCHIVED"],
  INVITATION_SENT: ["IN_PROGRESS", "SUBMITTED", "ARCHIVED"],
  IN_PROGRESS: ["SUBMITTED", "ARCHIVED"],
  SUBMITTED: [
    "UNDER_REVIEW",
    "AWAITING_CLIENT_RESPONSE",
    "IN_PROGRESS",
    "APPROVED",
    "ARCHIVED",
  ],
  UNDER_REVIEW: [
    "AWAITING_CLIENT_RESPONSE",
    "IN_PROGRESS",
    "APPROVED",
    "ARCHIVED",
  ],
  AWAITING_CLIENT_RESPONSE: [
    "IN_PROGRESS",
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "ARCHIVED",
  ],
  APPROVED: ["UNDER_REVIEW", "ARCHIVED"],
  ARCHIVED: ["DRAFT", "UNDER_REVIEW"],
};

export function canTransitionProjectStatus(
  from: ProjectStatus,
  to: ProjectStatus
): boolean {
  if (from === to) return true;
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

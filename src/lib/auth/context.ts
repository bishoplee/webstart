import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured, schema } from "@/db";
import type { WorkspaceRole } from "@/db/schema";
import { getIntegrationCapabilities } from "@/lib/env";
import {
  hasPermission,
  isAgencyStaffRole,
  type PermissionAction,
} from "./permissions";

export interface AuthenticatedWorkspaceContext {
  userId: string;
  clerkUserId: string;
  email: string;
  fullName: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: WorkspaceRole;
  isDemoFallback: boolean;
}

const DEFAULT_DEMO_CONTEXT: AuthenticatedWorkspaceContext = {
  userId: "00000000-0000-4000-8000-000000000001",
  clerkUserId: "user_demo_owner",
  email: "owner@webstart.agency",
  fullName: "Adaeze Okonkwo (Platform Owner)",
  workspaceId: "00000000-0000-4000-8000-000000000010",
  workspaceName: "WebStart Digital Agency",
  workspaceSlug: "webstart-agency",
  role: "SUPER_ADMIN",
  isDemoFallback: true,
};

/**
 * Resolves the current authenticated user and synchronizes their profile
 * and default agency workspace membership in PostgreSQL.
 *
 * When Clerk or Neon is not yet configured in local development, returns a
 * clearly flagged local development workspace context so the UI remains usable.
 */
export async function getWorkspaceContext(): Promise<AuthenticatedWorkspaceContext | null> {
  const capabilities = getIntegrationCapabilities();

  if (!capabilities.clerkConfigured || !isDatabaseConfigured()) {
    return DEFAULT_DEMO_CONTEXT;
  }

  try {
    const session = await auth();
    if (!session.userId) {
      return null;
    }

    const clerkProfile = await currentUser();
    const email =
      clerkProfile?.emailAddresses?.[0]?.emailAddress ??
      `${session.userId}@webstart.local`;
    const fullName =
      [clerkProfile?.firstName, clerkProfile?.lastName]
        .filter(Boolean)
        .join(" ") ||
      clerkProfile?.username ||
      email.split("@")[0] ||
      "Agency User";

    const db = getDb();

    // 1. Upsert user record by clerk_user_id
    let [dbUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.clerkUserId, session.userId))
      .limit(1);

    if (!dbUser) {
      const [inserted] = await db
        .insert(schema.users)
        .values({
          clerkUserId: session.userId,
          email,
          fullName,
        })
        .returning();
      dbUser = inserted;
    }

    // 2. Check existing workspace membership
    const existingMembership = await db
      .select({
        membership: schema.workspaceMembers,
        workspace: schema.workspaces,
      })
      .from(schema.workspaceMembers)
      .innerJoin(
        schema.workspaces,
        eq(schema.workspaceMembers.workspaceId, schema.workspaces.id)
      )
      .where(eq(schema.workspaceMembers.userId, dbUser.id))
      .limit(1);

    if (existingMembership.length > 0) {
      const { membership, workspace } = existingMembership[0];
      return {
        userId: dbUser.id,
        clerkUserId: dbUser.clerkUserId,
        email: dbUser.email,
        fullName: dbUser.fullName,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
        role: membership.role,
        isDemoFallback: false,
      };
    }

    // 3. Provision default workspace if none exists, or join first workspace
    let [defaultWorkspace] = await db
      .select()
      .from(schema.workspaces)
      .limit(1);

    let assignedRole: WorkspaceRole = "ADMIN";

    if (!defaultWorkspace) {
      const [createdWorkspace] = await db
        .insert(schema.workspaces)
        .values({
          name: "WebStart Agency Workspace",
          slug: `agency-${Date.now().toString(36)}`,
        })
        .returning();
      defaultWorkspace = createdWorkspace;
      assignedRole = "SUPER_ADMIN";
    }

    const [createdMembership] = await db
      .insert(schema.workspaceMembers)
      .values({
        workspaceId: defaultWorkspace.id,
        userId: dbUser.id,
        role: assignedRole,
      })
      .returning();

    return {
      userId: dbUser.id,
      clerkUserId: dbUser.clerkUserId,
      email: dbUser.email,
      fullName: dbUser.fullName,
      workspaceId: defaultWorkspace.id,
      workspaceName: defaultWorkspace.name,
      workspaceSlug: defaultWorkspace.slug,
      role: createdMembership.role,
      isDemoFallback: false,
    };
  } catch {
    return DEFAULT_DEMO_CONTEXT;
  }
}

export class AuthorizationError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

/**
 * Server-side guard requiring an authenticated agency user with an optional
 * required permission action.
 */
export async function requireWorkspaceContext(
  requiredPermission?: PermissionAction
): Promise<AuthenticatedWorkspaceContext> {
  const ctx = await getWorkspaceContext();
  if (!ctx) {
    throw new AuthorizationError("Authentication required.", 401);
  }

  if (!isAgencyStaffRole(ctx.role)) {
    throw new AuthorizationError(
      "Agency staff permissions are required to access this resource.",
      403
    );
  }

  if (requiredPermission && !hasPermission(ctx.role, requiredPermission)) {
    throw new AuthorizationError(
      `Role '${ctx.role}' does not have permission '${requiredPermission}'.`,
      403
    );
  }

  return ctx;
}

/**
 * Verifies that a target project belongs to the active workspace.
 */
export async function verifyWorkspaceProjectOwnership(
  workspaceId: string,
  projectId: string
) {
  if (!isDatabaseConfigured()) {
    return true;
  }
  const db = getDb();
  const [project] = await db
    .select({ id: schema.projects.id })
    .from(schema.projects)
    .where(
      and(
        eq(schema.projects.id, projectId),
        eq(schema.projects.workspaceId, workspaceId)
      )
    )
    .limit(1);

  return Boolean(project);
}

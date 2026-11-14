import { describe, expect, it } from "vitest";
import {
  canAccessProject,
  canTransitionProjectStatus,
  canViewProjectNote,
  hasPermission,
  isAgencyStaffRole,
} from "@/lib/auth/permissions";
import {
  evaluateSessionTokenState,
  generateInvitationToken,
  hashInvitationToken,
  verifyInvitationTokenHash,
} from "@/lib/auth/tokens";
import * as schema from "@/db/schema";

describe("Phase 1: Database Schema, RBAC Permissions & Invitation Tokens", () => {
  it("exposes all 15 required relational tables in Drizzle schema", () => {
    expect(schema.users).toBeDefined();
    expect(schema.workspaces).toBeDefined();
    expect(schema.workspaceMembers).toBeDefined();
    expect(schema.clients).toBeDefined();
    expect(schema.projects).toBeDefined();
    expect(schema.questionnaireTemplates).toBeDefined();
    expect(schema.questionnaireSections).toBeDefined();
    expect(schema.questionnaireQuestions).toBeDefined();
    expect(schema.projectQuestionnaireSessions).toBeDefined();
    expect(schema.questionnaireResponses).toBeDefined();
    expect(schema.projectFiles).toBeDefined();
    expect(schema.projectNotes).toBeDefined();
    expect(schema.projectActivityLogs).toBeDefined();
    expect(schema.clarificationRequests).toBeDefined();
    expect(schema.projectDocuments).toBeDefined();
  });

  it("enforces role-based permissions across SUPER_ADMIN, ADMIN, PROJECT_MANAGER, and CLIENT", () => {
    expect(hasPermission("SUPER_ADMIN", "workspace:manage")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "users:manage")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "templates:manage")).toBe(true);

    expect(hasPermission("ADMIN", "clients:create")).toBe(true);
    expect(hasPermission("ADMIN", "projects:create")).toBe(true);
    expect(hasPermission("ADMIN", "workspace:manage")).toBe(false);

    expect(hasPermission("PROJECT_MANAGER", "projects:review")).toBe(true);
    expect(
      hasPermission("PROJECT_MANAGER", "projects:request_clarification")
    ).toBe(true);
    expect(hasPermission("PROJECT_MANAGER", "clients:create")).toBe(false);

    expect(hasPermission("CLIENT", "portal:complete_questionnaire")).toBe(true);
    expect(hasPermission("CLIENT", "projects:internal_notes")).toBe(false);
    expect(isAgencyStaffRole("CLIENT")).toBe(false);
  });

  it("strictly prevents clients from viewing internal agency notes", () => {
    expect(canViewProjectNote("CLIENT", "INTERNAL")).toBe(false);
    expect(canViewProjectNote("CLIENT", "BRIEF_OBSERVATION")).toBe(false);
    expect(canViewProjectNote("SUPER_ADMIN", "INTERNAL")).toBe(true);
    expect(canViewProjectNote("ADMIN", "INTERNAL")).toBe(true);
    expect(canViewProjectNote("PROJECT_MANAGER", "INTERNAL")).toBe(true);
  });

  it("enforces multi-tenant workspace isolation on project access", () => {
    // Cross-workspace access must always fail even for SUPER_ADMIN of another workspace
    expect(
      canAccessProject({
        userRole: "SUPER_ADMIN",
        userWorkspaceId: "workspace-a",
        userId: "user-1",
        projectWorkspaceId: "workspace-b",
        projectId: "proj-1",
      })
    ).toBe(false);

    // Same workspace ADMIN can access
    expect(
      canAccessProject({
        userRole: "ADMIN",
        userWorkspaceId: "workspace-a",
        userId: "user-1",
        projectWorkspaceId: "workspace-a",
        projectId: "proj-1",
      })
    ).toBe(true);

    // CLIENT can only access assigned projects within the workspace
    expect(
      canAccessProject({
        userRole: "CLIENT",
        userWorkspaceId: "workspace-a",
        userId: "client-user-1",
        projectWorkspaceId: "workspace-a",
        assignedClientProjectIds: ["proj-1"],
        projectId: "proj-2",
      })
    ).toBe(false);

    expect(
      canAccessProject({
        userRole: "CLIENT",
        userWorkspaceId: "workspace-a",
        userId: "client-user-1",
        projectWorkspaceId: "workspace-a",
        assignedClientProjectIds: ["proj-1"],
        projectId: "proj-1",
      })
    ).toBe(true);
  });

  it("generates high-entropy invitation tokens and verifies SHA-256 hashes at rest", () => {
    const generated = generateInvitationToken(14);
    expect(generated.rawToken.length).toBeGreaterThanOrEqual(40);
    expect(generated.tokenHash).toHaveLength(64);
    expect(generated.tokenHash).not.toBe(generated.rawToken);
    expect(hashInvitationToken(generated.rawToken)).toBe(generated.tokenHash);
    expect(
      verifyInvitationTokenHash(generated.rawToken, generated.tokenHash)
    ).toBe(true);
    expect(
      verifyInvitationTokenHash("tampered-token", generated.tokenHash)
    ).toBe(false);
  });

  it("evaluates invitation session states for active, expired, revoked, submitted, and clarification modes", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const past = new Date(Date.now() - 60 * 1000);

    // Active session
    expect(
      evaluateSessionTokenState({
        expiresAt: future,
        projectStatus: "IN_PROGRESS",
      })
    ).toEqual({
      canRead: true,
      canEdit: true,
      canRespondToClarification: false,
      reason: "ACTIVE",
    });

    // Expired session
    expect(
      evaluateSessionTokenState({
        expiresAt: past,
        projectStatus: "IN_PROGRESS",
      }).reason
    ).toBe("EXPIRED");

    // Revoked session
    expect(
      evaluateSessionTokenState({
        expiresAt: future,
        revokedAt: new Date(),
        projectStatus: "IN_PROGRESS",
      }).reason
    ).toBe("REVOKED");

    // Submitted session locks ordinary edits
    const submittedState = evaluateSessionTokenState({
      expiresAt: future,
      submittedAt: new Date(),
      projectStatus: "SUBMITTED",
    });
    expect(submittedState.canRead).toBe(true);
    expect(submittedState.canEdit).toBe(false);
    expect(submittedState.reason).toBe("SUBMITTED_LOCKED");

    // Clarification requested unlocks response & targeted edits
    const clarificationState = evaluateSessionTokenState({
      expiresAt: future,
      submittedAt: new Date(),
      projectStatus: "AWAITING_CLIENT_RESPONSE",
    });
    expect(clarificationState.canRead).toBe(true);
    expect(clarificationState.canEdit).toBe(true);
    expect(clarificationState.canRespondToClarification).toBe(true);
  });

  it("validates legal project status transitions", () => {
    expect(canTransitionProjectStatus("DRAFT", "INVITATION_SENT")).toBe(true);
    expect(canTransitionProjectStatus("IN_PROGRESS", "SUBMITTED")).toBe(true);
    expect(
      canTransitionProjectStatus("SUBMITTED", "AWAITING_CLIENT_RESPONSE")
    ).toBe(true);
    expect(canTransitionProjectStatus("DRAFT", "APPROVED")).toBe(false);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { clientFormSchema } from "@/lib/validations/client";
import { projectCreateSchema } from "@/lib/validations/project";
import {
  createClientRecord,
  createProjectWithSession,
  getClientById,
  getDashboardMetrics,
  getPortalSessionByToken,
  getProjectWorkspaceDetail,
  listClients,
  listProjects,
  resetStoreForTesting,
  rotateOrRevokeInvitationToken,
  transitionProjectStatus,
  updateClientRecord,
} from "@/lib/data/repository";

const TEST_WORKSPACE = "00000000-0000-4000-8000-000000000010";
const OTHER_WORKSPACE = "00000000-0000-4000-8000-000000000099";

describe("Phase 2: Administrative Foundation (Clients, Projects, Dashboard & Invitations)", () => {
  beforeEach(() => {
    resetStoreForTesting(false);
  });

  it("validates client form inputs and rejects malformed emails or short names", () => {
    const valid = clientFormSchema.safeParse({
      organisationName: "Apex Fintech Solutions",
      contactName: "Seyi Lawal",
      contactEmail: "seyi@apexfintech.ng",
      website: "https://apexfintech.ng",
    });
    expect(valid.success).toBe(true);

    const invalid = clientFormSchema.safeParse({
      organisationName: "A",
      contactName: "",
      contactEmail: "not-an-email",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates project creation with either existing client ID or inline new client", () => {
    const missingClient = projectCreateSchema.safeParse({
      clientMode: "existing",
      clientId: "",
      projectName: "Corporate Website",
      websiteCategory: "CORPORATE",
      templateId: "tpl-corporate-v1",
    });
    expect(missingClient.success).toBe(false);

    const validInlineClient = projectCreateSchema.safeParse({
      clientMode: "new",
      newOrganisationName: "Lagoon Health",
      newContactName: "Dr. Bisi",
      newContactEmail: "bisi@lagoonhealth.org",
      projectName: "Lagoon Patient Portal",
      websiteCategory: "WEB_APP",
      templateId: "tpl-webapp-v1",
    });
    expect(validInlineClient.success).toBe(true);
  });

  it("creates, searches, updates, archives clients, and blocks duplicate client records in the same workspace", () => {
    const client = createClientRecord(TEST_WORKSPACE, {
      organisationName: "Nova Retail Group",
      industry: "E-Commerce & Retail",
      contactName: "Yemi Alade",
      contactEmail: "yemi@novaretail.com",
      city: "Lagos",
      country: "Nigeria",
    });

    expect(client.id).toBeDefined();
    expect(listClients(TEST_WORKSPACE)).toHaveLength(1);

    // Duplicate organisation or email in same workspace must throw
    expect(() =>
      createClientRecord(TEST_WORKSPACE, {
        organisationName: "Nova Retail Group",
        contactName: "Another Contact",
        contactEmail: "other@novaretail.com",
      })
    ).toThrow(/already exists/i);

    // Search filter
    expect(
      listClients(TEST_WORKSPACE, { search: "novaretail" })
    ).toHaveLength(1);
    expect(
      listClients(TEST_WORKSPACE, { search: "nonexistent" })
    ).toHaveLength(0);

    // Cross-workspace isolation
    expect(getClientById(OTHER_WORKSPACE, client.id)).toBeNull();

    // Archive and restore
    updateClientRecord(TEST_WORKSPACE, client.id, { isArchived: true });
    expect(
      listClients(TEST_WORKSPACE, { includeArchived: false })
    ).toHaveLength(0);
    expect(
      listClients(TEST_WORKSPACE, { includeArchived: true })
    ).toHaveLength(1);
  });

  it("creates a project, generates a hashed invitation token, transitions statuses, and computes real dashboard metrics", () => {
    const client = createClientRecord(TEST_WORKSPACE, {
      organisationName: "GreenField NGO",
      industry: "Non-Profit",
      contactName: "Ibrahim Musa",
      contactEmail: "ibrahim@greenfield.org",
    });

    const created = createProjectWithSession({
      workspaceId: TEST_WORKSPACE,
      actorId: "00000000-0000-4000-8000-000000000001",
      actorLabel: "Admin User",
      clientId: client.id,
      projectName: "GreenField Impact & Donations Website",
      websiteCategory: "NGO",
      budgetRange: "$1,500 – $3,500",
    });

    expect(created.project.referenceNumber).toMatch(/^WS-\d{4}-\d{4}$/);
    expect(created.project.status).toBe("INVITATION_SENT");
    expect(created.rawInvitationToken.length).toBeGreaterThan(30);
    expect(created.session.invitationTokenHash).not.toBe(
      created.rawInvitationToken
    );

    // Verify portal token lookup works and strips internal notes
    const portalData = getPortalSessionByToken(created.rawInvitationToken);
    expect(portalData).not.toBeNull();
    expect(portalData?.project.id).toBe(created.project.id);
    expect("internalNotes" in (portalData?.project ?? {})).toBe(false);

    // Verify cross-workspace isolation on project detail
    expect(
      getProjectWorkspaceDetail(OTHER_WORKSPACE, created.project.id)
    ).toBeNull();

    // Transition status from INVITATION_SENT -> IN_PROGRESS
    const updatedProj = transitionProjectStatus({
      workspaceId: TEST_WORKSPACE,
      projectId: created.project.id,
      actorId: "00000000-0000-4000-8000-000000000001",
      actorLabel: "Admin User",
      nextStatus: "IN_PROGRESS",
    });
    expect(updatedProj.status).toBe("IN_PROGRESS");

    // Rotate invitation token and verify old token is revoked
    const rotated = rotateOrRevokeInvitationToken({
      workspaceId: TEST_WORKSPACE,
      projectId: created.project.id,
      actorId: "00000000-0000-4000-8000-000000000001",
      actorLabel: "Admin User",
      action: "ROTATE",
    });
    expect(rotated.rawToken).toBeDefined();
    const oldSessionState = getPortalSessionByToken(created.rawInvitationToken);
    expect(oldSessionState?.tokenState.canRead).toBe(false);
    expect(oldSessionState?.tokenState.reason).toBe("REVOKED");

    const newSessionState = getPortalSessionByToken(rotated.rawToken!);
    expect(newSessionState?.tokenState.canRead).toBe(true);

    // Verify live dashboard metrics
    const metrics = getDashboardMetrics(TEST_WORKSPACE);
    expect(metrics.totalClients).toBe(1);
    expect(metrics.totalProjects).toBe(1);
    expect(metrics.projectsInProgress).toBe(1);
    expect(listProjects(TEST_WORKSPACE, { category: "NGO" })).toHaveLength(1);
  });
});

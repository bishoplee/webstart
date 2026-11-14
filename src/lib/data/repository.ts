import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import type {
  ClarificationRequestRecord,
  ClientRecord,
  NoteVisibility,
  ProjectActivityLogRecord,
  ProjectDocumentRecord,
  ProjectFileRecord,
  ProjectNoteRecord,
  ProjectQuestionnaireSessionRecord,
  ProjectRecord,
  ProjectStatus,
  SectionReviewStatus,
  SocialLinksJson,
  UserRecord,
  WebsiteCategory,
  WorkspaceMemberRecord,
  WorkspaceRecord,
  WorkspaceRole,
} from "@/db/schema";
import {
  DEFAULT_QUESTIONNAIRE_TEMPLATES,
  getTemplateBlueprintByCategory,
  getTemplateBlueprintById,
  type TemplateBlueprint,
} from "@/lib/questionnaire/default-templates";
import { calculateQuestionnaireCompletion } from "@/lib/questionnaire/completion";
import {
  evaluateSessionTokenState,
  generateInvitationToken,
  hashInvitationToken,
} from "@/lib/auth/tokens";
import { canTransitionProjectStatus } from "@/lib/auth/permissions";

export interface StoredSessionRecord extends ProjectQuestionnaireSessionRecord {
  /**
   * Stored in development/test or upon creation so administrators can copy
   * the active invitation link; in production DB, only invitationTokenHash is required at rest.
   */
  latestRawTokenHint?: string;
}

export interface PersistedDatabaseState {
  users: UserRecord[];
  workspaces: WorkspaceRecord[];
  workspaceMembers: WorkspaceMemberRecord[];
  clients: ClientRecord[];
  projects: ProjectRecord[];
  templates: TemplateBlueprint[];
  sessions: StoredSessionRecord[];
  responses: Record<string, Record<string, unknown>>; // sessionId -> { questionKey: value }
  files: ProjectFileRecord[];
  notes: ProjectNoteRecord[];
  activityLogs: ProjectActivityLogRecord[];
  clarifications: ClarificationRequestRecord[];
  documents: ProjectDocumentRecord[];
}

const DEFAULT_WORKSPACE_ID = "00000000-0000-4000-8000-000000000010";
const DEFAULT_OWNER_ID = "00000000-0000-4000-8000-000000000001";
const DEFAULT_PM_ID = "00000000-0000-4000-8000-000000000002";

const STORE_FILE_PATH = path.join(
  process.cwd(),
  ".local-uploads",
  "webstart-db.json"
);

let memoryStore: PersistedDatabaseState | null = null;

function createInitialSeedState(): PersistedDatabaseState {
  const now = new Date();
  const isProd = process.env.NODE_ENV === "production";

  const users: UserRecord[] = [
    {
      id: DEFAULT_OWNER_ID,
      clerkUserId: "user_demo_owner",
      email: "owner@webstart.agency",
      fullName: "Adaeze Okonkwo (Platform Owner)",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: DEFAULT_PM_ID,
      clerkUserId: "user_demo_pm",
      email: "tunde@webstart.agency",
      fullName: "Tunde Bakare (Project Manager)",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const workspaces: WorkspaceRecord[] = [
    {
      id: DEFAULT_WORKSPACE_ID,
      name: "WebStart Digital Agency",
      slug: "webstart-agency",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const workspaceMembers: WorkspaceMemberRecord[] = [
    {
      id: "00000000-0000-4000-8000-000000000021",
      workspaceId: DEFAULT_WORKSPACE_ID,
      userId: DEFAULT_OWNER_ID,
      role: "SUPER_ADMIN",
      createdAt: now,
    },
    {
      id: "00000000-0000-4000-8000-000000000022",
      workspaceId: DEFAULT_WORKSPACE_ID,
      userId: DEFAULT_PM_ID,
      role: "PROJECT_MANAGER",
      createdAt: now,
    },
  ];

  if (isProd) {
    return {
      users,
      workspaces,
      workspaceMembers,
      clients: [],
      projects: [],
      templates: structuredClone(DEFAULT_QUESTIONNAIRE_TEMPLATES),
      sessions: [],
      responses: {},
      files: [],
      notes: [],
      activityLogs: [],
      clarifications: [],
      documents: [],
    };
  }

  // Development & Demo Seed Data
  const client1Id = "00000000-0000-4000-8000-000000000101";
  const client2Id = "00000000-0000-4000-8000-000000000102";

  const clients: ClientRecord[] = [
    {
      id: client1Id,
      workspaceId: DEFAULT_WORKSPACE_ID,
      organisationName: "Veritas Meridian Logistics Ltd",
      organisationType: "Private Limited Company",
      industry: "Supply Chain & Maritime Logistics",
      businessDescription:
        "Regional freight forwarding, customs brokerage, and haulage management across West Africa.",
      contactName: "Chidi Nwosu",
      contactEmail: "c.nwosu@veritasmeridian.com",
      phone: "+234 803 555 0192",
      whatsapp: "+234 803 555 0192",
      website: "https://veritasmeridian.com",
      address: "14 Wharf Road, Apapa",
      city: "Lagos",
      country: "Nigeria",
      socialLinks: {
        linkedin: "https://linkedin.com/company/veritas-meridian",
      },
      internalNotes:
        "Priority Q4 corporate redesign. Decision maker is the Operations Director.",
      isArchived: false,
      createdAt: new Date(now.getTime() - 7 * 86400000),
      updatedAt: new Date(now.getTime() - 2 * 86400000),
    },
    {
      id: client2Id,
      workspaceId: DEFAULT_WORKSPACE_ID,
      organisationName: "Crestview International Academy",
      organisationType: "Educational Institution",
      industry: "K-12 & Sixth Form Education",
      businessDescription:
        "Co-educational boarding and day school offering British and Nigerian curricula.",
      contactName: "Dr. Amina Bello",
      contactEmail: "admissions@crestviewacademy.edu.ng",
      phone: "+234 809 440 2211",
      whatsapp: "+234 809 440 2211",
      website: "https://crestviewacademy.edu.ng",
      address: "Plot 28 Guzape District",
      city: "Abuja",
      country: "Nigeria",
      socialLinks: {
        instagram: "https://instagram.com/crestviewacademy",
      },
      internalNotes:
        "Needs online admissions portal and tuition fee payment integration before next academic term.",
      isArchived: false,
      createdAt: new Date(now.getTime() - 5 * 86400000),
      updatedAt: new Date(now.getTime() - 1 * 86400000),
    },
  ];

  const project1Id = "00000000-0000-4000-8000-000000000201";
  const project2Id = "00000000-0000-4000-8000-000000000202";

  const demoToken1 = "demo-veritas-corporate-token-2026";
  const demoToken2 = "demo-crestview-education-token-2026";

  const session1Id = "00000000-0000-4000-8000-000000000301";
  const session2Id = "00000000-0000-4000-8000-000000000302";

  const session1Responses: Record<string, unknown> = {
    organisation_name: "Veritas Meridian Logistics Ltd",
    business_registration_name: "Veritas Meridian Integrated Logistics RC-884120",
    business_description:
      "End-to-end maritime clearing, bonded warehousing, and temperature-controlled haulage across West Africa.",
    industry: "Logistics & Supply Chain",
    organisation_type: "private_company",
    year_established: 2016,
    physical_address: "14 Wharf Road, Apapa, Lagos, Nigeria",
    operating_locations: "Lagos, Port Harcourt, Kano, Tema (Ghana)",
    primary_contact_name: "Chidi Nwosu — Director of Operations",
    contact_email: "c.nwosu@veritasmeridian.com",
    phone_number: "+234 803 555 0192",
    whatsapp_number: "+234 803 555 0192",
    existing_website: "https://veritasmeridian.com",
    new_or_redesign: "redesign",
    primary_objectives: [
      "establish_presence",
      "generate_leads",
      "promote_services",
      "manage_customers",
    ],
    why_need_website:
      "Our current site is outdated, not mobile-friendly, and lacks a shipment quote request workflow for enterprise importers.",
    visitor_accomplishments:
      "Request a freight quote, download our corporate profile, and track customs clearance requirements.",
    success_criteria:
      "40+ qualified B2B quote requests per month and faster onboarding of corporate logistics retainers.",
    primary_audience:
      "Import/Export Managers, Manufacturing Supply Chain Heads, and FMCG Distributors.",
    geographical_locations: "Nigeria, West Africa, Europe & Asia trade partners",
    languages: "English",
    typical_visitor_problems:
      "Unclear port clearing timelines, hidden demurrage costs, and unreliable haulage tracking.",
    desired_visitor_actions: "Request a Freight Quote",
    selected_pages: [
      "home",
      "about_us",
      "services",
      "projects",
      "our_team",
      "faq",
      "contact",
      "downloads",
    ],
    page_specifications: [
      {
        pageName: "Freight Quote Calculator",
        purpose: "Allow importers to submit container/cargo specs for rapid quotation",
        contentAvailability: "Ready",
        specialRequirements: "Multi-step form with cargo weight and port selection",
      },
    ],
    content_responsibility: "hybrid",
    logo_availability: "yes_vector",
    primary_brand_colour: "#202D3B",
    secondary_brand_colour: "#A2D514",
    preferred_design_style: ["corporate", "modern"],
    existing_photography: "mix_custom_stock",
    selected_features: [
      "contact_forms",
      "content_management",
      "document_downloads",
      "analytics",
      "live_chat",
    ],
    existing_domain: "Yes — veritasmeridian.com on Cloudflare",
    existing_hosting_provider: "cPanel shared hosting (open to migrating to Vercel)",
    existing_business_email: "Microsoft 365 (already active)",
    required_integrations: "HubSpot CRM, WhatsApp Business Chat, Google Analytics 4",
    website_manager: "shared",
    publishing_responsibilities:
      "Communications officer publishes company news; Sales team receives quote alerts.",
    number_of_administrators_and_roles: "3 administrators (1 Super Admin, 2 Editors)",
    training_requirements: "live_session_and_guide",
    budget_range: "3500_to_7500_usd",
    preferred_launch_date: "2026-12-20",
    project_urgency: "time_sensitive",
    preferred_payment_arrangement: "50_30_20",
    privacy_policy_availability: "need_standard_template",
    terms_and_conditions_availability: "need_standard_template",
    cookie_and_data_collection:
      "NDPA compliant privacy notice on all lead capture forms.",
    corporate_business_services:
      "1. Customs Brokerage & Port Clearing\n2. Bonded Terminal Warehousing\n3. Nationwide Container Haulage\n4. Air Freight Consolidation",
    corporate_enquiries_and_leads:
      "Route quote requests by service category to quotes@veritasmeridian.com and log in HubSpot.",
  };

  const corpTemplate = getTemplateBlueprintByCategory("CORPORATE");
  const corpCompletion = calculateQuestionnaireCompletion(
    corpTemplate.sections,
    session1Responses
  );

  const projects: ProjectRecord[] = [
    {
      id: project1Id,
      workspaceId: DEFAULT_WORKSPACE_ID,
      clientId: client1Id,
      projectName: "Veritas Meridian Corporate Website & Quote Portal",
      referenceNumber: "WS-2026-1001",
      websiteCategory: "CORPORATE",
      description:
        "Modern corporate website rebuild with multi-step freight quotation workflow and resource centre.",
      objectives:
        "Increase B2B freight enquiries and modernize brand authority across West Africa.",
      status: "SUBMITTED",
      managerId: DEFAULT_OWNER_ID,
      targetLaunchDate: new Date("2026-12-20T00:00:00.000Z"),
      budgetRange: "$3,500 – $7,500",
      completionPercentage: corpCompletion.overallPercentage,
      internalNotes:
        "Client completed all required corporate sections. Ready for agency technical review.",
      createdAt: new Date(now.getTime() - 6 * 86400000),
      updatedAt: new Date(now.getTime() - 1 * 86400000),
      submittedAt: new Date(now.getTime() - 1 * 86400000),
    },
    {
      id: project2Id,
      workspaceId: DEFAULT_WORKSPACE_ID,
      clientId: client2Id,
      projectName: "Crestview Academy Admissions & School Website",
      referenceNumber: "WS-2026-1002",
      websiteCategory: "EDUCATION",
      description:
        "Full school website with digital admissions application and Paystack tuition fee payment integration.",
      objectives:
        "Streamline student admissions and provide parent/student portal entry points.",
      status: "IN_PROGRESS",
      managerId: DEFAULT_PM_ID,
      targetLaunchDate: new Date("2027-01-15T00:00:00.000Z"),
      budgetRange: "$3,500 – $7,500",
      completionPercentage: 25,
      internalNotes: "Client is currently completing Section 4 & Section 6.",
      createdAt: new Date(now.getTime() - 4 * 86400000),
      updatedAt: now,
      submittedAt: null,
    },
  ];

  const sessions: StoredSessionRecord[] = [
    {
      id: session1Id,
      projectId: project1Id,
      templateId: "tpl-corporate-v1",
      templateVersion: 1,
      invitationTokenHash: hashInvitationToken(demoToken1),
      latestRawTokenHint: demoToken1,
      sectionReviewStates: {
        client_business_info: "REVIEWED",
        project_objectives: "REVIEWED",
      },
      expiresAt: new Date(now.getTime() + 30 * 86400000),
      revokedAt: null,
      submittedAt: new Date(now.getTime() - 1 * 86400000),
      createdAt: new Date(now.getTime() - 6 * 86400000),
      updatedAt: new Date(now.getTime() - 1 * 86400000),
    },
    {
      id: session2Id,
      projectId: project2Id,
      templateId: "tpl-education-v1",
      templateVersion: 1,
      invitationTokenHash: hashInvitationToken(demoToken2),
      latestRawTokenHint: demoToken2,
      sectionReviewStates: {},
      expiresAt: new Date(now.getTime() + 30 * 86400000),
      revokedAt: null,
      submittedAt: null,
      createdAt: new Date(now.getTime() - 4 * 86400000),
      updatedAt: now,
    },
  ];

  const session2Responses: Record<string, unknown> = {
    organisation_name: "Crestview International Academy",
    business_description:
      "Leading co-educational secondary and sixth-form boarding school in Abuja.",
    industry: "Education",
    organisation_type: "educational",
    physical_address: "Plot 28 Guzape District, Abuja",
    operating_locations: "Abuja, Nigeria",
    primary_contact_name: "Dr. Amina Bello — Principal",
    contact_email: "admissions@crestviewacademy.edu.ng",
    phone_number: "+234 809 440 2211",
    new_or_redesign: "redesign",
    primary_objectives: [
      "establish_presence",
      "accept_payments",
      "manage_students_members",
    ],
    why_need_website:
      "Parents need a seamless online admissions portal and digital prospectus.",
    visitor_accomplishments:
      "Book a school tour, complete admission forms, and pay entrance exam fees.",
    success_criteria: "100% digital admission applications for the 2027 intake.",
  };

  return {
    users,
    workspaces,
    workspaceMembers,
    clients,
    projects,
    templates: structuredClone(DEFAULT_QUESTIONNAIRE_TEMPLATES),
    sessions,
    responses: {
      [session1Id]: session1Responses,
      [session2Id]: session2Responses,
    },
    files: [
      {
        id: "00000000-0000-4000-8000-000000000401",
        projectId: project1Id,
        sectionKey: "design_branding",
        category: "brand_guidelines",
        uploadedBy: "Chidi Nwosu (Client)",
        storageProvider: "local",
        storageKey: "demo/veritas-brand-manual-2026.pdf",
        originalFilename: "Veritas-Meridian-Brand-Guidelines.pdf",
        mimeType: "application/pdf",
        fileSize: 1482900,
        createdAt: new Date(now.getTime() - 2 * 86400000),
      },
    ],
    notes: [
      {
        id: "00000000-0000-4000-8000-000000000501",
        projectId: project1Id,
        authorId: DEFAULT_OWNER_ID,
        note: "Recommend Next.js static generation for service pages plus HubSpot webhook integration for quote requests.",
        visibility: "BRIEF_OBSERVATION",
        createdAt: new Date(now.getTime() - 1 * 86400000),
      },
      {
        id: "00000000-0000-4000-8000-000000000502",
        projectId: project1Id,
        authorId: DEFAULT_OWNER_ID,
        note: "INTERNAL ONLY: Client has approved 50% mobilisation budget once discovery brief is signed off.",
        visibility: "INTERNAL",
        createdAt: new Date(now.getTime() - 1 * 86400000),
      },
    ],
    activityLogs: [
      {
        id: "00000000-0000-4000-8000-000000000601",
        projectId: project1Id,
        actorId: DEFAULT_OWNER_ID,
        actorLabel: "Adaeze Okonkwo (Platform Owner)",
        action: "PROJECT_CREATED",
        details: { referenceNumber: "WS-2026-1001" },
        createdAt: new Date(now.getTime() - 6 * 86400000),
      },
      {
        id: "00000000-0000-4000-8000-000000000602",
        projectId: project1Id,
        actorId: null,
        actorLabel: "Chidi Nwosu (Client)",
        action: "QUESTIONNAIRE_SUBMITTED",
        details: { completionPercentage: corpCompletion.overallPercentage },
        createdAt: new Date(now.getTime() - 1 * 86400000),
      },
    ],
    clarifications: [],
    documents: [],
  };
}

function reviveDates<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => reviveDates(item)) as unknown as T;
  }
  const copy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (
      typeof v === "string" &&
      (k.endsWith("At") || k === "targetLaunchDate") &&
      /^\d{4}-\d{2}-\d{2}T/.test(v)
    ) {
      copy[k] = new Date(v);
    } else if (v && typeof v === "object") {
      copy[k] = reviveDates(v);
    } else {
      copy[k] = v;
    }
  }
  return copy as T;
}

export function loadStore(): PersistedDatabaseState {
  if (memoryStore) {
    return memoryStore;
  }

  if (process.env.VITEST) {
    memoryStore = createInitialSeedState();
    return memoryStore;
  }

  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, "utf-8");
      memoryStore = reviveDates(JSON.parse(raw) as PersistedDatabaseState);
      return memoryStore;
    }
  } catch {
    // Fallback to fresh seed state
  }

  memoryStore = createInitialSeedState();
  saveStore(memoryStore);
  return memoryStore;
}

export function saveStore(state: PersistedDatabaseState): void {
  memoryStore = state;
  if (process.env.VITEST) {
    return;
  }
  try {
    const dir = path.dirname(STORE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Ignore filesystem write issues on read-only serverless environments
  }
}

export function resetStoreForTesting(withSeed = false): PersistedDatabaseState {
  const base = createInitialSeedState();
  if (!withSeed) {
    base.clients = [];
    base.projects = [];
    base.sessions = [];
    base.responses = {};
    base.files = [];
    base.notes = [];
    base.activityLogs = [];
    base.clarifications = [];
    base.documents = [];
  }
  memoryStore = base;
  return memoryStore;
}

// -----------------------------------------------------------------------------
// Dashboard & Analytics Queries (Module A & Section 18)
// -----------------------------------------------------------------------------

export interface DashboardMetrics {
  totalClients: number;
  totalProjects: number;
  projectsInProgress: number;
  completedDiscoveryProjects: number;
  awaitingClientSubmissions: number;
  requiringClarification: number;
  statusBreakdown: Record<ProjectStatus, number>;
  categoryBreakdown: Record<WebsiteCategory, number>;
  averageCompletionRate: number;
  recentProjects: Array<ProjectRecord & { clientName: string }>;
  recentSubmissions: Array<ProjectRecord & { clientName: string }>;
  outstandingClientTasks: Array<{
    projectId: string;
    projectName: string;
    referenceNumber: string;
    clientName: string;
    status: ProjectStatus;
    completionPercentage: number;
    openClarifications: number;
  }>;
}

export function getDashboardMetrics(workspaceId: string): DashboardMetrics {
  const store = loadStore();
  const wsClients = store.clients.filter(
    (c) => c.workspaceId === workspaceId && !c.isArchived
  );
  const wsProjects = store.projects.filter(
    (p) => p.workspaceId === workspaceId
  );

  const clientMap = new Map(
    store.clients
      .filter((c) => c.workspaceId === workspaceId)
      .map((c) => [c.id, c.organisationName])
  );

  const statusBreakdown: Record<ProjectStatus, number> = {
    DRAFT: 0,
    INVITATION_SENT: 0,
    IN_PROGRESS: 0,
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    AWAITING_CLIENT_RESPONSE: 0,
    APPROVED: 0,
    ARCHIVED: 0,
  };

  const categoryBreakdown: Record<WebsiteCategory, number> = {
    CORPORATE: 0,
    ECOMMERCE: 0,
    EDUCATION: 0,
    NGO: 0,
    PORTFOLIO: 0,
    WEB_APP: 0,
    CUSTOM: 0,
  };

  let completionSum = 0;

  for (const proj of wsProjects) {
    statusBreakdown[proj.status] = (statusBreakdown[proj.status] ?? 0) + 1;
    categoryBreakdown[proj.websiteCategory] =
      (categoryBreakdown[proj.websiteCategory] ?? 0) + 1;
    completionSum += proj.completionPercentage ?? 0;
  }

  const projectsInProgress =
    statusBreakdown.IN_PROGRESS +
    statusBreakdown.UNDER_REVIEW +
    statusBreakdown.AWAITING_CLIENT_RESPONSE;

  const completedDiscoveryProjects =
    statusBreakdown.SUBMITTED + statusBreakdown.APPROVED;

  const awaitingClientSubmissions =
    statusBreakdown.INVITATION_SENT +
    statusBreakdown.IN_PROGRESS +
    statusBreakdown.AWAITING_CLIENT_RESPONSE;

  const requiringClarification = statusBreakdown.AWAITING_CLIENT_RESPONSE;

  const averageCompletionRate =
    wsProjects.length > 0 ? Math.round(completionSum / wsProjects.length) : 0;

  const sortedByCreated = [...wsProjects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const recentProjects = sortedByCreated.slice(0, 6).map((p) => ({
    ...p,
    clientName: clientMap.get(p.clientId) ?? "Unknown Client",
  }));

  const recentSubmissions = wsProjects
    .filter((p) => p.submittedAt !== null)
    .sort(
      (a, b) =>
        new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime()
    )
    .slice(0, 5)
    .map((p) => ({
      ...p,
      clientName: clientMap.get(p.clientId) ?? "Unknown Client",
    }));

  const outstandingClientTasks = wsProjects
    .filter(
      (p) =>
        p.status === "INVITATION_SENT" ||
        p.status === "IN_PROGRESS" ||
        p.status === "AWAITING_CLIENT_RESPONSE"
    )
    .map((p) => {
      const openClarifications = store.clarifications.filter(
        (c) => c.projectId === p.id && c.status === "OPEN"
      ).length;
      return {
        projectId: p.id,
        projectName: p.projectName,
        referenceNumber: p.referenceNumber,
        clientName: clientMap.get(p.clientId) ?? "Unknown Client",
        status: p.status,
        completionPercentage: p.completionPercentage,
        openClarifications,
      };
    });

  return {
    totalClients: wsClients.length,
    totalProjects: wsProjects.length,
    projectsInProgress,
    completedDiscoveryProjects,
    awaitingClientSubmissions,
    requiringClarification,
    statusBreakdown,
    categoryBreakdown,
    averageCompletionRate,
    recentProjects,
    recentSubmissions,
    outstandingClientTasks,
  };
}

// -----------------------------------------------------------------------------
// Client Management (Module B)
// -----------------------------------------------------------------------------

export interface ListClientsFilters {
  search?: string;
  includeArchived?: boolean;
  industry?: string;
}

export function listClients(
  workspaceId: string,
  filters: ListClientsFilters = {}
): Array<ClientRecord & { projectCount: number }> {
  const store = loadStore();
  const q = filters.search?.trim().toLowerCase() ?? "";

  return store.clients
    .filter((c) => {
      if (c.workspaceId !== workspaceId) return false;
      if (!filters.includeArchived && c.isArchived) return false;
      if (
        filters.industry &&
        filters.industry !== "ALL" &&
        c.industry?.toLowerCase() !== filters.industry.toLowerCase()
      ) {
        return false;
      }
      if (q) {
        const hay = [
          c.organisationName,
          c.contactName,
          c.contactEmail,
          c.industry,
          c.city,
          c.country,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map((client) => ({
      ...client,
      projectCount: store.projects.filter(
        (p) => p.workspaceId === workspaceId && p.clientId === client.id
      ).length,
    }));
}

export function getClientById(
  workspaceId: string,
  clientId: string
): { client: ClientRecord; projects: ProjectRecord[] } | null {
  const store = loadStore();
  const client = store.clients.find(
    (c) => c.id === clientId && c.workspaceId === workspaceId
  );
  if (!client) return null;

  const clientProjects = store.projects
    .filter((p) => p.workspaceId === workspaceId && p.clientId === clientId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return { client, projects: clientProjects };
}

export function createClientRecord(
  workspaceId: string,
  input: {
    organisationName: string;
    organisationType?: string;
    industry?: string;
    businessDescription?: string;
    contactName: string;
    contactEmail: string;
    phone?: string;
    whatsapp?: string;
    website?: string;
    address?: string;
    city?: string;
    country?: string;
    socialLinks?: SocialLinksJson;
    internalNotes?: string;
  }
): ClientRecord {
  const store = loadStore();

  // Check duplicate organisation name or email in the same workspace
  const normalizedOrg = input.organisationName.trim().toLowerCase();
  const normalizedEmail = input.contactEmail.trim().toLowerCase();

  const duplicate = store.clients.find(
    (c) =>
      c.workspaceId === workspaceId &&
      !c.isArchived &&
      (c.organisationName.trim().toLowerCase() === normalizedOrg ||
        c.contactEmail.trim().toLowerCase() === normalizedEmail)
  );

  if (duplicate) {
    throw new Error(
      `A client with organisation "${duplicate.organisationName}" or email "${duplicate.contactEmail}" already exists in this workspace.`
    );
  }

  const now = new Date();
  const record: ClientRecord = {
    id: randomUUID(),
    workspaceId,
    organisationName: input.organisationName.trim(),
    organisationType: input.organisationType?.trim() || null,
    industry: input.industry?.trim() || null,
    businessDescription: input.businessDescription?.trim() || null,
    contactName: input.contactName.trim(),
    contactEmail: input.contactEmail.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    whatsapp: input.whatsapp?.trim() || null,
    website: input.website?.trim() || null,
    address: input.address?.trim() || null,
    city: input.city?.trim() || null,
    country: input.country?.trim() || null,
    socialLinks: input.socialLinks ?? {},
    internalNotes: input.internalNotes?.trim() || null,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  store.clients.push(record);
  saveStore(store);
  return record;
}

export function updateClientRecord(
  workspaceId: string,
  clientId: string,
  input: Partial<{
    organisationName: string;
    organisationType: string;
    industry: string;
    businessDescription: string;
    contactName: string;
    contactEmail: string;
    phone: string;
    whatsapp: string;
    website: string;
    address: string;
    city: string;
    country: string;
    socialLinks: SocialLinksJson;
    internalNotes: string;
    isArchived: boolean;
  }>
): ClientRecord {
  const store = loadStore();
  const idx = store.clients.findIndex(
    (c) => c.id === clientId && c.workspaceId === workspaceId
  );
  if (idx === -1) {
    throw new Error("Client record not found in workspace.");
  }

  const existing = store.clients[idx];
  const updated: ClientRecord = {
    ...existing,
    organisationName:
      input.organisationName !== undefined
        ? input.organisationName.trim()
        : existing.organisationName,
    organisationType:
      input.organisationType !== undefined
        ? input.organisationType.trim() || null
        : existing.organisationType,
    industry:
      input.industry !== undefined
        ? input.industry.trim() || null
        : existing.industry,
    businessDescription:
      input.businessDescription !== undefined
        ? input.businessDescription.trim() || null
        : existing.businessDescription,
    contactName:
      input.contactName !== undefined
        ? input.contactName.trim()
        : existing.contactName,
    contactEmail:
      input.contactEmail !== undefined
        ? input.contactEmail.trim().toLowerCase()
        : existing.contactEmail,
    phone:
      input.phone !== undefined ? input.phone.trim() || null : existing.phone,
    whatsapp:
      input.whatsapp !== undefined
        ? input.whatsapp.trim() || null
        : existing.whatsapp,
    website:
      input.website !== undefined
        ? input.website.trim() || null
        : existing.website,
    address:
      input.address !== undefined
        ? input.address.trim() || null
        : existing.address,
    city: input.city !== undefined ? input.city.trim() || null : existing.city,
    country:
      input.country !== undefined
        ? input.country.trim() || null
        : existing.country,
    socialLinks:
      input.socialLinks !== undefined
        ? input.socialLinks
        : existing.socialLinks,
    internalNotes:
      input.internalNotes !== undefined
        ? input.internalNotes.trim() || null
        : existing.internalNotes,
    isArchived:
      input.isArchived !== undefined ? input.isArchived : existing.isArchived,
    updatedAt: new Date(),
  };

  store.clients[idx] = updated;
  saveStore(store);
  return updated;
}

// -----------------------------------------------------------------------------
// Project Management & Invitations (Module C)
// -----------------------------------------------------------------------------

export interface ListProjectsFilters {
  search?: string;
  status?: ProjectStatus | "ALL";
  category?: WebsiteCategory | "ALL";
  managerId?: string | "ALL";
}

export interface EnrichedProjectListItem extends ProjectRecord {
  clientName: string;
  clientEmail: string;
  managerName: string | null;
  latestInvitationTokenHint?: string;
}

export function listProjects(
  workspaceId: string,
  filters: ListProjectsFilters = {}
): EnrichedProjectListItem[] {
  const store = loadStore();
  const q = filters.search?.trim().toLowerCase() ?? "";

  const clientMap = new Map(
    store.clients
      .filter((c) => c.workspaceId === workspaceId)
      .map((c) => [c.id, c])
  );
  const userMap = new Map(store.users.map((u) => [u.id, u.fullName]));

  return store.projects
    .filter((p) => {
      if (p.workspaceId !== workspaceId) return false;
      if (
        filters.status &&
        filters.status !== "ALL" &&
        p.status !== filters.status
      ) {
        return false;
      }
      if (
        filters.category &&
        filters.category !== "ALL" &&
        p.websiteCategory !== filters.category
      ) {
        return false;
      }
      if (
        filters.managerId &&
        filters.managerId !== "ALL" &&
        p.managerId !== filters.managerId
      ) {
        return false;
      }
      if (q) {
        const client = clientMap.get(p.clientId);
        const hay = [
          p.projectName,
          p.referenceNumber,
          p.description,
          client?.organisationName,
          client?.contactName,
          client?.contactEmail,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map((proj) => {
      const client = clientMap.get(proj.clientId);
      const activeSession = store.sessions
        .filter((s) => s.projectId === proj.id && !s.revokedAt)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

      return {
        ...proj,
        clientName: client?.organisationName ?? "Unknown Client",
        clientEmail: client?.contactEmail ?? "",
        managerName: proj.managerId ? (userMap.get(proj.managerId) ?? null) : null,
        latestInvitationTokenHint: activeSession?.latestRawTokenHint,
      };
    });
}

function generateNextProjectReference(
  store: PersistedDatabaseState,
  workspaceId: string
): string {
  const year = new Date().getFullYear();
  const count = store.projects.filter(
    (p) => p.workspaceId === workspaceId
  ).length;
  return `WS-${year}-${String(1001 + count).padStart(4, "0")}`;
}

export function createProjectWithSession(params: {
  workspaceId: string;
  actorId: string;
  actorLabel: string;
  clientId: string;
  projectName: string;
  websiteCategory: WebsiteCategory;
  templateId?: string;
  description?: string;
  objectives?: string;
  managerId?: string | null;
  targetLaunchDate?: Date | null;
  budgetRange?: string;
  internalNotes?: string;
  generateInvitationImmediately?: boolean;
  invitationExpiryDays?: number;
}): {
  project: ProjectRecord;
  session: StoredSessionRecord;
  rawInvitationToken: string;
} {
  const store = loadStore();
  const client = store.clients.find(
    (c) => c.id === params.clientId && c.workspaceId === params.workspaceId
  );
  if (!client) {
    throw new Error("Selected client does not belong to this workspace.");
  }

  const template =
    (params.templateId && getTemplateBlueprintById(params.templateId)) ||
    getTemplateBlueprintByCategory(params.websiteCategory);

  const now = new Date();
  const referenceNumber = generateNextProjectReference(
    store,
    params.workspaceId
  );
  const initialStatus: ProjectStatus =
    params.generateInvitationImmediately !== false ? "INVITATION_SENT" : "DRAFT";

  const project: ProjectRecord = {
    id: randomUUID(),
    workspaceId: params.workspaceId,
    clientId: client.id,
    projectName: params.projectName.trim(),
    referenceNumber,
    websiteCategory: params.websiteCategory,
    description: params.description?.trim() || null,
    objectives: params.objectives?.trim() || null,
    status: initialStatus,
    managerId: params.managerId || params.actorId,
    targetLaunchDate: params.targetLaunchDate ?? null,
    budgetRange: params.budgetRange?.trim() || null,
    completionPercentage: 0,
    internalNotes: params.internalNotes?.trim() || null,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
  };

  const generatedToken = generateInvitationToken(
    params.invitationExpiryDays ?? 30
  );

  const session: StoredSessionRecord = {
    id: randomUUID(),
    projectId: project.id,
    templateId: template.id,
    templateVersion: template.version,
    invitationTokenHash: generatedToken.tokenHash,
    latestRawTokenHint: generatedToken.rawToken,
    sectionReviewStates: {},
    expiresAt: generatedToken.expiresAt,
    revokedAt: null,
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  // Pre-fill basic client business details in Section 1 for client convenience
  const prefilledResponses: Record<string, unknown> = {
    organisation_name: client.organisationName,
    business_description: client.businessDescription ?? "",
    industry: client.industry ?? "",
    physical_address: [client.address, client.city, client.country]
      .filter(Boolean)
      .join(", "),
    primary_contact_name: client.contactName,
    contact_email: client.contactEmail,
    phone_number: client.phone ?? "",
    whatsapp_number: client.whatsapp ?? "",
    existing_website: client.website ?? "",
  };

  const completion = calculateQuestionnaireCompletion(
    template.sections,
    prefilledResponses
  );
  project.completionPercentage = completion.overallPercentage;

  store.projects.push(project);
  store.sessions.push(session);
  store.responses[session.id] = prefilledResponses;

  store.activityLogs.push({
    id: randomUUID(),
    projectId: project.id,
    actorId: params.actorId,
    actorLabel: params.actorLabel,
    action: "PROJECT_CREATED",
    details: {
      referenceNumber: project.referenceNumber,
      websiteCategory: project.websiteCategory,
      templateId: template.id,
      status: project.status,
    },
    createdAt: now,
  });

  saveStore(store);
  return {
    project,
    session,
    rawInvitationToken: generatedToken.rawToken,
  };
}

export function rotateOrRevokeInvitationToken(params: {
  workspaceId: string;
  projectId: string;
  actorId: string;
  actorLabel: string;
  action: "ROTATE" | "REVOKE";
  expiryDays?: number;
}): { rawToken?: string; session: StoredSessionRecord } {
  const store = loadStore();
  const project = store.projects.find(
    (p) => p.id === params.projectId && p.workspaceId === params.workspaceId
  );
  if (!project) {
    throw new Error("Project not found in workspace.");
  }

  const now = new Date();
  const activeSessions = store.sessions.filter(
    (s) => s.projectId === project.id && !s.revokedAt
  );

  // Revoke existing active sessions
  for (const s of activeSessions) {
    s.revokedAt = now;
    s.updatedAt = now;
  }

  if (params.action === "REVOKE") {
    store.activityLogs.push({
      id: randomUUID(),
      projectId: project.id,
      actorId: params.actorId,
      actorLabel: params.actorLabel,
      action: "INVITATION_REVOKED",
      details: {},
      createdAt: now,
    });
    saveStore(store);
    return { session: activeSessions[0] };
  }

  // ROTATE: create a new token hash while preserving previous responses
  const previousSession =
    activeSessions[0] ??
    store.sessions.find((s) => s.projectId === project.id);
  const templateId =
    previousSession?.templateId ??
    getTemplateBlueprintByCategory(project.websiteCategory).id;

  const generated = generateInvitationToken(params.expiryDays ?? 30);
  const newSession: StoredSessionRecord = {
    id: randomUUID(),
    projectId: project.id,
    templateId,
    templateVersion: previousSession?.templateVersion ?? 1,
    invitationTokenHash: generated.tokenHash,
    latestRawTokenHint: generated.rawToken,
    sectionReviewStates: previousSession?.sectionReviewStates ?? {},
    expiresAt: generated.expiresAt,
    revokedAt: null,
    submittedAt: previousSession?.submittedAt ?? null,
    createdAt: now,
    updatedAt: now,
  };

  store.sessions.push(newSession);
  if (previousSession && store.responses[previousSession.id]) {
    store.responses[newSession.id] = {
      ...store.responses[previousSession.id],
    };
  } else {
    store.responses[newSession.id] = {};
  }

  if (project.status === "DRAFT") {
    project.status = "INVITATION_SENT";
    project.updatedAt = now;
  }

  store.activityLogs.push({
    id: randomUUID(),
    projectId: project.id,
    actorId: params.actorId,
    actorLabel: params.actorLabel,
    action: "INVITATION_GENERATED",
    details: { expiresAt: generated.expiresAt.toISOString() },
    createdAt: now,
  });

  saveStore(store);
  return { rawToken: generated.rawToken, session: newSession };
}

export function transitionProjectStatus(params: {
  workspaceId: string;
  projectId: string;
  actorId: string;
  actorLabel: string;
  nextStatus: ProjectStatus;
  reason?: string;
}): ProjectRecord {
  const store = loadStore();
  const project = store.projects.find(
    (p) => p.id === params.projectId && p.workspaceId === params.workspaceId
  );
  if (!project) {
    throw new Error("Project not found in workspace.");
  }

  if (!canTransitionProjectStatus(project.status, params.nextStatus)) {
    throw new Error(
      `Invalid status transition from ${project.status} to ${params.nextStatus}.`
    );
  }

  const previousStatus = project.status;
  const now = new Date();
  project.status = params.nextStatus;
  project.updatedAt = now;

  // If reopening a submitted questionnaire back to IN_PROGRESS, unlock session
  if (params.nextStatus === "IN_PROGRESS") {
    for (const s of store.sessions.filter(
      (sess) => sess.projectId === project.id && !sess.revokedAt
    )) {
      s.submittedAt = null;
      s.updatedAt = now;
    }
  }

  store.activityLogs.push({
    id: randomUUID(),
    projectId: project.id,
    actorId: params.actorId,
    actorLabel: params.actorLabel,
    action: "STATUS_CHANGED",
    details: {
      from: previousStatus,
      to: params.nextStatus,
      reason: params.reason ?? null,
    },
    createdAt: now,
  });

  saveStore(store);
  return project;
}

export function getProjectWorkspaceDetail(
  workspaceId: string,
  projectId: string
) {
  const store = loadStore();
  const project = store.projects.find(
    (p) => p.id === projectId && p.workspaceId === workspaceId
  );
  if (!project) return null;

  const client = store.clients.find((c) => c.id === project.clientId);
  if (!client) return null;

  const activeSession =
    store.sessions
      .filter((s) => s.projectId === project.id && !s.revokedAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0] ??
    store.sessions
      .filter((s) => s.projectId === project.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

  const template =
    (activeSession && getTemplateBlueprintById(activeSession.templateId)) ||
    getTemplateBlueprintByCategory(project.websiteCategory);

  const responses = activeSession
    ? (store.responses[activeSession.id] ?? {})
    : {};

  const completion = calculateQuestionnaireCompletion(
    template.sections,
    responses
  );

  const files = store.files
    .filter((f) => f.projectId === project.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const notes = store.notes
    .filter((n) => n.projectId === project.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const clarifications = store.clarifications
    .filter((c) => c.projectId === project.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const activityLogs = store.activityLogs
    .filter((a) => a.projectId === project.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const documents = store.documents
    .filter((d) => d.projectId === project.id)
    .sort((a, b) => b.version - a.version);

  return {
    project,
    client,
    session: activeSession ?? null,
    template,
    responses,
    completion,
    files,
    notes,
    clarifications,
    activityLogs,
    documents,
  };
}

// -----------------------------------------------------------------------------
// Client Portal Session Resolution & Questionnaire Mutations (Phase 3 & 4 Ready)
// -----------------------------------------------------------------------------

export function getPortalSessionByToken(rawToken: string) {
  const store = loadStore();
  if (!rawToken || !rawToken.trim()) return null;

  const tokenHash = hashInvitationToken(rawToken);
  const session = store.sessions.find(
    (s) => s.invitationTokenHash === tokenHash
  );
  if (!session) return null;

  const project = store.projects.find((p) => p.id === session.projectId);
  if (!project) return null;

  const client = store.clients.find((c) => c.id === project.clientId);
  if (!client) return null;

  const template =
    getTemplateBlueprintById(session.templateId) ??
    getTemplateBlueprintByCategory(project.websiteCategory);

  const responses = store.responses[session.id] ?? {};
  const completion = calculateQuestionnaireCompletion(
    template.sections,
    responses
  );

  const tokenState = evaluateSessionTokenState({
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    submittedAt: session.submittedAt,
    projectStatus: project.status,
  });

  const files = store.files.filter((f) => f.projectId === project.id);
  const clarifications = store.clarifications.filter(
    (c) => c.projectId === project.id
  );

  // IMPORTANT: Never expose internal agency notes (`project_notes`, `client.internalNotes`, `project.internalNotes`) to client portal
  return {
    session,
    project: {
      id: project.id,
      projectName: project.projectName,
      referenceNumber: project.referenceNumber,
      websiteCategory: project.websiteCategory,
      description: project.description,
      objectives: project.objectives,
      status: project.status,
      targetLaunchDate: project.targetLaunchDate,
      budgetRange: project.budgetRange,
      completionPercentage: completion.overallPercentage,
      submittedAt: project.submittedAt,
    },
    client: {
      id: client.id,
      organisationName: client.organisationName,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
    },
    template,
    responses,
    completion,
    tokenState,
    files,
    clarifications,
  };
}

export function saveQuestionnaireAnswersByToken(params: {
  rawToken: string;
  sectionKey: string;
  answers: Record<string, unknown>;
}) {
  const store = loadStore();
  const tokenHash = hashInvitationToken(params.rawToken);
  const session = store.sessions.find(
    (s) => s.invitationTokenHash === tokenHash
  );
  if (!session) {
    throw new Error("Invalid or unknown invitation token.");
  }

  const project = store.projects.find((p) => p.id === session.projectId);
  if (!project) {
    throw new Error("Associated project not found.");
  }

  const tokenState = evaluateSessionTokenState({
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    submittedAt: session.submittedAt,
    projectStatus: project.status,
  });

  if (!tokenState.canEdit) {
    throw new Error(
      `This questionnaire cannot be edited right now (${tokenState.reason}).`
    );
  }

  const current = store.responses[session.id] ?? {};
  const merged = {
    ...current,
    ...params.answers,
  };
  store.responses[session.id] = merged;

  const template =
    getTemplateBlueprintById(session.templateId) ??
    getTemplateBlueprintByCategory(project.websiteCategory);
  const completion = calculateQuestionnaireCompletion(
    template.sections,
    merged
  );

  const now = new Date();
  session.updatedAt = now;
  project.completionPercentage = completion.overallPercentage;
  project.updatedAt = now;

  if (project.status === "DRAFT" || project.status === "INVITATION_SENT") {
    project.status = "IN_PROGRESS";
  }

  saveStore(store);

  return {
    savedAt: now.toISOString(),
    completion,
    projectStatus: project.status,
  };
}

export function submitQuestionnaireByToken(params: {
  rawToken: string;
  confirmedAccurate: boolean;
}) {
  if (!params.confirmedAccurate) {
    throw new Error(
      "You must explicitly confirm that your responses are accurate before submitting."
    );
  }

  const store = loadStore();
  const tokenHash = hashInvitationToken(params.rawToken);
  const session = store.sessions.find(
    (s) => s.invitationTokenHash === tokenHash
  );
  if (!session) {
    throw new Error("Invalid or unknown invitation token.");
  }

  const project = store.projects.find((p) => p.id === session.projectId);
  if (!project) {
    throw new Error("Associated project not found.");
  }

  const tokenState = evaluateSessionTokenState({
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    submittedAt: session.submittedAt,
    projectStatus: project.status,
  });

  if (!tokenState.canEdit) {
    throw new Error(
      `Questionnaire cannot be submitted in its current state (${tokenState.reason}).`
    );
  }

  const template =
    getTemplateBlueprintById(session.templateId) ??
    getTemplateBlueprintByCategory(project.websiteCategory);
  const responses = store.responses[session.id] ?? {};
  const completion = calculateQuestionnaireCompletion(
    template.sections,
    responses
  );

  if (!completion.isReadyForSubmission) {
    const incompleteTitles = completion.sections
      .filter((s) => !s.isComplete)
      .map((s) => s.title)
      .join(", ");
    throw new Error(
      `Please complete all required questions before submitting. Incomplete sections: ${incompleteTitles}`
    );
  }

  const now = new Date();
  session.submittedAt = now;
  session.updatedAt = now;
  project.status = "SUBMITTED";
  project.submittedAt = now;
  project.completionPercentage = completion.overallPercentage;
  project.updatedAt = now;

  const client = store.clients.find((c) => c.id === project.clientId);

  store.activityLogs.push({
    id: randomUUID(),
    projectId: project.id,
    actorId: null,
    actorLabel: client ? `${client.contactName} (Client)` : "Client",
    action: "QUESTIONNAIRE_SUBMITTED",
    details: {
      submittedAt: now.toISOString(),
      completionPercentage: completion.overallPercentage,
    },
    createdAt: now,
  });

  saveStore(store);
  return {
    submittedAt: now.toISOString(),
    projectStatus: project.status,
    completion,
  };
}

// -----------------------------------------------------------------------------
// Review Notes, Clarifications & Workspace Team Management
// -----------------------------------------------------------------------------

export function addProjectNoteRecord(params: {
  workspaceId: string;
  projectId: string;
  authorId: string;
  authorLabel: string;
  note: string;
  visibility: NoteVisibility;
}): ProjectNoteRecord {
  const store = loadStore();
  const project = store.projects.find(
    (p) => p.id === params.projectId && p.workspaceId === params.workspaceId
  );
  if (!project) {
    throw new Error("Project not found in workspace.");
  }

  const now = new Date();
  const record: ProjectNoteRecord = {
    id: randomUUID(),
    projectId: project.id,
    authorId: params.authorId,
    note: params.note.trim(),
    visibility: params.visibility,
    createdAt: now,
  };

  store.notes.push(record);
  store.activityLogs.push({
    id: randomUUID(),
    projectId: project.id,
    actorId: params.authorId,
    actorLabel: params.authorLabel,
    action: "INTERNAL_NOTE_ADDED",
    details: { visibility: params.visibility },
    createdAt: now,
  });

  saveStore(store);
  return record;
}

export function updateSectionReviewState(params: {
  workspaceId: string;
  projectId: string;
  actorId: string;
  actorLabel: string;
  sectionKey: string;
  reviewStatus: SectionReviewStatus;
}) {
  const store = loadStore();
  const project = store.projects.find(
    (p) => p.id === params.projectId && p.workspaceId === params.workspaceId
  );
  if (!project) {
    throw new Error("Project not found in workspace.");
  }

  const session = store.sessions.find(
    (s) => s.projectId === project.id && !s.revokedAt
  );
  if (!session) {
    throw new Error("Active project session not found.");
  }

  const states = { ...(session.sectionReviewStates ?? {}) };
  states[params.sectionKey] = params.reviewStatus;
  session.sectionReviewStates = states;
  session.updatedAt = new Date();

  if (project.status === "SUBMITTED") {
    project.status = "UNDER_REVIEW";
    project.updatedAt = new Date();
  }

  store.activityLogs.push({
    id: randomUUID(),
    projectId: project.id,
    actorId: params.actorId,
    actorLabel: params.actorLabel,
    action: "SECTION_REVIEW_UPDATED",
    details: {
      sectionKey: params.sectionKey,
      reviewStatus: params.reviewStatus,
    },
    createdAt: new Date(),
  });

  saveStore(store);
  return session.sectionReviewStates;
}

export function createClarificationRequestRecord(params: {
  workspaceId: string;
  projectId: string;
  actorId: string;
  actorLabel: string;
  sectionKey: string;
  questionKey?: string;
  message: string;
}): ClarificationRequestRecord {
  const store = loadStore();
  const project = store.projects.find(
    (p) => p.id === params.projectId && p.workspaceId === params.workspaceId
  );
  if (!project) {
    throw new Error("Project not found in workspace.");
  }

  const now = new Date();
  const record: ClarificationRequestRecord = {
    id: randomUUID(),
    projectId: project.id,
    sectionKey: params.sectionKey,
    questionKey: params.questionKey?.trim() || null,
    message: params.message.trim(),
    clientResponse: null,
    status: "OPEN",
    requestedBy: params.actorId,
    resolvedAt: null,
    createdAt: now,
  };

  store.clarifications.push(record);
  project.status = "AWAITING_CLIENT_RESPONSE";
  project.updatedAt = now;

  store.activityLogs.push({
    id: randomUUID(),
    projectId: project.id,
    actorId: params.actorId,
    actorLabel: params.actorLabel,
    action: "CLARIFICATION_REQUESTED",
    details: {
      sectionKey: params.sectionKey,
      questionKey: params.questionKey ?? null,
    },
    createdAt: now,
  });

  saveStore(store);
  return record;
}

export function respondToClarificationByToken(params: {
  rawToken: string;
  clarificationId: string;
  responseText: string;
}): ClarificationRequestRecord {
  const store = loadStore();
  const tokenHash = hashInvitationToken(params.rawToken);
  const session = store.sessions.find(
    (s) => s.invitationTokenHash === tokenHash && !s.revokedAt
  );
  if (!session) {
    throw new Error("Invalid or expired invitation token.");
  }

  const clarification = store.clarifications.find(
    (c) => c.id === params.clarificationId && c.projectId === session.projectId
  );
  if (!clarification) {
    throw new Error("Clarification request not found.");
  }

  const project = store.projects.find((p) => p.id === session.projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  const now = new Date();
  clarification.clientResponse = params.responseText.trim();
  clarification.status = "ANSWERED";
  clarification.resolvedAt = now;

  const remainingOpen = store.clarifications.filter(
    (c) => c.projectId === project.id && c.status === "OPEN"
  );
  if (remainingOpen.length === 0 && project.status === "AWAITING_CLIENT_RESPONSE") {
    project.status = "SUBMITTED";
    project.updatedAt = now;
  }

  store.activityLogs.push({
    id: randomUUID(),
    projectId: project.id,
    actorId: null,
    actorLabel: "Client",
    action: "CLARIFICATION_ANSWERED",
    details: {
      clarificationId: clarification.id,
      sectionKey: clarification.sectionKey,
    },
    createdAt: now,
  });

  saveStore(store);
  return clarification;
}

export function listWorkspaceMembers(workspaceId: string) {
  const store = loadStore();
  const userMap = new Map(store.users.map((u) => [u.id, u]));

  return store.workspaceMembers
    .filter((m) => m.workspaceId === workspaceId)
    .map((m) => {
      const user = userMap.get(m.userId);
      return {
        membershipId: m.id,
        userId: m.userId,
        role: m.role,
        createdAt: m.createdAt,
        fullName: user?.fullName ?? "Workspace Member",
        email: user?.email ?? "",
      };
    });
}

export function addOrUpdateWorkspaceMember(params: {
  workspaceId: string;
  email: string;
  fullName: string;
  role: WorkspaceRole;
}) {
  const store = loadStore();
  const normalizedEmail = params.email.trim().toLowerCase();
  const now = new Date();

  let user = store.users.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (!user) {
    user = {
      id: randomUUID(),
      clerkUserId: `invited_${randomUUID().slice(0, 8)}`,
      email: normalizedEmail,
      fullName: params.fullName.trim(),
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(user);
  }

  const existingMembership = store.workspaceMembers.find(
    (m) => m.workspaceId === params.workspaceId && m.userId === user.id
  );
  if (existingMembership) {
    existingMembership.role = params.role;
    saveStore(store);
    return existingMembership;
  }

  const created: WorkspaceMemberRecord = {
    id: randomUUID(),
    workspaceId: params.workspaceId,
    userId: user.id,
    role: params.role,
    createdAt: now,
  };
  store.workspaceMembers.push(created);
  saveStore(store);
  return created;
}

export function listTemplatesForWorkspace(): TemplateBlueprint[] {
  const store = loadStore();
  return store.templates;
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  FolderKanban,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ClientRecord,
  ProjectStatus,
  WebsiteCategory,
} from "@/db/schema";
import type { EnrichedProjectListItem } from "@/lib/data/repository";
import type { TemplateBlueprint } from "@/lib/questionnaire/default-templates";
import { createProjectAction } from "@/actions/projects";
import {
  PROJECT_STATUS_LABELS,
  WEBSITE_CATEGORY_LABELS,
} from "@/lib/validations/project";
import { formatDate } from "@/lib/utils";
import { STANDARD_BUDGET_TIERS } from "@/lib/currency";
import { useCurrency } from "@/components/currency-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ProjectStatusBadge,
  WebsiteCategoryBadge,
} from "@/components/projects/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WorkspaceMemberOption {
  userId: string;
  fullName: string;
  role: string;
}

export function ProjectsManager({
  initialProjects,
  clients,
  templates,
  managers,
  canCreate,
}: {
  initialProjects: EnrichedProjectListItem[];
  clients: ClientRecord[];
  templates: TemplateBlueprint[];
  managers: WorkspaceMemberOption[];
  canCreate: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatBudget, currencyConfig } = useCurrency();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>(
    searchParams.get("status") || searchParams.get("filter") || "ALL"
  );
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");
  const [managerFilter, setManagerFilter] = React.useState<string>("ALL");

  const [dialogOpen, setDialogOpen] = React.useState(
    searchParams.get("new") === "1"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Created invitation confirmation state
  const [createdInvitation, setCreatedInvitation] = React.useState<{
    projectId: string;
    projectName: string;
    invitationPath: string;
  } | null>(null);

  // Project creation form state
  const preselectedClientId = searchParams.get("clientId") || "";
  const [clientMode, setClientMode] = React.useState<"existing" | "new">(
    clients.length > 0 ? "existing" : "new"
  );
  const [clientId, setClientId] = React.useState(
    preselectedClientId || (clients[0]?.id ?? "")
  );

  // Inline new client state
  const [newOrganisationName, setNewOrganisationName] = React.useState("");
  const newOrganisationType = "Private Limited Company";
  const [newIndustry, setNewIndustry] = React.useState("");
  const [newContactName, setNewContactName] = React.useState("");
  const [newContactEmail, setNewContactEmail] = React.useState("");
  const newPhone = "";

  // Project fields
  const [projectName, setProjectName] = React.useState("");
  const [websiteCategory, setWebsiteCategory] =
    React.useState<WebsiteCategory>("CORPORATE");
  const [templateId, setTemplateId] = React.useState<string>(
    templates[0]?.id ?? "tpl-corporate-v1"
  );
  const [description, setDescription] = React.useState("");
  const [objectives, setObjectives] = React.useState("");
  const [managerId, setManagerId] = React.useState<string>(
    managers[0]?.userId ?? ""
  );
  const [targetLaunchDate, setTargetLaunchDate] = React.useState("");
  const [budgetRange, setBudgetRange] = React.useState("3500_to_7500_usd");
  const [internalNotes, setInternalNotes] = React.useState("");
  const [invitationExpiryDays, setInvitationExpiryDays] = React.useState(30);

  // Auto-select matching template when websiteCategory changes
  function handleCategoryChange(cat: WebsiteCategory) {
    setWebsiteCategory(cat);
    const matchingTemplate = templates.find((t) => t.websiteCategory === cat);
    if (matchingTemplate) {
      setTemplateId(matchingTemplate.id);
    }
  }

  const filteredProjects = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialProjects.filter((proj) => {
      if (statusFilter !== "ALL" && proj.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && proj.websiteCategory !== categoryFilter)
        return false;
      if (managerFilter !== "ALL" && proj.managerId !== managerFilter)
        return false;
      if (q) {
        const hay = [
          proj.projectName,
          proj.referenceNumber,
          proj.clientName,
          proj.clientEmail,
          proj.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    initialProjects,
    search,
    statusFilter,
    categoryFilter,
    managerFilter,
  ]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createProjectAction({
        clientMode,
        clientId: clientMode === "existing" ? clientId : undefined,
        newOrganisationName:
          clientMode === "new" ? newOrganisationName : undefined,
        newOrganisationType:
          clientMode === "new" ? newOrganisationType : undefined,
        newIndustry: clientMode === "new" ? newIndustry : undefined,
        newContactName: clientMode === "new" ? newContactName : undefined,
        newContactEmail: clientMode === "new" ? newContactEmail : undefined,
        newPhone: clientMode === "new" ? newPhone : undefined,
        projectName,
        websiteCategory,
        templateId,
        description,
        objectives,
        managerId,
        targetLaunchDate,
        budgetRange,
        internalNotes,
        generateInvitationImmediately: true,
        invitationExpiryDays,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success(
        `Project "${res.data.project.projectName}" (${res.data.project.referenceNumber}) created.`
      );
      setCreatedInvitation({
        projectId: res.data.project.id,
        projectName: res.data.project.projectName,
        invitationPath: res.data.invitationPath,
      });
      setProjectName("");
      setDescription("");
      setObjectives("");
      setInternalNotes("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyLink(pathOrUrl: string) {
    const fullUrl =
      typeof window !== "undefined" && pathOrUrl.startsWith("/")
        ? `${window.location.origin}${pathOrUrl}`
        : pathOrUrl;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Invitation link copied to clipboard.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Discovery Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Initiate website discovery projects, manage client invitations, and
            track questionnaire completion.
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => {
              setCreatedInvitation(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" /> Create Project
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search project, reference, or client..."
                className="pl-9"
              />
            </div>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="ALL">All Statuses</option>
              {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map(
                (st) => (
                  <option key={st} value={st}>
                    {PROJECT_STATUS_LABELS[st]}
                  </option>
                )
              )}
            </select>

            <select
              aria-label="Filter by website category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="ALL">All Website Categories</option>
              {(Object.keys(WEBSITE_CATEGORY_LABELS) as WebsiteCategory[]).map(
                (cat) => (
                  <option key={cat} value={cat}>
                    {WEBSITE_CATEGORY_LABELS[cat]}
                  </option>
                )
              )}
            </select>

            <select
              aria-label="Filter by project manager"
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="ALL">All Project Managers</option>
              {managers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Website Discovery Projects ({filteredProjects.length})
          </CardTitle>
          <CardDescription>
            Select any project to review responses, manage invitations, request
            clarifications, or generate a 20-section brief.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <FolderKanban className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 font-medium">No matching projects found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Adjust your search filters or initiate a new website discovery
                project.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project & Reference</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Discovery Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target Launch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((proj) => (
                  <TableRow key={proj.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/projects/${proj.id}`}
                        className="font-semibold hover:underline"
                      >
                        {proj.projectName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {proj.referenceNumber}
                        {proj.managerName ? ` • PM: ${proj.managerName}` : ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/clients/${proj.clientId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {proj.clientName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {proj.clientEmail}
                      </p>
                    </TableCell>
                    <TableCell>
                      <WebsiteCategoryBadge category={proj.websiteCategory} />
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Completion
                          </span>
                          <span className="font-semibold">
                            {proj.completionPercentage}%
                          </span>
                        </div>
                        <Progress value={proj.completionPercentage} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={proj.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(proj.targetLaunchDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {proj.latestInvitationTokenHint && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyLink(
                                `/portal/projects/${proj.latestInvitationTokenHint}`
                              )
                            }
                            title="Copy client invitation link"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/projects/${proj.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Project & Invitation Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Website Discovery Project</DialogTitle>
            <DialogDescription>
              Configure the client, website category, adaptive questionnaire
              template, and generate a secure client invitation link.
            </DialogDescription>
          </DialogHeader>

          {createdInvitation ? (
            <div className="space-y-4">
              <Alert variant="success">
                <CheckCircle2 className="mb-1 size-4" />
                <AlertTitle>
                  Project & Client Invitation Link Generated
                </AlertTitle>
                <AlertDescription>
                  Share this secure invitation link with your client to begin{" "}
                  <strong>{createdInvitation.projectName}</strong>.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
                <Label className="text-xs">Unique Client Invitation Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={
                      typeof window !== "undefined"
                        ? `${window.location.origin}${createdInvitation.invitationPath}`
                        : createdInvitation.invitationPath
                    }
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyLink(createdInvitation.invitationPath)}
                  >
                    <Copy className="size-4" /> Copy
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  asChild
                  onClick={() => setDialogOpen(false)}
                >
                  <Link href={createdInvitation.invitationPath}>
                    Open Client Portal <ExternalLink className="size-4" />
                  </Link>
                </Button>
                <Button asChild onClick={() => setDialogOpen(false)}>
                  <Link
                    href={`/dashboard/projects/${createdInvitation.projectId}`}
                  >
                    Go to Project Workspace
                  </Link>
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Step 1: Select Existing Client or Create New Client */}
              <div className="space-y-2 rounded-lg border border-border p-3.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">
                    1. Client Selection
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        clientMode === "existing" ? "default" : "outline"
                      }
                      onClick={() => setClientMode("existing")}
                    >
                      Existing Client
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={clientMode === "new" ? "default" : "outline"}
                      onClick={() => setClientMode("new")}
                    >
                      + New Client
                    </Button>
                  </div>
                </div>

                {clientMode === "existing" ? (
                  <div className="pt-2">
                    <select
                      aria-label="Select existing client"
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      <option value="">-- Select a client --</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.organisationName} ({c.contactName} —{" "}
                          {c.contactEmail})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Organisation Name *</Label>
                      <Input
                        required
                        value={newOrganisationName}
                        onChange={(e) =>
                          setNewOrganisationName(e.target.value)
                        }
                        placeholder="e.g. PrimeCare Hospitals"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Industry</Label>
                      <Input
                        value={newIndustry}
                        onChange={(e) => setNewIndustry(e.target.value)}
                        placeholder="e.g. Healthcare"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Contact Person *</Label>
                      <Input
                        required
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="e.g. Dr. Emeka Obi"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Contact Email *</Label>
                      <Input
                        type="email"
                        required
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        placeholder="emeka@primecare.ng"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Project Name, Category & Questionnaire Template */}
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Project Name *</Label>
                <Input
                  id="p-name"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Corporate Website Redesign & Customer Portal"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="p-cat">Website Category *</Label>
                  <select
                    id="p-cat"
                    value={websiteCategory}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value as WebsiteCategory)
                    }
                    className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  >
                    {(
                      Object.keys(
                        WEBSITE_CATEGORY_LABELS
                      ) as WebsiteCategory[]
                    ).map((cat) => (
                      <option key={cat} value={cat}>
                        {WEBSITE_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="p-tpl">Questionnaire Template *</Label>
                  <select
                    id="p-tpl"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} (v{tpl.version})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Manager, Launch Date, Budget & Expiry */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-pm">Assigned Project Manager</Label>
                  <select
                    id="p-pm"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  >
                    {managers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="p-launch">Target Launch Date</Label>
                  <Input
                    id="p-launch"
                    type="date"
                    value={targetLaunchDate}
                    onChange={(e) => setTargetLaunchDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="p-budget">
                    Estimated Budget Range ({currencyConfig.code} {currencyConfig.symbol})
                  </Label>
                  <select
                    id="p-budget"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  >
                    {STANDARD_BUDGET_TIERS.map((tier) => (
                      <option key={tier.value} value={tier.value}>
                        {formatBudget(tier.value)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="p-desc">Project Description</Label>
                  <Textarea
                    id="p-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Scope summary..."
                    className="min-h-[68px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-obj">Initial Project Objectives</Label>
                  <Textarea
                    id="p-obj"
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    placeholder="Key goals discussed on initial discovery call..."
                    className="min-h-[68px]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="p-notes">
                    Internal Agency Notes (Private)
                  </Label>
                  <Input
                    id="p-notes"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Internal scoping notes..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-expiry">Invitation Expiry (Days)</Label>
                  <Input
                    id="p-expiry"
                    type="number"
                    min={1}
                    max={180}
                    value={invitationExpiryDays}
                    onChange={(e) =>
                      setInvitationExpiryDays(Number(e.target.value) || 30)
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Creating Project..."
                    : "Create Project & Generate Invitation"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

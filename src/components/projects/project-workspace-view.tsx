"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  KeyRound,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ClarificationRequestRecord,
  ClientRecord,
  ProjectActivityLogRecord,
  ProjectDocumentRecord,
  ProjectFileRecord,
  ProjectNoteRecord,
  ProjectRecord,
  ProjectStatus,
} from "@/db/schema";
import type { StoredSessionRecord } from "@/lib/data/repository";
import type { TemplateBlueprint } from "@/lib/questionnaire/default-templates";
import type { QuestionnaireCompletionSummary } from "@/lib/questionnaire/completion";
import {
  manageProjectInvitationAction,
  updateProjectStatusAction,
} from "@/actions/projects";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import { canTransitionProjectStatus } from "@/lib/auth/permissions";
import { formatBytes, formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ProjectStatusBadge,
  WebsiteCategoryBadge,
} from "@/components/projects/status-badge";

const ALL_STATUSES: ProjectStatus[] = [
  "DRAFT",
  "INVITATION_SENT",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "AWAITING_CLIENT_RESPONSE",
  "APPROVED",
  "ARCHIVED",
];

function formatAnswerPreview(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object") {
      return `${value.length} item(s): ${JSON.stringify(value)}`;
    }
    return value.join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function ProjectWorkspaceView({
  project,
  client,
  session,
  template,
  responses,
  completion,
  files,
  notes,
  clarifications,
  activityLogs,
}: {
  project: ProjectRecord;
  client: ClientRecord;
  session: StoredSessionRecord | null;
  template: TemplateBlueprint;
  responses: Record<string, unknown>;
  completion: QuestionnaireCompletionSummary;
  files: ProjectFileRecord[];
  notes: ProjectNoteRecord[];
  clarifications: ClarificationRequestRecord[];
  activityLogs: ProjectActivityLogRecord[];
  documents: ProjectDocumentRecord[];
}) {
  const router = useRouter();
  const { formatBudget } = useCurrency();
  const [busy, setBusy] = React.useState(false);
  const [activeTokenHint, setActiveTokenHint] = React.useState<
    string | undefined
  >(session?.latestRawTokenHint);

  const portalPath = activeTokenHint
    ? `/portal/projects/${activeTokenHint}`
    : undefined;

  function copyPortalUrl() {
    if (!portalPath) return;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${portalPath}`
        : portalPath;
    navigator.clipboard.writeText(url);
    toast.success("Client invitation link copied to clipboard.");
  }

  async function handleStatusChange(nextStatus: ProjectStatus) {
    if (nextStatus === project.status) return;
    setBusy(true);
    try {
      const res = await updateProjectStatusAction({
        projectId: project.id,
        nextStatus,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `Project status changed to ${PROJECT_STATUS_LABELS[nextStatus]}.`
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleTokenAction(action: "ROTATE" | "REVOKE") {
    setBusy(true);
    try {
      const res = await manageProjectInvitationAction({
        projectId: project.id,
        action,
        expiryDays: 30,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      if (action === "REVOKE") {
        setActiveTokenHint(undefined);
        toast.success("Invitation token revoked.");
      } else {
        setActiveTokenHint(res.data.rawToken);
        toast.success("New invitation token generated.");
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="space-y-1">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to Discovery Projects
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">
              {project.projectName}
            </h1>
            <Badge variant="outline">{project.referenceNumber}</Badge>
            <WebsiteCategoryBadge category={project.websiteCategory} />
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-xs text-muted-foreground">
            Client:{" "}
            <Link
              href={`/dashboard/clients/${client.id}`}
              className="font-medium text-foreground hover:underline"
            >
              {client.organisationName}
            </Link>{" "}
            ({client.contactName} — {client.contactEmail})
          </p>
        </div>

        {/* Status Transition Control */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Change project status"
            disabled={busy}
            value={project.status}
            onChange={(e) =>
              handleStatusChange(e.target.value as ProjectStatus)
            }
            className="h-9 rounded-md border border-input bg-card px-3 text-xs font-medium"
          >
            {ALL_STATUSES.map((st) => {
              const allowed = canTransitionProjectStatus(project.status, st);
              return (
                <option key={st} value={st} disabled={!allowed}>
                  Status: {PROJECT_STATUS_LABELS[st]}
                  {!allowed ? " (unavailable)" : ""}
                </option>
              );
            })}
          </select>

          {portalPath && (
            <Button variant="accent" size="sm" asChild>
              <Link href={portalPath}>
                Open Client Questionnaire <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards: Discovery Completion & Invitation Token */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Questionnaire Completion
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {completion.overallPercentage}%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={completion.overallPercentage} />
            <p className="text-xs text-muted-foreground">
              {completion.completedSectionCount} of{" "}
              {completion.totalSectionCount} sections complete (
              {completion.answeredRequiredQuestions}/
              {completion.totalRequiredQuestions} required questions answered)
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-1.5 text-base">
                  <KeyRound className="size-4 text-brand-blue" /> Client
                  Invitation Link
                </CardTitle>
                <CardDescription>
                  Token hashed at rest (SHA-256). Expires{" "}
                  {formatDate(session?.expiresAt)}.
                  {session?.revokedAt ? " [REVOKED]" : ""}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => handleTokenAction("ROTATE")}
                >
                  <RefreshCw className="size-3.5" />{" "}
                  {portalPath ? "Rotate Link" : "Generate Link"}
                </Button>
                {session && !session.revokedAt && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busy}
                    onClick={() => handleTokenAction("REVOKE")}
                  >
                    <ShieldAlert className="size-3.5" /> Revoke
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {portalPath && !session?.revokedAt ? (
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}${portalPath}`
                      : portalPath
                  }
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="sm" onClick={copyPortalUrl}>
                  <Copy className="size-4" /> Copy
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No active invitation link. Click <strong>Generate Link</strong>{" "}
                to issue a new token for the client.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Tabs */}
      <Tabs defaultValue="responses">
        <TabsList>
          <TabsTrigger value="responses">
            Questionnaire Responses ({completion.completedSectionCount}/
            {completion.totalSectionCount})
          </TabsTrigger>
          <TabsTrigger value="overview">Project Overview</TabsTrigger>
          <TabsTrigger value="files">
            Uploaded Files ({files.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes & Clarifications ({notes.length + clarifications.length})
          </TabsTrigger>
          <TabsTrigger value="activity">
            Activity Log ({activityLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-4">
          {template.sections.map((sec) => {
            const secSummary = completion.sections.find(
              (s) => s.sectionKey === sec.sectionKey
            );
            return (
              <Card key={sec.sectionKey}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{sec.title}</CardTitle>
                      <CardDescription>{sec.description}</CardDescription>
                    </div>
                    <Badge
                      variant={secSummary?.isComplete ? "success" : "warning"}
                    >
                      {secSummary?.completionPercentage ?? 0}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border text-sm">
                    {sec.questions.map((q) => {
                      const val = responses[q.questionKey];
                      return (
                        <div
                          key={q.questionKey}
                          className="grid gap-1 py-2.5 sm:grid-cols-3"
                        >
                          <div className="font-medium text-muted-foreground">
                            {q.label}
                            {q.isRequired && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </div>
                          <div className="sm:col-span-2 break-words">
                            {q.questionKey === "budget_range" &&
                            typeof val === "string"
                              ? formatBudget(val)
                              : formatAnswerPreview(val)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Project Metadata & Scope
              </CardTitle>
              <CardDescription>
                Template: {template.name} (v{template.version})
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Description
                </p>
                <p className="mt-1">{project.description || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Objectives
                </p>
                <p className="mt-1">{project.objectives || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Target Launch Date
                </p>
                <p className="mt-1">{formatDate(project.targetLaunchDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Estimated Budget Range
                </p>
                <p className="mt-1">{formatBudget(project.budgetRange)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Internal Agency Notes (Private)
                </p>
                <p className="mt-1">{project.internalNotes || "—"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Supporting Client Documents ({files.length})
              </CardTitle>
              <CardDescription>
                Logos, brand manuals, and reference documents uploaded to this
                project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No files have been uploaded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{file.originalFilename}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.mimeType} • {formatBytes(file.fileSize)} •
                          Uploaded by {file.uploadedBy} on{" "}
                          {formatDate(file.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline">{file.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Internal Agency Notes ({notes.length})
              </CardTitle>
              <CardDescription>
                Private notes visible only to agency staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No internal notes recorded yet.
                </p>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-border p-3 text-sm"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <Badge variant="secondary">{n.visibility}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <p>{n.note}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Project Audit Trail ({activityLogs.length})
              </CardTitle>
              <CardDescription>
                Chronological history of project actions and status transitions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    {log.action.includes("SUBMITTED") ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <Clock className="size-4 text-brand-blue" />
                    )}
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        By {log.actorLabel}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FolderKanban,
  Plus,
  Send,
} from "lucide-react";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { getDashboardMetrics } from "@/lib/data/repository";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import type { ProjectStatus } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

export default async function DashboardPage() {
  const ctx = await requireWorkspaceContext();
  const metrics = getDashboardMetrics(ctx.workspaceId);

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Agency Discovery Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Live overview of client onboarding, active questionnaires, and project
            brief readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/clients?new=1">
              <Plus className="size-4" /> Add Client
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/dashboard/projects?new=1">
              <FolderKanban className="size-4" /> Create Project
            </Link>
          </Button>
          <Button variant="accent" size="sm" asChild>
            <Link href="/dashboard/projects?filter=SUBMITTED">
              <ClipboardCheck className="size-4" /> Review Submissions
            </Link>
          </Button>
        </div>
      </div>

      {/* 6 Core Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Total Clients</span>
              <Building2 className="size-4 text-brand-blue" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.totalClients}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Active client organisations
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Total Projects</span>
              <FolderKanban className="size-4 text-brand-blue" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.totalProjects}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Avg. completion: {metrics.averageCompletionRate}%
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>In Progress</span>
              <Clock className="size-4 text-amber-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.projectsInProgress}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Active discovery workflows
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Completed Discovery</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.completedDiscoveryProjects}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Submitted or approved
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Awaiting Submission</span>
              <Send className="size-4 text-sky-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.awaitingClientSubmissions}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Pending client completion
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>Needs Clarification</span>
              <AlertCircle className="size-4 text-red-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.requiringClarification}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Awaiting client response
          </CardContent>
        </Card>
      </div>

      {/* Project Status Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project Status Summary</CardTitle>
          <CardDescription>
            Distribution of projects across the discovery lifecycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {ALL_STATUSES.map((status) => (
              <Link
                key={status}
                href={`/dashboard/projects?status=${status}`}
                className="flex flex-col justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:border-brand-blue"
              >
                <span className="text-xs text-muted-foreground">
                  {PROJECT_STATUS_LABELS[status]}
                </span>
                <span className="mt-2 text-xl font-bold">
                  {metrics.statusBreakdown[status] ?? 0}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects & Submissions / Outstanding Client Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently Created Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recently Created Projects</CardTitle>
              <CardDescription>
                Latest website discovery projects initiated by your agency.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/projects">
                View All <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {metrics.recentProjects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No projects created yet. Click <strong>Create Project</strong> to
                onboard your first client.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-border p-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="font-semibold hover:underline truncate"
                        >
                          {project.projectName}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          ({project.referenceNumber})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{project.clientName}</span>
                        <span>•</span>
                        <WebsiteCategoryBadge category={project.websiteCategory} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24">
                        <div className="mb-1 flex justify-between text-[11px]">
                          <span>Discovery</span>
                          <span className="font-semibold">
                            {project.completionPercentage}%
                          </span>
                        </div>
                        <Progress value={project.completionPercentage} />
                      </div>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Submitted Questionnaires & Outstanding Client Tasks */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Recently Submitted Questionnaires
              </CardTitle>
              <CardDescription>
                Completed client discoveries ready for agency review and brief
                generation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.recentSubmissions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No submitted questionnaires yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {metrics.recentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <Link
                          href={`/dashboard/projects/${sub.id}`}
                          className="text-sm font-semibold hover:underline"
                        >
                          {sub.projectName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {sub.clientName} • Submitted{" "}
                          {formatDate(sub.submittedAt)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/projects/${sub.id}`}>
                          Review
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Outstanding Client Tasks</CardTitle>
              <CardDescription>
                Projects currently awaiting questionnaire completion or
                clarification replies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.outstandingClientTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  All active clients are up to date.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {metrics.outstandingClientTasks.map((task) => (
                    <div
                      key={task.projectId}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <Link
                          href={`/dashboard/projects/${task.projectId}`}
                          className="text-sm font-semibold hover:underline"
                        >
                          {task.projectName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {task.clientName} • {task.completionPercentage}%
                          complete
                          {task.openClarifications > 0 &&
                            ` • ${task.openClarifications} open clarification(s)`}
                        </p>
                      </div>
                      <ProjectStatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

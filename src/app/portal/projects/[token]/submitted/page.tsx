import Link from "next/link";
import { CheckCircle2, Eye, Lock, Edit3, ShieldAlert } from "lucide-react";
import { getPortalSessionByToken } from "@/lib/data/repository";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import { formatDate } from "@/lib/utils";
import { PortalShell } from "@/components/layout/portal-shell";
import { ClarificationResponder } from "@/components/questionnaire/clarification-responder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PortalSubmittedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = getPortalSessionByToken(token);

  if (!data || !data.tokenState.canRead) {
    return (
      <PortalShell>
        <div className="mx-auto max-w-lg py-12">
          <Card>
            <CardHeader>
              <ShieldAlert className="mb-2 size-8 text-red-500" />
              <CardTitle>Session Not Available</CardTitle>
              <CardDescription>
                This invitation link is invalid, expired, or has been revoked.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/portal">Return to Portal</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      projectName={data.project.projectName}
      clientName={data.client.organisationName}
      statusLabel={PROJECT_STATUS_LABELS[data.project.status]}
    >
      <div className="mx-auto max-w-3xl space-y-6 py-4">
        <Card className="border-emerald-300/70">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="size-8" />
            </div>
            <Badge variant="success" className="mx-auto mb-2">
              {PROJECT_STATUS_LABELS[data.project.status]}
            </Badge>
            <CardTitle className="text-2xl">
              Discovery Questionnaire Received
            </CardTitle>
            <CardDescription className="max-w-lg mx-auto">
              Thank you, {data.client.contactName}. Your website discovery
              responses for <strong>{data.project.projectName}</strong> (
              {data.project.referenceNumber}) have been persisted and sent to our
              engineering and design team.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 text-xs sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground block">
                  Submitted Timestamp
                </span>
                <span className="font-semibold">
                  {formatDate(data.project.submittedAt || new Date())}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  Discovery Completion
                </span>
                <span className="font-semibold">
                  {data.completion.overallPercentage}% (
                  {data.completion.completedSectionCount}/
                  {data.completion.totalSectionCount} Sections)
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  Editing Lock Status
                </span>
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Lock className="size-3" />{" "}
                  {data.tokenState.canEdit
                    ? "Unlocked for Clarification"
                    : "Locked for Agency Review"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button variant="outline" asChild>
                <Link href={`/portal/projects/${token}/review`}>
                  <Eye className="size-4" /> View Submitted Answers
                </Link>
              </Button>
              {data.tokenState.canEdit && (
                <Button variant="default" asChild>
                  <Link href={`/portal/projects/${token}`}>
                    <Edit3 className="size-4" /> Update Questionnaire Sections
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clarification Requests Panel */}
        <ClarificationResponder
          rawToken={token}
          clarifications={data.clarifications}
        />
      </div>
    </PortalShell>
  );
}

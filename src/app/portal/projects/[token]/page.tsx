import * as React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getPortalSessionByToken } from "@/lib/data/repository";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import { PortalShell } from "@/components/layout/portal-shell";
import { QuestionnaireWizard } from "@/components/questionnaire/questionnaire-wizard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PortalProjectWizardPage({
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
              <CardTitle>Invitation Link Unavailable</CardTitle>
              <CardDescription>
                {data?.tokenState.reason === "REVOKED"
                  ? "This invitation link has been revoked or superseded by a newer link from your project manager."
                  : data?.tokenState.reason === "EXPIRED"
                    ? "This invitation link has expired. Please request a fresh link from your development agency."
                    : "We could not find an active discovery session matching this invitation token."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/portal">Return to Portal Entry</Link>
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
      <React.Suspense
        fallback={
          <div className="p-8 text-center text-sm">
            Loading discovery questionnaire...
          </div>
        }
      >
        <QuestionnaireWizard
          rawToken={token}
          projectName={data.project.projectName}
          referenceNumber={data.project.referenceNumber}
          template={data.template}
          initialResponses={data.responses}
          canEdit={data.tokenState.canEdit}
          lockReason={data.tokenState.reason}
          clarifications={data.clarifications}
        />
      </React.Suspense>
    </PortalShell>
  );
}

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getPortalSessionByToken } from "@/lib/data/repository";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import { PortalShell } from "@/components/layout/portal-shell";
import { QuestionnaireReview } from "@/components/questionnaire/questionnaire-review";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PortalProjectReviewPage({
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
                This discovery session is invalid, expired, or has been revoked.
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
      <QuestionnaireReview
        rawToken={token}
        projectName={data.project.projectName}
        referenceNumber={data.project.referenceNumber}
        template={data.template}
        responses={data.responses}
        completion={data.completion}
        files={data.files}
        canEdit={data.tokenState.canEdit}
      />
    </PortalShell>
  );
}

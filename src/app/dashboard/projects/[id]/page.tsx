import { notFound } from "next/navigation";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { getProjectWorkspaceDetail } from "@/lib/data/repository";
import { ProjectWorkspaceView } from "@/components/projects/project-workspace-view";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireWorkspaceContext();
  const detail = getProjectWorkspaceDetail(ctx.workspaceId, id);

  if (!detail) {
    notFound();
  }

  return (
    <ProjectWorkspaceView
      project={detail.project}
      client={detail.client}
      session={detail.session}
      template={detail.template}
      responses={detail.responses}
      completion={detail.completion}
      files={detail.files}
      notes={detail.notes}
      clarifications={detail.clarifications}
      activityLogs={detail.activityLogs}
      documents={detail.documents}
    />
  );
}

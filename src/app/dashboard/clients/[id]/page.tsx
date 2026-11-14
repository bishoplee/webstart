import { notFound } from "next/navigation";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { hasPermission } from "@/lib/auth/permissions";
import { getClientById } from "@/lib/data/repository";
import { ClientDetailEditor } from "@/components/clients/client-detail-editor";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireWorkspaceContext("clients:view");
  const data = getClientById(ctx.workspaceId, id);

  if (!data) {
    notFound();
  }

  const canEdit = hasPermission(ctx.role, "clients:edit");

  return (
    <ClientDetailEditor
      client={data.client}
      projects={data.projects}
      canEdit={canEdit}
    />
  );
}

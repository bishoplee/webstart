import * as React from "react";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { hasPermission } from "@/lib/auth/permissions";
import { listClients } from "@/lib/data/repository";
import { ClientsManager } from "@/components/clients/clients-manager";

export default async function ClientsPage() {
  const ctx = await requireWorkspaceContext("clients:view");
  const clients = listClients(ctx.workspaceId, { includeArchived: true });
  const canEdit = hasPermission(ctx.role, "clients:create");

  return (
    <React.Suspense fallback={<div className="p-6 text-sm">Loading clients...</div>}>
      <ClientsManager initialClients={clients} canEdit={canEdit} />
    </React.Suspense>
  );
}

import * as React from "react";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { hasPermission } from "@/lib/auth/permissions";
import {
  listClients,
  listProjects,
  listTemplatesForWorkspace,
  listWorkspaceMembers,
} from "@/lib/data/repository";
import { ProjectsManager } from "@/components/projects/projects-manager";

export default async function ProjectsPage() {
  const ctx = await requireWorkspaceContext();
  const projects = listProjects(ctx.workspaceId);
  const clients = listClients(ctx.workspaceId, { includeArchived: false });
  const templates = listTemplatesForWorkspace();
  const members = listWorkspaceMembers(ctx.workspaceId);
  const canCreate = hasPermission(ctx.role, "projects:create");

  return (
    <React.Suspense
      fallback={<div className="p-6 text-sm">Loading projects...</div>}
    >
      <ProjectsManager
        initialProjects={projects}
        clients={clients}
        templates={templates}
        managers={members}
        canCreate={canCreate}
      />
    </React.Suspense>
  );
}

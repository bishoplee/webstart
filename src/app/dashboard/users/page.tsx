import { requireWorkspaceContext } from "@/lib/auth/context";
import { hasPermission } from "@/lib/auth/permissions";
import { listWorkspaceMembers } from "@/lib/data/repository";
import { TeamManager } from "@/components/layout/team-manager";

export default async function UsersPage() {
  const ctx = await requireWorkspaceContext();
  const members = listWorkspaceMembers(ctx.workspaceId);
  const canManage = hasPermission(ctx.role, "users:manage");

  return <TeamManager members={members} canManage={canManage} />;
}

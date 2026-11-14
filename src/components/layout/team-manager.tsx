"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { WorkspaceRole } from "@/db/schema";
import { inviteWorkspaceMemberAction } from "@/actions/workspace";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MemberItem {
  membershipId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: Date | string;
  fullName: string;
  email: string;
}

export function TeamManager({
  members,
  canManage,
}: {
  members: MemberItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<WorkspaceRole>("ADMIN");
  const [saving, setSaving] = React.useState(false);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await inviteWorkspaceMemberAction({ fullName, email, role });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`Added ${fullName} as ${role}.`);
      setFullName("");
      setEmail("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Agency Team & Access Control
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage workspace administrators, project managers, and role-based
          permissions.
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Add or Update Workspace Member
            </CardTitle>
            <CardDescription>
              Assign Super Administrator, Agency Administrator, or Project
              Manager roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleAddMember}
              className="grid gap-4 sm:grid-cols-4 sm:items-end"
            >
              <div className="space-y-1.5">
                <Label htmlFor="m-name">Full Name *</Label>
                <Input
                  id="m-name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kemi Adewale"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-email">Email Address *</Label>
                <Input
                  id="m-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kemi@webstart.agency"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-role">Workspace Role</Label>
                <select
                  id="m-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                >
                  <option value="SUPER_ADMIN">
                    Platform Owner (SUPER_ADMIN)
                  </option>
                  <option value="ADMIN">Agency Administrator (ADMIN)</option>
                  <option value="PROJECT_MANAGER">
                    Project Manager (PROJECT_MANAGER)
                  </option>
                </select>
              </div>
              <Button type="submit" disabled={saving}>
                <UserPlus className="size-4" />
                {saving ? "Saving..." : "Assign Role"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Active Workspace Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.membershipId}>
                  <TableCell className="font-medium">{m.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="accent">{m.role}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(m.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

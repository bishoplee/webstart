import * as React from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getWorkspaceContext } from "@/lib/auth/context";
import { isAgencyStaffRole } from "@/lib/auth/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getWorkspaceContext();

  if (!context) {
    redirect("/sign-in");
  }

  if (!isAgencyStaffRole(context.role)) {
    redirect("/portal");
  }

  return <DashboardShell context={context}>{children}</DashboardShell>;
}

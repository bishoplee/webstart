"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Building2,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Shield,
  Users,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CurrencySwitcher } from "@/components/layout/currency-switcher";
import type { AuthenticatedWorkspaceContext } from "@/lib/auth/context";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/clients", label: "Clients", icon: Building2 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  {
    href: "/dashboard/templates",
    label: "Questionnaire Templates",
    icon: ClipboardCheck,
  },
  { href: "/dashboard/users", label: "Team & Roles", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({
  context,
  children,
}: {
  context: AuthenticatedWorkspaceContext;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-brand-navy text-white lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-brand-lime text-brand-navy font-bold">
              W
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">
                WebStart
              </span>
              <span className="block text-[11px] text-slate-300">
                {context.workspaceName}
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-lime text-brand-navy font-semibold"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Active Role
              </span>
              <Badge variant="accent" className="text-[10px]">
                {context.role.replace("_", " ")}
              </Badge>
            </div>
            <p className="mt-1.5 truncate text-xs font-medium text-white">
              {context.fullName}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {context.email}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
            <Link
              href="/portal"
              className="inline-flex items-center gap-1 hover:text-brand-lime"
            >
              Client Portal <ExternalLink className="size-3" />
            </Link>
            <Link href="/" className="hover:text-white">
              Public Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {context.workspaceName}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                From client ideas to development-ready projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <CurrencySwitcher />
            {context.isDemoFallback ? (
              <Badge variant="warning" className="hidden sm:inline-flex gap-1">
                <Shield className="size-3" /> Local Dev Mode
              </Badge>
            ) : (
              <UserButton />
            )}
            <ThemeToggle />
            <Button variant="accent" size="sm" asChild>
              <Link href="/dashboard/projects?new=1">+ New Project</Link>
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-brand-navy px-4 py-4 text-white lg:hidden">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-brand-lime text-brand-navy font-semibold"
                        : "text-slate-200 hover:bg-white/10"
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

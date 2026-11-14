import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CurrencySwitcher } from "@/components/layout/currency-switcher";
import { Badge } from "@/components/ui/badge";

export function PortalShell({
  projectName,
  clientName,
  statusLabel,
  children,
}: {
  projectName?: string;
  clientName?: string;
  statusLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md no-print">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-brand-navy text-brand-lime font-bold">
                W
              </div>
              <span className="font-bold tracking-tight">WebStart Portal</span>
            </Link>
            {projectName && (
              <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
                <span className="text-sm font-medium text-foreground">
                  {projectName}
                </span>
                {clientName && (
                  <span className="text-xs text-muted-foreground">
                    ({clientName})
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CurrencySwitcher />
            {statusLabel && <Badge variant="info">{statusLabel}</Badge>}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card py-4 text-xs text-muted-foreground no-print">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-brand-blue" />
            <span>
              Encrypted client discovery session — Do not submit passwords or secret
              keys.
            </span>
          </div>
          <div>Powered by WebStart</div>
        </div>
      </footer>
    </div>
  );
}

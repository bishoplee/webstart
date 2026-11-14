import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CurrencySwitcher } from "@/components/layout/currency-switcher";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-navy text-brand-lime font-bold">
                W
              </div>
              <span className="text-lg font-bold tracking-tight">WebStart</span>
            </Link>

            <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
              <Link
                href="/how-it-works"
                className="transition-colors hover:text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="/about"
                className="transition-colors hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-foreground"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <CurrencySwitcher compact />
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal">Client Portal</Link>
            </Button>
            <Button variant="accent" size="sm" asChild>
              <Link href="/dashboard">
                Agency Workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card py-10 text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded bg-brand-navy text-brand-lime font-bold text-xs">
                  W
                </div>
                <span className="font-bold text-foreground">WebStart</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed">
                From client ideas to development-ready projects. Structured website
                discovery and automated project brief generation for modern agencies.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Platform</p>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li>
                  <Link href="/how-it-works" className="hover:text-foreground">
                    How Discovery Works
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Agency Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/portal" className="hover:text-foreground">
                    Client Discovery Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground">Company</p>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About WebStart
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-foreground">
                    Agency Registration
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground">Legal & Compliance</p>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy (NDPA / GDPR)
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs sm:flex-row">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-brand-lime" />
              <span>
                © {new Date().getFullYear()} WebStart Platform. All rights reserved.
              </span>
            </div>
            <div>Designed for Web Development Agencies & Product Teams</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

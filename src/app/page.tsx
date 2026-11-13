import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-navy text-brand-lime font-bold">
              W
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">WebStart</span>
              <span className="ml-2 hidden rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-block">
                Agency Discovery Platform
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Agency Dashboard</Link>
            </Button>
            <Button variant="accent" size="sm" asChild>
              <Link href="/portal">
                Client Portal <ArrowRight className="size-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-card to-background py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <Badge variant="accent" className="mb-4">
              Structured Website Project Discovery
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              From client ideas to development-ready projects.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Replace scattered WhatsApp messages, spreadsheets, and incomplete emails
              with a guided, adaptive client onboarding workflow that generates
              actionable 20-section engineering briefs.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" variant="default" asChild>
                <Link href="/dashboard">
                  Open Agency Workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/portal">Access Client Questionnaire</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <ClipboardList className="mb-2 size-8 text-brand-blue" />
                <CardTitle>Adaptive Questionnaires</CardTitle>
                <CardDescription>
                  7 website category templates with 11 structured sections and conditional
                  feature follow-ups.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Supports Corporate, E-Commerce, Education, NGO, Portfolio, Customer Portals,
                and Custom Systems.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Layers className="mb-2 size-8 text-brand-blue" />
                <CardTitle>Debounced Autosave</CardTitle>
                <CardDescription>
                  Server-confirmed progress persistence so clients can complete discovery
                  at their own pace on desktop or mobile.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Real-time completion percentage and section validation before submission.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldCheck className="mb-2 size-8 text-brand-blue" />
                <CardTitle>Agency Review & Audit</CardTitle>
                <CardDescription>
                  Review section by section, add private internal notes, and request
                  targeted client clarifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Hashed invitation tokens with expiry, revocation, and workspace isolation.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="mb-2 size-8 text-brand-blue" />
                <CardTitle>20-Section Project Briefs</CardTitle>
                <CardDescription>
                  Convert verified client answers into structured HTML, Markdown, and PDF
                  project documentation.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Separates client requirements, agency observations, recommendations, and
                assumptions.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-brand-lime" />
            <span>WebStart — Client Discovery & Project Initiation Platform</span>
          </div>
          <div>Built with Next.js, TypeScript, Drizzle ORM & Neon PostgreSQL</div>
        </div>
      </footer>
    </div>
  );
}

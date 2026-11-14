import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderKanban,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <PublicShell>
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-card to-background py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="accent" className="mb-4">
            Client Discovery & Project Initiation Platform
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            From client ideas to development-ready projects.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            WebStart replaces scattered WhatsApp messages, spreadsheets, and
            unstructured requirement documents with a guided discovery workflow that
            converts client answers into actionable 20-section software development
            briefs.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" variant="default" asChild>
              <Link href="/dashboard">
                Open Agency Workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/portal">Client Onboarding Portal</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Who It Serves & Why Structured Discovery Matters */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built for Web Development Agencies & Their Clients
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Every website project fails or succeeds during discovery. WebStart
            eliminates scope creep before a single line of code is written.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Building2 className="mb-2 size-7 text-brand-blue" />
              <CardTitle>For Agency Owners & Admins</CardTitle>
              <CardDescription>
                Standardise client onboarding across your entire agency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Centralise client profiles, contacts, and project history.</p>
              <p>• Issue expiring, revocable project invitation links.</p>
              <p>• Track live completion rates across all active discoveries.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FolderKanban className="mb-2 size-7 text-brand-blue" />
              <CardTitle>For Project Managers & Engineers</CardTitle>
              <CardDescription>
                Capture technical, content, and functional specifics upfront.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Conditional follow-up prompts for payments, booking & portals.</p>
              <p>• Request targeted clarifications on incomplete sections.</p>
              <p>• Export structured 20-section briefs to HTML, Markdown, or PDF.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="mb-2 size-7 text-brand-blue" />
              <CardTitle>For Onboarding Clients</CardTitle>
              <CardDescription>
                A calm, guided wizard that works effortlessly on mobile or desktop.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Complete one section at a time with automatic server save.</p>
              <p>• Upload logos, brand manuals, and reference documents securely.</p>
              <p>• Review all responses before final submission.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How the 4-Step Discovery Workflow Works */}
      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              How the WebStart Discovery Process Works
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Four structured steps from initial client registration to an approved
              engineering specification.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-background p-5">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-lime">
                01
              </span>
              <h3 className="mt-3 font-semibold">Create Client & Project</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Select one of 7 adaptive website category templates (Corporate,
                E-Commerce, Education, NGO, Portfolio, Web App, or Custom) and
                generate a secure invitation link.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-5">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-lime">
                02
              </span>
              <h3 className="mt-3 font-semibold">Guided Client Questionnaire</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                The client completes 11 structured discovery sections with real-time
                autosave, custom page specifications, and supporting file uploads.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-5">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-lime">
                03
              </span>
              <h3 className="mt-3 font-semibold">Agency Review & Clarifications</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Administrators review each section, record private internal notes,
                and trigger clarification requests if any details are missing.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-5">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-lime">
                04
              </span>
              <h3 className="mt-3 font-semibold">Generate 20-Section Brief</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Approve discovery and generate a versioned project brief separating
                client inputs, agency observations, recommendations, and assumptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <ClipboardList className="mb-2 size-7 text-brand-blue" />
              <CardTitle className="text-base">7 Adaptive Templates</CardTitle>
              <CardDescription className="text-xs">
                Tailored question sets for Corporate, E-Commerce, Educational, NGO,
                Portfolio, Customer Portals, and Custom builds.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Layers className="mb-2 size-7 text-brand-blue" />
              <CardTitle className="text-base">Server-Confirmed Autosave</CardTitle>
              <CardDescription className="text-xs">
                Debounced persistence saves progress to the database as clients type,
                supporting seamless resume on any device.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheck className="mb-2 size-7 text-brand-blue" />
              <CardTitle className="text-base">Security & Isolation</CardTitle>
              <CardDescription className="text-xs">
                SHA-256 hashed invitation tokens, workspace isolation, magic-byte
                upload verification, and private internal notes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="mb-2 size-7 text-brand-blue" />
              <CardTitle className="text-base">PDF & Markdown Export</CardTitle>
              <CardDescription className="text-xs">
                One-click generation of printable HTML, Markdown, and PDF project
                briefs ready for design and engineering handoff.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 rounded-2xl bg-brand-navy p-8 text-center text-white sm:p-12">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-brand-lime">
            <Sparkles className="size-3.5" /> Ready to begin onboarding?
          </div>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Start a new website discovery project in under two minutes.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
            Have an invitation token from your development agency? Enter it directly
            in the Client Portal, or sign in to the Agency Workspace to manage
            projects.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="accent" size="lg" asChild>
              <Link href="/portal">
                Begin Client Onboarding <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/dashboard">Agency Dashboard</Link>
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-brand-lime" /> Save & resume
              anytime
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-brand-lime" /> Mobile-friendly
              wizard
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-brand-lime" /> Instant 20-section
              brief
            </span>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

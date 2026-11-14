import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, Layers, Shield } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            About WebStart
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Eliminating ambiguity between client vision and engineering execution.
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            WebStart was built for web development agencies that want a reliable,
            repeatable process for onboarding new website clients. Instead of chasing
            requirements across emails, WhatsApp voice notes, and disconnected docs,
            WebStart structures every discovery conversation from day one.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Compass className="mb-2 size-6 text-brand-blue" />
              <CardTitle className="text-base">Purpose-Built Discovery</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Every website category—from corporate portals to schools, NGOs, and
              online stores—has distinct operational questions. WebStart adapts the
              questionnaire automatically.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Layers className="mb-2 size-6 text-brand-blue" />
              <CardTitle className="text-base">Engineering-Ready Output</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Client responses are transformed into a 20-section development brief
              that clearly separates client facts, agency observations, technical
              recommendations, and unconfirmed assumptions.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="mb-2 size-6 text-brand-blue" />
              <CardTitle className="text-base">Security & Governance</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Role-based access control, workspace data isolation, SHA-256 hashed
              invitation links, and complete audit logging protect agency and client
              intellectual property.
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg font-bold">Core Principles</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-lime" />
              <span>Never force a school or NGO through a generic store form.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-lime" />
              <span>Ask intelligent follow-up questions when complex features are chosen.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-lime" />
              <span>Keep internal agency notes strictly separate from client views.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-lime" />
              <span>Never ask clients to transmit passwords or secret keys.</span>
            </li>
          </ul>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/dashboard">
                Explore Agency Dashboard <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/how-it-works">View Step-by-Step Workflow</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

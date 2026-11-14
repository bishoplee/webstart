import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WORKFLOW_STEPS = [
  {
    step: "Step 1",
    title: "Client & Project Setup",
    actor: "Agency Administrator",
    summary:
      "Register the client organisation, choose the website category (Corporate, E-Commerce, Education, NGO, Portfolio, Web App, or Custom), assign a project manager, and generate a secure expiring invitation link.",
  },
  {
    step: "Step 2",
    title: "Adaptive 11-Section Discovery Wizard",
    actor: "Client",
    summary:
      "The client opens their unique invitation URL on desktop or mobile and completes one logical section at a time. Progress is autosaved to the database after every change.",
  },
  {
    step: "Step 3",
    title: "Conditional Feature Deep-Dive & File Uploads",
    actor: "Client",
    summary:
      "Selecting features like Online Payments, Booking, User Accounts, or E-Commerce automatically reveals relevant follow-up questions. Clients upload logos, brand guidelines, and reference assets.",
  },
  {
    step: "Step 4",
    title: "Final Review & Submission Lock",
    actor: "Client",
    summary:
      "Before submitting, the client reviews completed and incomplete sections, confirms accuracy, and submits. Ordinary editing locks automatically and the agency is notified.",
  },
  {
    step: "Step 5",
    title: "Agency Section Review & Clarification Requests",
    actor: "Agency Admin / Project Manager",
    summary:
      "The agency team inspects answers section by section, records private internal notes, and sends targeted clarification requests if any requirement needs elaboration.",
  },
  {
    step: "Step 6",
    title: "20-Section Project Brief Generation & Export",
    actor: "Agency Admin / Project Manager",
    summary:
      "Once discovery is approved, WebStart compiles a comprehensive 20-section Project Brief with HTML preview, printable layout, Markdown export, and downloadable PDF.",
  },
];

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="accent" className="mb-3">
            Discovery Workflow
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            How WebStart Transforms Client Onboarding
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            A structured 6-stage lifecycle designed to keep clients focused and give
            engineering teams complete clarity.
          </p>
        </div>

        <div className="mt-10 grid gap-5">
          {WORKFLOW_STEPS.map((item) => (
            <Card key={item.step}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Badge variant="default">{item.step}</Badge>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                  <Badge variant="outline">{item.actor}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.summary}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="size-5 text-brand-lime" />
            <span>Ready to launch a discovery session or access your invitation?</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/portal">Client Portal</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/dashboard">
                Agency Dashboard <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

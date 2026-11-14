"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Sparkles } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PortalLandingPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = React.useState("");

  function handleOpenToken(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = tokenInput.trim();
    if (!cleaned) return;

    // Extract token if user pasted a full URL
    const match = cleaned.match(/\/portal\/projects\/([^/?#]+)/);
    const token = match ? match[1] : cleaned;
    router.push(`/portal/projects/${encodeURIComponent(token)}`);
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-xl space-y-6 py-8">
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-brand-navy text-brand-lime">
              <KeyRound className="size-5" />
            </div>
            <CardTitle className="text-xl">
              Client Project Discovery Portal
            </CardTitle>
            <CardDescription>
              Enter your unique project invitation token or paste the invitation
              URL shared by your project manager to access or resume your
              website discovery questionnaire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOpenToken} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="portal-token">
                  Invitation Token or Portal Link *
                </Label>
                <Input
                  id="portal-token"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste your invitation token or URL..."
                  className="font-mono text-xs"
                />
              </div>
              <Button type="submit" className="w-full">
                Open Discovery Questionnaire <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Quick-Access Links for Development Verification */}
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Sparkles className="size-4 text-brand-blue" /> Sample Discovery
              Sessions (Development Preview)
            </CardTitle>
            <CardDescription className="text-xs">
              Click either sample session below to test the adaptive client
              discovery wizard directly:
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href="/portal/projects/demo-crestview-education-token-2026">
                Crestview Academy (In Progress)
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href="/portal/projects/demo-veritas-corporate-token-2026">
                Veritas Meridian (Submitted)
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}

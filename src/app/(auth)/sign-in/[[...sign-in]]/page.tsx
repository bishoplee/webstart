import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { ArrowRight, KeyRound, ShieldAlert } from "lucide-react";
import { getIntegrationCapabilities } from "@/lib/env";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignInPage() {
  const { clerkConfigured } = getIntegrationCapabilities();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-brand-navy text-brand-lime font-bold text-lg">
          W
        </div>
        <div>
          <p className="text-xl font-bold tracking-tight">WebStart</p>
          <p className="text-xs text-muted-foreground">
            Client Discovery & Project Initiation
          </p>
        </div>
      </div>

      {clerkConfigured ? (
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
              <KeyRound className="size-5 text-brand-blue" />
            </div>
            <CardTitle>Sign In to WebStart</CardTitle>
            <CardDescription>
              Access your agency discovery workspace or assigned client projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="warning">
              <ShieldAlert className="mb-1 size-4" />
              <AlertTitle>Local Development Authentication Mode</AlertTitle>
              <AlertDescription>
                Clerk API keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and
                `CLERK_SECRET_KEY`) are not yet configured in `.env.local`. You can
                continue into the workspace using the local development Super
                Administrator session.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button variant="default" asChild className="w-full sm:w-auto">
              <Link href="/dashboard">
                Continue to Workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

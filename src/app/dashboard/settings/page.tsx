import { CheckCircle2, AlertTriangle } from "lucide-react";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { getIntegrationCapabilities } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const ctx = await requireWorkspaceContext();
  const capabilities = getIntegrationCapabilities();

  const integrations = [
    {
      name: "Neon Serverless PostgreSQL",
      envVars: "DATABASE_URL / DIRECT_DATABASE_URL",
      configured: capabilities.databaseConfigured,
      fallback: "Using local persistent JSON repository (.local-uploads/webstart-db.json)",
    },
    {
      name: "Clerk Authentication",
      envVars: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY",
      configured: capabilities.clerkConfigured,
      fallback: "Using local development Super Administrator session",
    },
    {
      name: "Cloudinary Private File Storage",
      envVars: "CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET",
      configured: capabilities.cloudinaryConfigured,
      fallback: "Using local verified storage adapter (.local-uploads/files)",
    },
    {
      name: "Resend Transactional Email",
      envVars: "RESEND_API_KEY / EMAIL_FROM",
      configured: capabilities.resendConfigured,
      fallback: "Copyable invitation links enabled with admin notification status log",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Workspace & Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Inspect agency workspace metadata and external service integration
          readiness.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agency Workspace Profile</CardTitle>
          <CardDescription>
            Multi-tenant workspace isolation identifier and active session
            details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Workspace Name
            </p>
            <p className="mt-1 font-medium">{ctx.workspaceName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Workspace Slug
            </p>
            <p className="mt-1 font-mono text-xs">{ctx.workspaceSlug}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Your Role
            </p>
            <div className="mt-1">
              <Badge variant="accent">{ctx.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            External Service Integrations
          </CardTitle>
          <CardDescription>
            Optional and production services degrade gracefully when unconfigured
            in local development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrations.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {item.envVars}
                </p>
                {!item.configured && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Fallback active: {item.fallback}
                  </p>
                )}
              </div>

              {item.configured ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="size-3.5" /> Connected
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <AlertTriangle className="size-3.5" /> Local / Unconfigured
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

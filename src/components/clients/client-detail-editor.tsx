"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  FolderPlus,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import type { ClientRecord, ProjectRecord } from "@/db/schema";
import {
  toggleArchiveClientAction,
  updateClientAction,
} from "@/actions/clients";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ProjectStatusBadge,
  WebsiteCategoryBadge,
} from "@/components/projects/status-badge";

export function ClientDetailEditor({
  client,
  projects,
  canEdit,
}: {
  client: ClientRecord;
  projects: ProjectRecord[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const { formatBudget } = useCurrency();
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [organisationName, setOrganisationName] = React.useState(
    client.organisationName
  );
  const [organisationType, setOrganisationType] = React.useState(
    client.organisationType ?? ""
  );
  const [industry, setIndustry] = React.useState(client.industry ?? "");
  const [contactName, setContactName] = React.useState(client.contactName);
  const [contactEmail, setContactEmail] = React.useState(client.contactEmail);
  const [phone, setPhone] = React.useState(client.phone ?? "");
  const [whatsapp, setWhatsapp] = React.useState(client.whatsapp ?? "");
  const [website, setWebsite] = React.useState(client.website ?? "");
  const [address, setAddress] = React.useState(client.address ?? "");
  const [city, setCity] = React.useState(client.city ?? "");
  const [country, setCountry] = React.useState(client.country ?? "");
  const [businessDescription, setBusinessDescription] = React.useState(
    client.businessDescription ?? ""
  );
  const [internalNotes, setInternalNotes] = React.useState(
    client.internalNotes ?? ""
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateClientAction(client.id, {
        organisationName,
        organisationType,
        industry,
        contactName,
        contactEmail,
        phone,
        whatsapp,
        website,
        address,
        city,
        country,
        businessDescription,
        socialLinks: client.socialLinks ?? {},
        internalNotes,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success("Client profile updated.");
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveToggle() {
    const res = await toggleArchiveClientAction(client.id, !client.isArchived);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(
      !client.isArchived ? "Client archived." : "Client restored."
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to Client Directory
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">
              {client.organisationName}
            </h1>
            {client.isArchived && <Badge variant="outline">Archived</Badge>}
            {client.industry && (
              <Badge variant="secondary">{client.industry}</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing((prev) => !prev)}
              >
                {editing ? "Cancel Editing" : "Edit Profile"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveToggle}
              >
                <Archive className="size-4" />
                {client.isArchived ? "Restore Client" : "Archive Client"}
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href={`/dashboard/projects?new=1&clientId=${client.id}`}>
                  <FolderPlus className="size-4" /> Create Project
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Client Information</CardTitle>
            <CardDescription>
              Update contact details, business overview, and internal agency
              notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Organisation Name *</Label>
                  <Input
                    required
                    value={organisationName}
                    onChange={(e) => setOrganisationName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Organisation Type</Label>
                  <Input
                    value={organisationType}
                    onChange={(e) => setOrganisationType(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label>Contact Person *</Label>
                  <Input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Email *</Label>
                  <Input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp</Label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Business Description</Label>
                <Textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Internal Agency Notes (Private)</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={saving}>
                <Save className="size-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Organisation Overview</CardTitle>
              <CardDescription>
                Registered on {formatDate(client.createdAt)} • Last updated{" "}
                {formatDate(client.updatedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Business Description
                </p>
                <p className="mt-1">
                  {client.businessDescription || "No business description recorded."}
                </p>
              </div>

              <div className="grid gap-4 pt-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Primary Contact
                  </p>
                  <p className="font-medium">{client.contactName}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="size-3.5" /> {client.contactEmail}
                  </p>
                  {client.phone && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="size-3.5" /> {client.phone} (WhatsApp:{" "}
                      {client.whatsapp || client.phone})
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Location & Web
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />{" "}
                    {[client.address, client.city, client.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                  {client.website && (
                    <p className="flex items-center gap-1.5 text-xs text-brand-blue">
                      <Globe className="size-3.5" /> {client.website}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-base">
                <Shield className="size-4 text-brand-blue" /> Internal Agency Notes
              </CardTitle>
              <CardDescription>
                Strictly private to agency workspace staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {client.internalNotes || "No internal notes added yet."}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Associated Projects & History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">
              Associated Discovery Projects ({projects.length})
            </CardTitle>
            <CardDescription>
              All website discovery initiatives commissioned by{" "}
              {client.organisationName}.
            </CardDescription>
          </div>
          {canEdit && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/projects?new=1&clientId=${client.id}`}>
                <FolderPlus className="size-4" /> New Project
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No website projects have been created for this client yet.
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="font-semibold hover:underline"
                      >
                        {project.projectName}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        ({project.referenceNumber})
                      </span>
                      <WebsiteCategoryBadge category={project.websiteCategory} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {formatDate(project.createdAt)} • Target Launch:{" "}
                      {formatDate(project.targetLaunchDate)} • Budget:{" "}
                      {formatBudget(project.budgetRange)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-28">
                      <div className="mb-1 flex justify-between text-[11px]">
                        <span>Progress</span>
                        <span className="font-semibold">
                          {project.completionPercentage}%
                        </span>
                      </div>
                      <Progress value={project.completionPercentage} />
                    </div>
                    <ProjectStatusBadge status={project.status} />
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        Open
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

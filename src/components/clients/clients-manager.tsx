"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  Building2,
  FolderPlus,
  Mail,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type { ClientRecord } from "@/db/schema";
import {
  createClientAction,
  toggleArchiveClientAction,
} from "@/actions/clients";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClientWithCount = ClientRecord & { projectCount: number };

export function ClientsManager({
  initialClients,
  canEdit,
}: {
  initialClients: ClientWithCount[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState("");
  const [showArchived, setShowArchived] = React.useState(false);
  const [industryFilter, setIndustryFilter] = React.useState("ALL");
  const [dialogOpen, setDialogOpen] = React.useState(
    searchParams.get("new") === "1"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Create form state (all 14 fields from Section 6 Module B)
  const [organisationName, setOrganisationName] = React.useState("");
  const [organisationType, setOrganisationType] = React.useState(
    "Private Limited Company"
  );
  const [industry, setIndustry] = React.useState("");
  const [contactName, setContactName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("Nigeria");
  const [businessDescription, setBusinessDescription] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [internalNotes, setInternalNotes] = React.useState("");

  const industries = React.useMemo(() => {
    const set = new Set<string>();
    for (const c of initialClients) {
      if (c.industry) set.add(c.industry);
    }
    return Array.from(set);
  }, [initialClients]);

  const filteredClients = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialClients.filter((client) => {
      if (!showArchived && client.isArchived) return false;
      if (
        industryFilter !== "ALL" &&
        client.industry?.toLowerCase() !== industryFilter.toLowerCase()
      ) {
        return false;
      }
      if (q) {
        const hay = [
          client.organisationName,
          client.contactName,
          client.contactEmail,
          client.industry,
          client.city,
          client.country,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [initialClients, search, showArchived, industryFilter]);

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createClientAction({
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
        socialLinks: {
          linkedin: linkedinUrl || undefined,
          instagram: instagramUrl || undefined,
        },
        internalNotes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Client "${result.data.organisationName}" created.`);
      setDialogOpen(false);
      setOrganisationName("");
      setIndustry("");
      setContactName("");
      setContactEmail("");
      setPhone("");
      setWhatsapp("");
      setWebsite("");
      setAddress("");
      setCity("");
      setBusinessDescription("");
      setLinkedinUrl("");
      setInstagramUrl("");
      setInternalNotes("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchiveToggle(client: ClientWithCount) {
    const nextState = !client.isArchived;
    const res = await toggleArchiveClientAction(client.id, nextState);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(
      nextState
        ? `Archived "${client.organisationName}".`
        : `Restored "${client.organisationName}".`
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Client Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage client organisations, primary contacts, and associated website
            discovery projects.
          </p>
        </div>

        {canEdit && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> Add Client
          </Button>
        )}
      </div>

      {/* Search & Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by organisation, contact name, email, city, or industry..."
                className="pl-9"
              />
            </div>

            <select
              aria-label="Filter by industry"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="ALL">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant={showArchived ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowArchived((prev) => !prev)}
            >
              <Archive className="size-4" />
              {showArchived ? "Showing Archived" : "Show Archived"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Client Organisations ({filteredClients.length})
          </CardTitle>
          <CardDescription>
            Click any organisation to view its full profile, project history, and
            internal agency notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <Building2 className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 font-medium">No matching clients found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try clearing your filters or create a new client record.
              </p>
              {canEdit && (
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="size-4" /> Add New Client
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="font-semibold hover:underline"
                        >
                          {client.organisationName}
                        </Link>
                        {client.isArchived && (
                          <Badge variant="outline">Archived</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {client.industry || client.organisationType || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{client.contactName}</p>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3" /> {client.contactEmail}
                        </span>
                        {client.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3" /> {client.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {[client.city, client.country].filter(Boolean).join(", ") ||
                        "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {client.projectCount} project(s)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(client.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/clients/${client.id}`}>
                            Profile
                          </Link>
                        </Button>
                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Create project for client"
                            >
                              <Link
                                href={`/dashboard/projects?new=1&clientId=${client.id}`}
                              >
                                <FolderPlus className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchiveToggle(client)}
                              title={
                                client.isArchived
                                  ? "Restore client"
                                  : "Archive client"
                              }
                            >
                              <Archive className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Client Organisation</DialogTitle>
            <DialogDescription>
              Capture complete client contact, location, and internal agency notes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-org-name">Organisation Name *</Label>
                <Input
                  id="c-org-name"
                  required
                  value={organisationName}
                  onChange={(e) => setOrganisationName(e.target.value)}
                  placeholder="e.g. Horizon Energy Services Ltd"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-org-type">Organisation Type</Label>
                <Input
                  id="c-org-type"
                  value={organisationType}
                  onChange={(e) => setOrganisationType(e.target.value)}
                  placeholder="e.g. Private Limited Company, NGO, School"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-industry">Industry / Sector</Label>
                <Input
                  id="c-industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Energy, FinTech, Education"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-contact-name">Primary Contact Name *</Label>
                <Input
                  id="c-contact-name"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Ngozi Eze"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-contact-email">Contact Email *</Label>
                <Input
                  id="c-contact-email"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="ngozi@company.com"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-phone">Phone Number</Label>
                <Input
                  id="c-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-whatsapp">WhatsApp Number</Label>
                <Input
                  id="c-whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-website">Current Website</Label>
                <Input
                  id="c-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="c-city">City</Label>
                <Input
                  id="c-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lagos"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="c-country">Country</Label>
                <Input
                  id="c-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Nigeria"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="c-address">Physical Address</Label>
                <Input
                  id="c-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street & building"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-desc">Business Description</Label>
              <Textarea
                id="c-desc"
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Summary of the client's core business and products..."
                className="min-h-[72px]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-linkedin">LinkedIn URL</Label>
                <Input
                  id="c-linkedin"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-instagram">Instagram / Social URL</Label>
                <Input
                  id="c-instagram"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-notes">
                Internal Agency Notes (Private — Never shown to client)
              </Label>
              <Textarea
                id="c-notes"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Key stakeholders, procurement notes, or account history..."
                className="min-h-[68px]"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Client..." : "Create Client Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

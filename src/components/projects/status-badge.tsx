import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { ProjectStatus, WebsiteCategory } from "@/db/schema";
import {
  PROJECT_STATUS_LABELS,
  WEBSITE_CATEGORY_LABELS,
} from "@/lib/validations/project";

const STATUS_VARIANTS: Record<ProjectStatus, BadgeProps["variant"]> = {
  DRAFT: "outline",
  INVITATION_SENT: "info",
  IN_PROGRESS: "warning",
  SUBMITTED: "accent",
  UNDER_REVIEW: "secondary",
  AWAITING_CLIENT_RESPONSE: "destructive",
  APPROVED: "success",
  ARCHIVED: "outline",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>
      {PROJECT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function WebsiteCategoryBadge({
  category,
}: {
  category: WebsiteCategory;
}) {
  return (
    <Badge variant="outline">
      {WEBSITE_CATEGORY_LABELS[category] ?? category}
    </Badge>
  );
}

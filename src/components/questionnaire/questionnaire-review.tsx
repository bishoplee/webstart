"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  FileText,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import type { ProjectFileRecord } from "@/db/schema";
import type { TemplateBlueprint } from "@/lib/questionnaire/default-templates";
import type { QuestionnaireCompletionSummary } from "@/lib/questionnaire/completion";
import { isQuestionVisible } from "@/lib/questionnaire/conditions";
import { submitQuestionnaireAction } from "@/actions/questionnaire";
import { formatBytes, formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function formatValueForReview(val: unknown): string {
  if (val === null || val === undefined || val === "") return "Not provided";
  if (Array.isArray(val)) {
    if (val.length === 0) return "None selected";
    if (typeof val[0] === "object") {
      return `${val.length} page specification(s) configured`;
    }
    return val.join(", ");
  }
  if (typeof val === "object") {
    return JSON.stringify(val);
  }
  return String(val);
}

export function QuestionnaireReview({
  rawToken,
  projectName,
  referenceNumber,
  template,
  responses,
  completion,
  files,
  canEdit,
}: {
  rawToken: string;
  projectName: string;
  referenceNumber: string;
  template: TemplateBlueprint;
  responses: Record<string, unknown>;
  completion: QuestionnaireCompletionSummary;
  files: ProjectFileRecord[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const { formatBudget } = useCurrency();
  const [confirmedAccurate, setConfirmedAccurate] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const completedSections = completion.sections.filter((s) => s.isComplete);
  const incompleteSections = completion.sections.filter((s) => !s.isComplete);

  const selectedFeatures = Array.isArray(responses["selected_features"])
    ? (responses["selected_features"] as string[])
    : [];

  async function handleFinalSubmit() {
    if (!confirmedAccurate) {
      toast.error(
        "Please tick the confirmation checkbox before submitting your questionnaire."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitQuestionnaireAction({
        rawToken,
        confirmedAccurate,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success("Discovery questionnaire submitted to the agency!");
      router.push(`/portal/projects/${rawToken}/submitted`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href={`/portal/projects/${rawToken}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Return to Questionnaire Sections
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Section 11: Final Review & Submission
          </h1>
          <p className="text-sm text-muted-foreground">
            {projectName} ({referenceNumber}) — Review your completed sections,
            selected features, and supporting documents before final submission.
          </p>
        </div>

        <Badge
          variant={completion.isReadyForSubmission ? "success" : "warning"}
          className="text-xs"
        >
          {completion.overallPercentage}% Complete (
          {completion.completedSectionCount}/{completion.totalSectionCount}{" "}
          Sections)
        </Badge>
      </div>

      {/* Summary Overview Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Completed Sections
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {completedSections.length} / {completion.totalSectionCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completion.overallPercentage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Selected Functional Features
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {selectedFeatures.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground truncate">
            {selectedFeatures.length > 0
              ? selectedFeatures.join(", ")
              : "No features selected yet"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Uploaded Supporting Files
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{files.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Logos, brand guidelines & documents
          </CardContent>
        </Card>
      </div>

      {/* Incomplete Sections Alert */}
      {incompleteSections.length > 0 && (
        <Alert variant="warning">
          <AlertCircle className="mb-1 size-4" />
          <AlertTitle>
            {incompleteSections.length} Section(s) Have Unanswered Required
            Questions
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-xs">
              Please complete the following sections before final submission:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {incompleteSections.map((sec) => (
                <div
                  key={sec.sectionKey}
                  className="flex items-center justify-between rounded-md border border-amber-300 bg-white/80 p-2.5 text-xs dark:bg-black/20"
                >
                  <div>
                    <p className="font-semibold">{sec.title}</p>
                    <p className="text-[11px] opacity-80">
                      Missing: {sec.missingRequiredLabels.slice(0, 2).join(", ")}
                      {sec.missingRequiredLabels.length > 2 ? "..." : ""}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      href={`/portal/projects/${rawToken}?section=${sec.sectionKey}`}
                    >
                      Complete
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Project Expectations & Uploaded Files */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Key Project Expectations Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Organisation:</span>
              <span className="font-semibold">
                {formatValueForReview(responses["organisation_name"])}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Build Type:</span>
              <span className="font-semibold">
                {formatValueForReview(responses["new_or_redesign"])}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Budget Range:</span>
              <span className="font-semibold">
                {formatBudget(
                  typeof responses["budget_range"] === "string"
                    ? responses["budget_range"]
                    : null
                )}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">
                Preferred Launch Date:
              </span>
              <span className="font-semibold">
                {formatValueForReview(responses["preferred_launch_date"])}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary CTA:</span>
              <span className="font-semibold">
                {formatValueForReview(responses["desired_visitor_actions"])}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Uploaded Supporting Documents ({files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No supporting files uploaded yet. You can upload logos or brand
                guidelines inside the Design & Branding section.
              </p>
            ) : (
              <div className="space-y-2">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded border border-border p-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="size-4 shrink-0 text-brand-blue" />
                      <span className="font-medium truncate">
                        {f.originalFilename}
                      </span>
                    </div>
                    <span className="text-muted-foreground shrink-0">
                      {formatBytes(f.fileSize)} • {formatDate(f.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section-by-Section Full Review */}
      <div className="space-y-4">
        {template.sections.map((sec) => {
          const secSummary = completion.sections.find(
            (s) => s.sectionKey === sec.sectionKey
          );
          const visibleQs = sec.questions.filter((q) =>
            isQuestionVisible(q, responses)
          );

          return (
            <Card key={sec.sectionKey}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {secSummary?.isComplete ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-600" />
                    )}
                    <CardTitle className="text-base">{sec.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={secSummary?.isComplete ? "success" : "warning"}
                    >
                      {secSummary?.completionPercentage ?? 0}%
                    </Badge>
                    {canEdit && (
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/portal/projects/${rawToken}?section=${sec.sectionKey}`}
                        >
                          <Edit3 className="size-3.5" /> Edit Section
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border text-sm">
                  {visibleQs.map((q) => (
                    <div
                      key={q.questionKey}
                      className="grid gap-1 py-2 sm:grid-cols-3"
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {q.label}
                      </span>
                      <span className="sm:col-span-2 text-xs">
                        {formatValueForReview(responses[q.questionKey])}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Explicit Confirmation & Final Submission Card */}
      {canEdit && (
        <Card className="border-brand-navy/30">
          <CardHeader>
            <CardTitle className="text-base">
              Confirm & Submit Discovery Questionnaire
            </CardTitle>
            <CardDescription>
              Once submitted, ordinary editing will be locked while our agency
              reviews your requirements and prepares your structured project
              brief.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <input
                type="checkbox"
                checked={confirmedAccurate}
                onChange={(e) => setConfirmedAccurate(e.target.checked)}
                className="mt-0.5 size-4 accent-brand-navy"
              />
              <span>
                I confirm that the project objectives, functional requirements,
                and organisation details provided above are accurate and ready
                for agency engineering review.
              </span>
            </label>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/portal/projects/${rawToken}`}>
                <ArrowLeft className="size-4" /> Back to Editing
              </Link>
            </Button>
            <Button
              variant="accent"
              size="lg"
              disabled={!completion.isReadyForSubmission || isSubmitting}
              onClick={() => void handleFinalSubmit()}
            >
              <Send className="size-4" />
              {isSubmitting
                ? "Submitting Questionnaire..."
                : "Submit Completed Questionnaire"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

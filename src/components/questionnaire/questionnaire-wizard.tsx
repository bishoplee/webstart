"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Cloud,
  CloudAlert,
  Loader2,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import type { ClarificationRequestRecord } from "@/db/schema";
import type {
  QuestionBlueprint,
  TemplateBlueprint,
} from "@/lib/questionnaire/default-templates";
import { isQuestionVisible } from "@/lib/questionnaire/conditions";
import {
  calculateQuestionnaireCompletion,
  isResponseAnswered,
} from "@/lib/questionnaire/completion";
import { autosaveQuestionnaireSectionAction } from "@/actions/questionnaire";
import { cn } from "@/lib/utils";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageBuilderInput } from "@/components/questionnaire/page-builder-input";
import { useCurrency } from "@/components/currency-provider";
import { CurrencyExchangeCalculator } from "@/components/layout/currency-switcher";
import { getLocalizedBudgetTierOptions } from "@/lib/currency";

type SaveState = "IDLE" | "DIRTY" | "SAVING" | "SAVED" | "ERROR";

export function QuestionnaireWizard({
  rawToken,
  projectName,
  referenceNumber,
  template,
  initialResponses,
  canEdit,
  lockReason,
  clarifications,
  extraSectionFooter,
}: {
  rawToken: string;
  projectName: string;
  referenceNumber: string;
  template: TemplateBlueprint;
  initialResponses: Record<string, unknown>;
  canEdit: boolean;
  lockReason?: string;
  clarifications: ClarificationRequestRecord[];
  extraSectionFooter?: (sectionKey: string) => React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSectionKey = searchParams.get("section");
  const { currencyCode, syncFromCountryHint } = useCurrency();

  const initialIdx = React.useMemo(() => {
    if (!requestedSectionKey) return 0;
    const found = template.sections.findIndex(
      (s) => s.sectionKey === requestedSectionKey
    );
    return found >= 0 ? found : 0;
  }, [requestedSectionKey, template.sections]);

  const [currentSectionIndex, setCurrentSectionIndex] =
    React.useState(initialIdx);
  const [responses, setResponses] =
    React.useState<Record<string, unknown>>(initialResponses);
  const [saveState, setSaveState] = React.useState<SaveState>("IDLE");
  const [lastSavedTime, setLastSavedTime] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});

  const storageDraftKey = `webstart_draft_${referenceNumber}`;
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const latestResponsesRef = React.useRef(responses);
  latestResponsesRef.current = responses;

  const activeSection =
    template.sections[currentSectionIndex] ?? template.sections[0];

  const completion = React.useMemo(
    () => calculateQuestionnaireCompletion(template.sections, responses),
    [template.sections, responses]
  );

  const visibleQuestions = React.useMemo(
    () =>
      activeSection.questions.filter((q) => isQuestionVisible(q, responses)),
    [activeSection.questions, responses]
  );

  const sectionClarifications = React.useMemo(
    () =>
      clarifications.filter(
        (c) =>
          c.sectionKey === activeSection.sectionKey && c.status === "OPEN"
      ),
    [clarifications, activeSection.sectionKey]
  );

  // Recover local draft on mount if newer than server state
  React.useEffect(() => {
    const locationHint = String(
      initialResponses["operating_locations"] ||
        initialResponses["physical_address"] ||
        ""
    );
    if (locationHint) {
      syncFromCountryHint(locationHint);
    }
    if (!canEdit) return;
    try {
      const rawDraft = window.localStorage.getItem(storageDraftKey);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft) as Record<string, unknown>;
        if (parsed && typeof parsed === "object") {
          setResponses((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, [canEdit, initialResponses, storageDraftKey, syncFromCountryHint]);

  const performServerSave = React.useCallback(
    async (
      sectionKey: string,
      payload: Record<string, unknown>,
      showToast = false
    ): Promise<boolean> => {
      if (!canEdit) return true;
      setSaveState("SAVING");
      setSaveError(null);

      const res = await autosaveQuestionnaireSectionAction({
        rawToken,
        sectionKey,
        answers: payload,
      });

      if (!res.success) {
        setSaveState("ERROR");
        setSaveError(res.error);
        if (showToast) {
          toast.error(res.error);
        }
        return false;
      }

      const formattedTime = new Date(res.data.savedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastSavedTime(formattedTime);
      setSaveState("SAVED");

      try {
        window.localStorage.removeItem(storageDraftKey);
      } catch {
        // Ignore
      }

      if (showToast) {
        toast.success("Progress saved to server.");
      }
      return true;
    },
    [canEdit, rawToken, storageDraftKey]
  );

  function updateFieldValue(questionKey: string, value: unknown) {
    if (!canEdit) return;
    setValidationErrors((prev) => {
      if (!prev[questionKey]) return prev;
      const copy = { ...prev };
      delete copy[questionKey];
      return copy;
    });

    const next = {
      ...latestResponsesRef.current,
      [questionKey]: value,
    };
    setResponses(next);
    setSaveState("DIRTY");

    // Persist local recovery draft immediately
    try {
      window.localStorage.setItem(storageDraftKey, JSON.stringify(next));
    } catch {
      // Ignore
    }

    // Debounced server save (800ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      void performServerSave(
        activeSection.sectionKey,
        latestResponsesRef.current,
        false
      );
    }, 800);
  }

  function validateCurrentSection(): boolean {
    const errors: Record<string, string> = {};
    for (const q of visibleQuestions) {
      const val = responses[q.questionKey];
      if (q.isRequired && !isResponseAnswered(val)) {
        errors[q.questionKey] = `${q.label} is required.`;
        continue;
      }
      if (
        typeof val === "string" &&
        val.trim().length > 0 &&
        q.validationRules?.minLength &&
        val.trim().length < q.validationRules.minLength
      ) {
        errors[q.questionKey] =
          `Please enter at least ${q.validationRules.minLength} characters.`;
      }
    }
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(
        `Please complete the ${Object.keys(errors).length} required field(s) in this section.`
      );
      return false;
    }
    return true;
  }

  async function handleJumpToSection(targetIdx: number) {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (canEdit && saveState === "DIRTY") {
      await performServerSave(
        activeSection.sectionKey,
        latestResponsesRef.current,
        false
      );
    }
    setValidationErrors({});
    setCurrentSectionIndex(targetIdx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleNextSection() {
    if (canEdit && !validateCurrentSection()) {
      return;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (canEdit) {
      const ok = await performServerSave(
        activeSection.sectionKey,
        latestResponsesRef.current,
        false
      );
      if (!ok) return;
    }

    if (currentSectionIndex < template.sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(`/portal/projects/${rawToken}/review`);
    }
  }

  async function handleSaveAndContinueLater() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const ok = await performServerSave(
      activeSection.sectionKey,
      latestResponsesRef.current,
      true
    );
    if (ok && typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.info(
        "Your session link has been copied. You can return to this link anytime to resume."
      );
    }
  }

  function renderQuestionControl(q: QuestionBlueprint) {
    const val = responses[q.questionKey];
    const err = validationErrors[q.questionKey];

    switch (q.inputType) {
      case "TEXTAREA":
        return (
          <Textarea
            id={q.questionKey}
            disabled={!canEdit}
            value={typeof val === "string" ? val : ""}
            onChange={(e) => updateFieldValue(q.questionKey, e.target.value)}
            placeholder={q.validationRules?.placeholder ?? ""}
            className={cn(err && "border-red-500")}
          />
        );

      case "SELECT": {
        const selectOptions =
          q.questionKey === "budget_range"
            ? getLocalizedBudgetTierOptions(currencyCode)
            : (q.options ?? []);
        return (
          <select
            id={q.questionKey}
            disabled={!canEdit}
            value={typeof val === "string" ? val : ""}
            onChange={(e) => updateFieldValue(q.questionKey, e.target.value)}
            className={cn(
              "h-10 w-full rounded-md border border-input bg-card px-3 text-sm",
              err && "border-red-500"
            )}
          >
            <option value="">-- Select an option --</option>
            {selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      case "RADIO":
        return (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {(q.options ?? []).map((opt) => {
              const selected = val === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors",
                    selected
                      ? "border-brand-blue bg-brand-blue/5 font-medium"
                      : "border-border bg-card hover:bg-muted/40",
                    !canEdit && "cursor-not-allowed opacity-70"
                  )}
                >
                  <input
                    type="radio"
                    name={q.questionKey}
                    disabled={!canEdit}
                    checked={selected}
                    onChange={() => updateFieldValue(q.questionKey, opt.value)}
                    className="mt-0.5 size-4 accent-brand-navy"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );

      case "MULTI_SELECT": {
        const selectedArray = Array.isArray(val) ? (val as string[]) : [];
        return (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {(q.options ?? []).map((opt) => {
              const checked = selectedArray.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors",
                    checked
                      ? "border-brand-blue bg-brand-blue/5 font-medium"
                      : "border-border bg-card hover:bg-muted/40",
                    !canEdit && "cursor-not-allowed opacity-70"
                  )}
                >
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selectedArray, opt.value]
                        : selectedArray.filter((item) => item !== opt.value);
                      updateFieldValue(q.questionKey, next);
                    }}
                    className="mt-0.5 size-4 accent-brand-navy"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case "PAGE_BUILDER":
        return (
          <PageBuilderInput
            value={val}
            disabled={!canEdit}
            onChange={(nextItems) => updateFieldValue(q.questionKey, nextItems)}
          />
        );

      case "NUMBER":
        return (
          <Input
            id={q.questionKey}
            type="number"
            disabled={!canEdit}
            min={q.validationRules?.min}
            max={q.validationRules?.max}
            value={val !== undefined && val !== null ? String(val) : ""}
            onChange={(e) =>
              updateFieldValue(
                q.questionKey,
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder={q.validationRules?.placeholder ?? ""}
            className={cn(err && "border-red-500")}
          />
        );

      case "DATE":
        return (
          <Input
            id={q.questionKey}
            type="date"
            disabled={!canEdit}
            value={typeof val === "string" ? val : ""}
            onChange={(e) => updateFieldValue(q.questionKey, e.target.value)}
            className={cn(err && "border-red-500")}
          />
        );

      case "EMAIL":
      case "URL":
      case "TEXT":
      default:
        return (
          <Input
            id={q.questionKey}
            type={
              q.inputType === "EMAIL"
                ? "email"
                : q.inputType === "URL"
                  ? "url"
                  : "text"
            }
            disabled={!canEdit}
            value={typeof val === "string" ? val : ""}
            onChange={(e) => updateFieldValue(q.questionKey, e.target.value)}
            placeholder={q.validationRules?.placeholder ?? ""}
            className={cn(err && "border-red-500")}
          />
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Progress & Autosave Status Bar */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">
                  {projectName}
                </h1>
                <Badge variant="outline">{referenceNumber}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {template.name} • Section {currentSectionIndex + 1} of{" "}
                {template.sections.length}
              </p>
            </div>

            {/* Honest Server-Confirmed Autosave Indicator */}
            <div className="flex flex-wrap items-center gap-2">
              {!canEdit ? (
                <Badge variant="warning" className="gap-1">
                  <Lock className="size-3.5" /> Read-Only ({lockReason})
                </Badge>
              ) : saveState === "SAVING" ? (
                <Badge variant="info" className="gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" /> Saving to
                  server...
                </Badge>
              ) : saveState === "SAVED" && lastSavedTime ? (
                <Badge variant="success" className="gap-1.5">
                  <Cloud className="size-3.5" /> Saved at {lastSavedTime}
                </Badge>
              ) : saveState === "DIRTY" ? (
                <Badge variant="outline" className="gap-1.5">
                  Unsaved changes...
                </Badge>
              ) : saveState === "ERROR" ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    void performServerSave(
                      activeSection.sectionKey,
                      latestResponsesRef.current,
                      true
                    )
                  }
                >
                  <CloudAlert className="size-3.5" /> Save failed — Retry
                </Button>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Cloud className="size-3.5" /> Autosave enabled
                </Badge>
              )}

              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleSaveAndContinueLater()}
                >
                  <BookmarkCheck className="size-4" /> Save & Continue Later
                </Button>
              )}

              <Button variant="secondary" size="sm" asChild>
                <Link href={`/portal/projects/${rawToken}/review`}>
                  Final Review ({completion.overallPercentage}%)
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Overall Discovery Progress ({completion.completedSectionCount}/
                {completion.totalSectionCount} sections completed)
              </span>
              <span className="font-bold">{completion.overallPercentage}%</span>
            </div>
            <Progress value={completion.overallPercentage} />
          </div>

          {/* Horizontal Section Navigator */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {template.sections.map((sec, idx) => {
              const secSummary = completion.sections.find(
                (s) => s.sectionKey === sec.sectionKey
              );
              const isCurrent = idx === currentSectionIndex;
              const hasOpenClarification = clarifications.some(
                (c) => c.sectionKey === sec.sectionKey && c.status === "OPEN"
              );

              return (
                <button
                  key={sec.sectionKey}
                  type="button"
                  onClick={() => void handleJumpToSection(idx)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    isCurrent
                      ? "border-brand-navy bg-brand-navy text-white dark:border-brand-lime dark:bg-brand-lime dark:text-brand-navy"
                      : secSummary?.isComplete
                        ? "border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {hasOpenClarification ? (
                    <AlertCircle className="size-3.5 text-red-500" />
                  ) : secSummary?.isComplete ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                  ) : null}
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Error Banner */}
      {saveError && (
        <Alert variant="destructive">
          <CloudAlert className="mb-1 size-4" />
          <AlertTitle>Autosave Error</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Clarification Request Alert for Current Section */}
      {sectionClarifications.length > 0 && (
        <Alert variant="warning">
          <AlertCircle className="mb-1 size-4" />
          <AlertTitle>
            Clarification Requested by Agency on This Section
          </AlertTitle>
          <AlertDescription className="space-y-2 mt-1">
            {sectionClarifications.map((clar) => (
              <div
                key={clar.id}
                className="rounded border border-amber-300/80 bg-white/70 p-2.5 text-xs dark:bg-black/20"
              >
                <p className="font-semibold">{clar.message}</p>
                {clar.questionKey && (
                  <p className="text-[11px] opacity-80">
                    Question key: {clar.questionKey}
                  </p>
                )}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Section 7 Security Reminder */}
      {activeSection.sectionKey === "technical_infrastructure" && (
        <Alert variant="warning">
          <ShieldAlert className="mb-1 size-4" />
          <AlertTitle>Security Notice — Never Enter Passwords</AlertTitle>
          <AlertDescription>
            Do not enter domain registrar passwords, cPanel credentials, or
            secret API keys in this questionnaire. Our engineering team will
            request delegated access securely when needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Section Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl">{activeSection.title}</CardTitle>
            <Badge variant="outline">
              Step {currentSectionIndex + 1} of {template.sections.length}
            </Badge>
          </div>
          <CardDescription>{activeSection.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {activeSection.sectionKey === "budget_timeline" && (
            <CurrencyExchangeCalculator />
          )}
          {visibleQuestions.map((q) => {
            const err = validationErrors[q.questionKey];
            const isConditional = Boolean(q.conditionalRules);

            return (
              <div
                key={q.questionKey}
                className={cn(
                  "space-y-2",
                  isConditional &&
                    "rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-4"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <Label
                    htmlFor={q.questionKey}
                    className="text-sm font-semibold leading-snug"
                  >
                    {q.label}
                    {q.isRequired && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </Label>
                  {isConditional && (
                    <Badge variant="info" className="shrink-0 text-[10px]">
                      Feature Follow-Up
                    </Badge>
                  )}
                </div>

                {q.description && (
                  <p className="text-xs text-muted-foreground">
                    {q.description}
                  </p>
                )}

                {renderQuestionControl(q)}

                {err && (
                  <p className="text-xs font-medium text-red-600">{err}</p>
                )}
              </div>
            );
          })}

          {extraSectionFooter && extraSectionFooter(activeSection.sectionKey)}
        </CardContent>

        <CardFooter className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={currentSectionIndex === 0}
            onClick={() => void handleJumpToSection(currentSectionIndex - 1)}
          >
            <ArrowLeft className="size-4" /> Previous Section
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void performServerSave(
                    activeSection.sectionKey,
                    latestResponsesRef.current,
                    true
                  )
                }
              >
                Save Progress
              </Button>
            )}

            <Button type="button" onClick={() => void handleNextSection()}>
              {currentSectionIndex < template.sections.length - 1 ? (
                <>
                  Save & Next Section <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  Proceed to Final Review <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

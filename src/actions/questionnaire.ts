"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  respondToClarificationByToken,
  saveQuestionnaireAnswersByToken,
  submitQuestionnaireByToken,
} from "@/lib/data/repository";
import type { QuestionnaireCompletionSummary } from "@/lib/questionnaire/completion";
import type { ProjectStatus } from "@/db/schema";
import type { ActionResult } from "./clients";

const autosaveInputSchema = z.object({
  rawToken: z.string().min(8, "Invalid invitation token."),
  sectionKey: z.string().min(1),
  answers: z.record(z.string(), z.unknown()),
});

export async function autosaveQuestionnaireSectionAction(rawInput: {
  rawToken: string;
  sectionKey: string;
  answers: Record<string, unknown>;
}): Promise<
  ActionResult<{
    savedAt: string;
    completion: QuestionnaireCompletionSummary;
    projectStatus: ProjectStatus;
  }>
> {
  try {
    const parsed = autosaveInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid questionnaire autosave payload.",
      };
    }

    const result = saveQuestionnaireAnswersByToken(parsed.data);

    revalidatePath(`/portal/projects/${parsed.data.rawToken}`);
    revalidatePath(`/portal/projects/${parsed.data.rawToken}/review`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to save questionnaire progress.",
    };
  }
}

export async function submitQuestionnaireAction(rawInput: {
  rawToken: string;
  confirmedAccurate: boolean;
}): Promise<
  ActionResult<{
    submittedAt: string;
    projectStatus: ProjectStatus;
    completion: QuestionnaireCompletionSummary;
  }>
> {
  try {
    const result = submitQuestionnaireByToken({
      rawToken: rawInput.rawToken,
      confirmedAccurate: rawInput.confirmedAccurate,
    });

    revalidatePath(`/portal/projects/${rawInput.rawToken}`);
    revalidatePath(`/portal/projects/${rawInput.rawToken}/review`);
    revalidatePath(`/portal/projects/${rawInput.rawToken}/submitted`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to submit questionnaire.",
    };
  }
}

export async function respondToClarificationAction(rawInput: {
  rawToken: string;
  clarificationId: string;
  responseText: string;
}): Promise<ActionResult<{ clarificationId: string }>> {
  try {
    if (!rawInput.responseText || rawInput.responseText.trim().length < 2) {
      return {
        success: false,
        error: "Please enter a clarification response before submitting.",
      };
    }

    const updated = respondToClarificationByToken({
      rawToken: rawInput.rawToken,
      clarificationId: rawInput.clarificationId,
      responseText: rawInput.responseText,
    });

    revalidatePath(`/portal/projects/${rawInput.rawToken}`);
    revalidatePath(`/portal/projects/${rawInput.rawToken}/submitted`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      data: { clarificationId: updated.id },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to submit clarification response.",
    };
  }
}

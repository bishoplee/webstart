import type { SectionBlueprint } from "./default-templates";
import { isQuestionVisible, type ResponseMap } from "./conditions";

export interface SectionCompletionSummary {
  sectionKey: string;
  title: string;
  totalVisibleRequired: number;
  answeredRequired: number;
  totalVisibleQuestions: number;
  answeredQuestions: number;
  isComplete: boolean;
  completionPercentage: number;
  missingRequiredLabels: string[];
}

export interface QuestionnaireCompletionSummary {
  overallPercentage: number;
  totalRequiredQuestions: number;
  answeredRequiredQuestions: number;
  completedSectionCount: number;
  totalSectionCount: number;
  isReadyForSubmission: boolean;
  sections: SectionCompletionSummary[];
}

export function isResponseAnswered(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }
  return false;
}

/**
 * Computes section-level and overall discovery completion percentages,
 * dynamically excluding hidden conditional questions.
 */
export function calculateQuestionnaireCompletion(
  sections: SectionBlueprint[],
  responses: ResponseMap
): QuestionnaireCompletionSummary {
  let totalRequiredQuestions = 0;
  let answeredRequiredQuestions = 0;
  let completedSectionCount = 0;

  const sectionSummaries: SectionCompletionSummary[] = sections.map(
    (section) => {
      const visibleQuestions = section.questions.filter((q) =>
        isQuestionVisible(q, responses)
      );
      const visibleRequired = visibleQuestions.filter((q) => q.isRequired);

      let answeredAllCount = 0;
      let answeredReqCount = 0;
      const missingRequiredLabels: string[] = [];

      for (const q of visibleQuestions) {
        const answered = isResponseAnswered(responses[q.questionKey]);
        if (answered) {
          answeredAllCount += 1;
          if (q.isRequired) {
            answeredReqCount += 1;
          }
        } else if (q.isRequired) {
          missingRequiredLabels.push(q.label);
        }
      }

      totalRequiredQuestions += visibleRequired.length;
      answeredRequiredQuestions += answeredReqCount;

      const isComplete =
        visibleRequired.length === 0
          ? answeredAllCount > 0
          : answeredReqCount === visibleRequired.length;

      if (isComplete) {
        completedSectionCount += 1;
      }

      const completionPercentage =
        visibleRequired.length > 0
          ? Math.round((answeredReqCount / visibleRequired.length) * 100)
          : visibleQuestions.length > 0
            ? Math.round((answeredAllCount / visibleQuestions.length) * 100)
            : 100;

      return {
        sectionKey: section.sectionKey,
        title: section.title,
        totalVisibleRequired: visibleRequired.length,
        answeredRequired: answeredReqCount,
        totalVisibleQuestions: visibleQuestions.length,
        answeredQuestions: answeredAllCount,
        isComplete,
        completionPercentage,
        missingRequiredLabels,
      };
    }
  );

  const overallPercentage =
    totalRequiredQuestions > 0
      ? Math.round((answeredRequiredQuestions / totalRequiredQuestions) * 100)
      : 0;

  return {
    overallPercentage,
    totalRequiredQuestions,
    answeredRequiredQuestions,
    completedSectionCount,
    totalSectionCount: sections.length,
    isReadyForSubmission:
      totalRequiredQuestions > 0 &&
      answeredRequiredQuestions === totalRequiredQuestions,
    sections: sectionSummaries,
  };
}

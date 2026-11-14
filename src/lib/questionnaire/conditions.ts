import type {
  ConditionalConditionItem,
  ConditionalRulesJson,
} from "@/db/schema";
import type { QuestionBlueprint } from "./default-templates";

export type ResponseMap = Record<string, unknown>;

function isNonEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function evaluateSingleCondition(
  condition: ConditionalConditionItem,
  responses: ResponseMap
): boolean {
  const actual = responses[condition.questionKey];

  switch (condition.comparator) {
    case "NOT_EMPTY":
      return isNonEmptyValue(actual);
    case "EQUALS":
      return actual === condition.value;
    case "NOT_EQUALS":
      return actual !== condition.value;
    case "INCLUDES":
      if (Array.isArray(actual)) {
        return actual.includes(condition.value);
      }
      if (typeof actual === "string" && typeof condition.value === "string") {
        return actual.includes(condition.value);
      }
      return false;
    default:
      return true;
  }
}

/**
 * Evaluates declarative conditional_rules against current questionnaire responses.
 */
export function evaluateConditionalRules(
  rules: ConditionalRulesJson | null | undefined,
  responses: ResponseMap
): boolean {
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return true;
  }

  if (rules.operator === "OR") {
    return rules.conditions.some((c) => evaluateSingleCondition(c, responses));
  }

  return rules.conditions.every((c) => evaluateSingleCondition(c, responses));
}

export function isQuestionVisible(
  question: Pick<QuestionBlueprint, "conditionalRules">,
  responses: ResponseMap
): boolean {
  return evaluateConditionalRules(question.conditionalRules, responses);
}

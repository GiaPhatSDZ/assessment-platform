/**
 * AI School V3 — Server-Side Deterministic Diagnostic Grading Engine V1
 *
 * Implements Controller Mandates:
 * - Pure / deterministic execution (no LLM, no AI, no network)
 * - Versioned grading rules: DIAGNOSTIC_GRADING_RULE_VERSION = "1.0.0"
 * - A1: NUMERIC grading requires supported canonical answerSpec (no fallback parsing of correctAnswer)
 * - A8: MULTIPLE_CHOICE item must have exactly one option with isCorrect=true matching correctAnswer
 * - Wrong answer != misconception (only explicit distractor/mapping yields misconception; fallback is [])
 * - Conservative node-state matrix (1 correct -> UNCERTAIN/LOW; 0 -> NOT_ASSESSED/LOW)
 * - A5: SECURE requires >=2 independent evidence units (distinct canonical itemIds)
 */

import {
  KnowledgeState,
  EvidenceConfidence,
  DiagnosticStudentResponse,
  NumericAnswerSpec,
  InvalidCanonicalGradingItemError,
  UnsupportedGradingRuleError,
  InvalidGradingInputError,
} from "./types";
import { QuestionItem, MultipleChoiceOption } from "../content/schema";

export const DIAGNOSTIC_GRADING_RULE_VERSION = "1.0.0";
export const DIAGNOSTIC_NODE_STATE_RULE_VERSION = "1.0.0";
export const DIAGNOSTIC_EVIDENCE_RULE_VERSION = "1.0.0";
export const DIAGNOSTIC_MASTERY_RULE_VERSION = "1.0.0";

export interface EvaluatedItemResponse {
  isCorrect: boolean;
  selectedOptionId?: string | null;
  detectedMisconceptions: string[];
}

/**
 * Deterministically grades a MULTIPLE_CHOICE item response.
 * Enforces Amendment A8 and Controller Section 5 misconception semantics.
 */
export function evaluateMultipleChoiceItem(
  item: QuestionItem,
  selectedOptionId: string
): EvaluatedItemResponse {
  if (!item.options || !Array.isArray(item.options) || item.options.length < 2) {
    throw new InvalidCanonicalGradingItemError(
      `INVALID_CANONICAL_GRADING_ITEM: Item '${item.id}' lacks valid options array.`
    );
  }

  // A8: Exactly one option must have isCorrect=true and correctAnswer must reference that option
  const correctOptions = item.options.filter((opt: MultipleChoiceOption) => Boolean(opt.isCorrect));
  if (correctOptions.length !== 1) {
    throw new InvalidCanonicalGradingItemError(
      `INVALID_CANONICAL_GRADING_ITEM: Item '${item.id}' must have exactly one option with isCorrect=true (found ${correctOptions.length}).`
    );
  }

  const expectedCorrectOption = correctOptions[0];
  if (item.correctAnswer !== expectedCorrectOption.id) {
    throw new InvalidCanonicalGradingItemError(
      `INVALID_CANONICAL_GRADING_ITEM: Item '${item.id}' correctAnswer '${item.correctAnswer}' does not match correct option id '${expectedCorrectOption.id}'.`
    );
  }

  // Find student selected option
  const selected = item.options.find((opt: MultipleChoiceOption) => opt.id === selectedOptionId);
  if (!selected) {
    throw new InvalidGradingInputError(
      `INVALID_GRADING_INPUT: Selected option id '${selectedOptionId}' does not exist in item '${item.id}' options.`
    );
  }

  const isCorrect = selected.id === item.correctAnswer;

  // Section 5: Misconception Semantics
  // WRONG ANSWER != AUTOMATIC MISCONCEPTION.
  // A misconception tag may be recorded only when the selected distractor explicitly supports that tag.
  let detectedMisconceptions: string[] = [];
  if (!isCorrect) {
    if (selected.misconceptionTag && typeof selected.misconceptionTag === "string" && selected.misconceptionTag.trim() !== "") {
      detectedMisconceptions = [selected.misconceptionTag.trim()];
    } else {
      detectedMisconceptions = [];
    }
  }

  return {
    isCorrect,
    selectedOptionId: selected.id,
    detectedMisconceptions,
  };
}

/**
 * Deterministically grades a NUMERIC item response.
 * Enforces Amendment A1 (requires supported answerSpec; no fallback parsing of correctAnswer)
 * and Controller Section 4/5 rules.
 */
export function evaluateNumericItem(
  item: QuestionItem,
  numericValue: number,
  unit?: string
): EvaluatedItemResponse {
  if (typeof numericValue !== "number" || isNaN(numericValue)) {
    throw new InvalidGradingInputError("INVALID_GRADING_INPUT: numericValue must be a valid number.");
  }

  // A1: NUMERIC grading MUST require a supported canonical answerSpec.
  // Remove fallback parsing of correctAnswer. Unsupported/missing numeric answerSpec => UNSUPPORTED_GRADING_RULE.
  const spec = item.answerSpec as NumericAnswerSpec | undefined;
  if (!spec || typeof spec !== "object") {
    throw new UnsupportedGradingRuleError(
      `UNSUPPORTED_GRADING_RULE: Item '${item.id}' lacks canonical answerSpec for NUMERIC grading.`
    );
  }

  const targetValue = spec.exactValue !== undefined ? spec.exactValue : spec.value;
  if (typeof targetValue !== "number" || isNaN(targetValue)) {
    throw new UnsupportedGradingRuleError(
      `UNSUPPORTED_GRADING_RULE: Item '${item.id}' answerSpec does not specify a valid target numeric value (exactValue/value).`
    );
  }

  // Do NOT invent tolerance
  const tolerance = typeof spec.tolerance === "number" && spec.tolerance >= 0 ? spec.tolerance : 0;

  // Unit check if canonical spec specifies unit
  if (spec.unit && spec.unit.trim() !== "") {
    if (unit && unit.trim().toLowerCase() !== spec.unit.trim().toLowerCase()) {
      return {
        isCorrect: false,
        selectedOptionId: null,
        detectedMisconceptions: [],
      };
    }
  }

  const diff = Math.abs(numericValue - targetValue);
  const isCorrect = diff <= tolerance;

  let detectedMisconceptions: string[] = [];
  if (!isCorrect && Array.isArray(spec.misconceptions)) {
    const matched = spec.misconceptions.find((m) => {
      const mTol = typeof m.value === "number" ? Math.abs(numericValue - m.value) : Infinity;
      return mTol <= tolerance;
    });
    if (matched && matched.misconceptionTag) {
      detectedMisconceptions = [matched.misconceptionTag];
    }
  }

  return {
    isCorrect,
    selectedOptionId: null,
    detectedMisconceptions,
  };
}

/**
 * Unified deterministic grading entry point for student response.
 */
export function gradeStudentResponse(
  item: QuestionItem,
  response: DiagnosticStudentResponse
): EvaluatedItemResponse {
  if (response.type === "MCQ") {
    if (item.type !== "MULTIPLE_CHOICE") {
      throw new InvalidGradingInputError(
        `INVALID_GRADING_INPUT: Response type 'MCQ' does not match item type '${item.type}'.`
      );
    }
    return evaluateMultipleChoiceItem(item, response.selectedOptionId);
  }

  if (response.type === "NUMERIC") {
    if (item.type !== "NUMERIC") {
      throw new InvalidGradingInputError(
        `INVALID_GRADING_INPUT: Response type 'NUMERIC' does not match item type '${item.type}'.`
      );
    }
    return evaluateNumericItem(item, response.numericValue, response.unit);
  }

  throw new InvalidGradingInputError(
    `INVALID_GRADING_INPUT: Unsupported response type '${(response as any)?.type}'.`
  );
}

// ==============================================================================
// CONSERVATIVE NODE STATE EVALUATION MATRIX
// ==============================================================================

export interface NodeStateEvaluationInput {
  attemptsCount: number;
  correctCount: number;
  distinctCorrectItemIds: Set<string>;
  allMisconceptions: string[];
  assessedAt: string;
}

export interface NodeStateEvaluationOutput {
  state: KnowledgeState;
  confidence: EvidenceConfidence;
  attemptsCount: number;
  correctCount: number;
  lastAssessedAt: string | null;
  misconceptionTags: string[];
  ruleVersion: string;
}

/**
 * Pure evaluation of knowledge node state from cumulative attempt evidence.
 *
 * Matrix:
 * - 0 attempts: NOT_ASSESSED / LOW (lastAssessedAt: null)
 * - 1 correct: UNCERTAIN / LOW (one correct does NOT overclaim SECURE)
 * - 1 incorrect: DEVELOPING / LOW
 * - Multiple (all correct):
 *     SECURE ONLY IF distinct canonical itemIds >= 2 (A5).
 *     distinct == 2 -> MEDIUM, distinct >= 3 -> HIGH.
 *     If distinct < 2 (repeated same item) -> UNCERTAIN / LOW.
 * - Multiple (all incorrect):
 *     DEVELOPING (attempts == 2 -> MEDIUM, >= 3 -> HIGH).
 * - Multiple (mixed 0 < correct < attempts):
 *     UNCERTAIN / MEDIUM.
 */
export function computeConservativeNodeState(
  input: NodeStateEvaluationInput
): NodeStateEvaluationOutput {
  const { attemptsCount, correctCount, distinctCorrectItemIds, allMisconceptions, assessedAt } = input;
  const uniqueMisconceptions = Array.from(new Set(allMisconceptions));

  if (attemptsCount === 0) {
    return {
      state: "NOT_ASSESSED",
      confidence: "LOW",
      attemptsCount: 0,
      correctCount: 0,
      lastAssessedAt: null,
      misconceptionTags: [],
      ruleVersion: DIAGNOSTIC_NODE_STATE_RULE_VERSION,
    };
  }

  if (attemptsCount === 1) {
    if (correctCount === 1) {
      // 1 correct does NOT overclaim SECURE; yields UNCERTAIN / LOW
      return {
        state: "UNCERTAIN",
        confidence: "LOW",
        attemptsCount: 1,
        correctCount: 1,
        lastAssessedAt: assessedAt,
        misconceptionTags: uniqueMisconceptions,
        ruleVersion: DIAGNOSTIC_NODE_STATE_RULE_VERSION,
      };
    } else {
      // 1 incorrect shows initial struggle: DEVELOPING / LOW
      return {
        state: "DEVELOPING",
        confidence: "LOW",
        attemptsCount: 1,
        correctCount: 0,
        lastAssessedAt: assessedAt,
        misconceptionTags: uniqueMisconceptions,
        ruleVersion: DIAGNOSTIC_NODE_STATE_RULE_VERSION,
      };
    }
  }

  // Multiple attempts (attemptsCount >= 2)
  if (correctCount === attemptsCount) {
    // All correct: requires >= 2 independent evidence units (distinct items) for SECURE
    const distinctCount = distinctCorrectItemIds.size;
    if (distinctCount >= 2) {
      return {
        state: "SECURE",
        confidence: distinctCount === 2 ? "MEDIUM" : "HIGH",
        attemptsCount,
        correctCount,
        lastAssessedAt: assessedAt,
        misconceptionTags: uniqueMisconceptions,
        ruleVersion: DIAGNOSTIC_NODE_STATE_RULE_VERSION,
      };
    } else {
      // Repeated same item does not inflate confidence to SECURE
      return {
        state: "UNCERTAIN",
        confidence: "LOW",
        attemptsCount,
        correctCount,
        lastAssessedAt: assessedAt,
        misconceptionTags: uniqueMisconceptions,
        ruleVersion: DIAGNOSTIC_NODE_STATE_RULE_VERSION,
      };
    }
  }

  if (correctCount === 0) {
    // All incorrect
    return {
      state: "DEVELOPING",
      confidence: attemptsCount === 2 ? "MEDIUM" : "HIGH",
      attemptsCount,
      correctCount,
      lastAssessedAt: assessedAt,
      misconceptionTags: uniqueMisconceptions,
      ruleVersion: DIAGNOSTIC_NODE_STATE_RULE_VERSION,
    };
  }

  // Mixed results
  return {
    state: "UNCERTAIN",
    confidence: "MEDIUM",
    attemptsCount,
    correctCount,
    lastAssessedAt: assessedAt,
    misconceptionTags: uniqueMisconceptions,
    ruleVersion: DIAGNOSTIC_NODE_STATE_RULE_VERSION,
  };
}

// ==============================================================================
// MASTERY TRANSITION DETECTION
// ==============================================================================

export interface MasteryTransitionCheckResult {
  hasTransition: boolean;
  previousState?: KnowledgeState;
  previousConfidence?: EvidenceConfidence;
  newState?: KnowledgeState;
  newConfidence?: EvidenceConfidence;
  reasonCode?: "DIAGNOSTIC_EVALUATION";
  ruleVersion?: string;
}

/**
 * Checks whether an actual state or confidence transition occurred.
 * Transitions are recorded only when state OR confidence changes.
 */
export function checkMasteryTransition(
  previousState: KnowledgeState | null | undefined,
  previousConfidence: EvidenceConfidence | null | undefined,
  newState: KnowledgeState,
  newConfidence: EvidenceConfidence
): MasteryTransitionCheckResult {
  const effPrevState: KnowledgeState = previousState || "NOT_ASSESSED";
  const effPrevConf: EvidenceConfidence = previousConfidence || "LOW";

  if (effPrevState === newState && effPrevConf === newConfidence) {
    return { hasTransition: false };
  }

  return {
    hasTransition: true,
    previousState: effPrevState,
    previousConfidence: effPrevConf,
    newState,
    newConfidence,
    reasonCode: "DIAGNOSTIC_EVALUATION",
    ruleVersion: DIAGNOSTIC_MASTERY_RULE_VERSION,
  };
}

/**
 * AI School V3 — Canonical Reviewable Content Hash
 * 
 * Computes deterministic SHA-256 digest of pedagogical content inside the domain authority.
 * Strictly extracts review-relevant pedagogical fields (including authoringOrigin)
 * and excludes mutable workflow metadata (reviewState, reviewAttestation, publicationState,
 * publishedAt, publishedBy, itemMaturity).
 * 
 * Array Ordering Rules:
 * - Only normalize/sort explicitly set-like arrays (supportingNodeIds, misconceptionTags, nodeIds).
 * - Strictly PRESERVE semantic order for prompt, options, examples, steps, and RichContent arrays.
 */

import { stableCanonicalJsonSha256 } from "./canonical-json";
import { QuestionItem, Lesson, Explanation, ParentGuide } from "./schema";

export type ReviewableContentItem =
  | QuestionItem
  | Lesson
  | Explanation
  | ParentGuide
  | Record<string, unknown>;

/**
 * Extracts normalized, deterministic reviewable payload for QuestionItem.
 */
function extractQuestionItemPayload(item: Partial<QuestionItem>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: item.id ?? "",
    primaryNodeId: item.primaryNodeId ?? "",
    // Only sort explicitly set-like arrays
    supportingNodeIds: Array.isArray(item.supportingNodeIds)
      ? [...item.supportingNodeIds].sort()
      : [],
    type: item.type ?? "",
    cognitiveDemand: item.cognitiveDemand ?? "",
    // Strictly preserve semantic order of prompt and options
    prompt: item.prompt ?? [],
    correctAnswer: item.correctAnswer ?? "",
    rationale: item.rationale ?? "",
    distractorRationales: item.distractorRationales ?? {},
    // Set-like array
    misconceptionTags: Array.isArray(item.misconceptionTags)
      ? [...item.misconceptionTags].sort()
      : [],
    sourceRefs: item.sourceRefs ?? [],
    // MUST include authoringOrigin
    authoringOrigin: item.authoringOrigin ?? "AI_ASSISTED",
    version: item.version ?? "1.0.0",
  };

  // Preserve semantic order of options
  if (item.options !== undefined && item.options !== null) {
    payload.options = item.options;
  }

  // answerSpec when present
  if ((item as any).answerSpec !== undefined && (item as any).answerSpec !== null) {
    payload.answerSpec = (item as any).answerSpec;
  }

  return payload;
}

/**
 * Extracts normalized, deterministic reviewable payload for Lesson.
 */
function extractLessonPayload(item: Partial<Lesson>): Record<string, unknown> {
  return {
    id: item.id ?? "",
    // Set-like array
    nodeIds: Array.isArray(item.nodeIds) ? [...item.nodeIds].sort() : [],
    title: item.title ?? "",
    // Strictly preserve semantic order of learnerText and workedExamples
    learnerText: item.learnerText ?? [],
    workedExamples: item.workedExamples ?? [],
    approvedSourceRefs: item.approvedSourceRefs ?? [],
    ageOrGradeFit: item.ageOrGradeFit ?? [],
    authoringOrigin: item.authoringOrigin ?? "AI_ASSISTED",
    version: item.version ?? "1.0.0",
  };
}

/**
 * Extracts normalized, deterministic reviewable payload for Explanation.
 */
function extractExplanationPayload(item: Partial<Explanation>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    itemId: item.itemId ?? "",
    shortExplanation: item.shortExplanation ?? [],
    stepByStep: item.stepByStep ?? [],
    sourceRefs: item.sourceRefs ?? [],
  };
  if (item.commonMistakeExplanation) {
    payload.commonMistakeExplanation = item.commonMistakeExplanation;
  }
  return payload;
}

/**
 * Extracts normalized, deterministic reviewable payload for ParentGuide.
 */
function extractParentGuidePayload(item: Partial<ParentGuide>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    nodeId: item.nodeId ?? "",
    parentSummary: item.parentSummary ?? "",
    whatChildNeedsToUnderstand: item.whatChildNeedsToUnderstand ?? [],
    commonDifficulties: item.commonDifficulties ?? [],
    questionsToAskChild: item.questionsToAskChild ?? [],
    hintsWithoutGivingAnswer: item.hintsWithoutGivingAnswer ?? [],
    everydayExamples: item.everydayExamples ?? [],
    sourceRefs: item.sourceRefs ?? [],
  };
  if (item.fullParentSolutionGuide) {
    payload.fullParentSolutionGuide = item.fullParentSolutionGuide;
  }
  return payload;
}

/**
 * Deterministically identifies content scope and extracts pedagogical fields.
 */
export function extractPedagogicalPayload(item: ReviewableContentItem): Record<string, unknown> {
  if (!item || typeof item !== "object") {
    throw new Error("Cannot compute canonical hash of non-object content");
  }

  // QuestionItem signature: has 'primaryNodeId' or 'cognitiveDemand' or 'correctAnswer'
  if ("primaryNodeId" in item || "correctAnswer" in item || "cognitiveDemand" in item) {
    return extractQuestionItemPayload(item as Partial<QuestionItem>);
  }

  // Lesson signature: has 'learnerText' or 'workedExamples'
  if ("learnerText" in item || "workedExamples" in item) {
    return extractLessonPayload(item as Partial<Lesson>);
  }

  // Explanation signature: has 'shortExplanation' or 'stepByStep'
  if ("shortExplanation" in item || "stepByStep" in item) {
    return extractExplanationPayload(item as Partial<Explanation>);
  }

  // ParentGuide signature: has 'whatChildNeedsToUnderstand' or 'questionsToAskChild'
  if ("whatChildNeedsToUnderstand" in item || "questionsToAskChild" in item) {
    return extractParentGuidePayload(item as Partial<ParentGuide>);
  }

  // Generic fallback: clone object excluding mutable workflow metadata
  const genericPayload: Record<string, unknown> = {};
  const excludedKeys = new Set([
    "reviewState",
    "reviewAttestation",
    "publicationState",
    "publishedAt",
    "publishedBy",
    "itemMaturity",
  ]);

  for (const [key, val] of Object.entries(item)) {
    if (!excludedKeys.has(key)) {
      genericPayload[key] = val;
    }
  }

  return genericPayload;
}

/**
 * Computes canonical SHA-256 hash of reviewable pedagogical content.
 * Equivalent pedagogical content always produces the identical hash.
 */
export function canonicalContentHash(item: ReviewableContentItem): string {
  const payload = extractPedagogicalPayload(item);
  return stableCanonicalJsonSha256(payload);
}

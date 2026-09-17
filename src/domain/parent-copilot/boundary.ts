/**
 * AI School V3 — Parent Copilot Boundary Contract
 * Based on PARENT_COPILOT_BOUNDARY_V1.md
 * Core rule: AI helps the parent teach; AI does not become the child's source of truth.
 */

import { SourceRef, Lesson, Explanation, ParentGuide, QuestionItem } from "../content/schema";

export type ParentCopilotMode = "GUIDE_CHILD" | "EXPLAIN_TO_PARENT";

export interface ParentGroundingCorpus {
  nodeId: string;
  nodeLabel: string;
  sourceRefs: SourceRef[];
  reviewedLesson?: Lesson;
  reviewedExplanation?: Explanation;
  parentGuide?: ParentGuide;
  currentQuestion?: QuestionItem;
  childMistakeRationale?: string;
}

export interface ParentCopilotQuery {
  mode: ParentCopilotMode;
  parentPrompt: string;
  groundingCorpus: ParentGroundingCorpus;
}

export interface ParentCopilotResponse {
  mode: ParentCopilotMode;
  summaryForParent: string;
  childStumblingPoint: string;
  guidanceApproach: string;
  suggestedQuestion: string;
  realWorldExample?: string;
  sourceAttribution: string;
  isGroundedInReviewedSource: boolean;
}

export class MasteryModificationForbiddenError extends Error {
  constructor() {
    super(
      "AI_COPILOT_BOUNDARY_VIOLATION: Parent Copilot is strictly informative and cannot mutate learner mastery state. Mastery updates require reviewed assessment evidence."
    );
    this.name = "MasteryModificationForbiddenError";
  }
}

/**
 * Hard barrier ensuring no AI call can modify learner mastery.
 */
export function assertCannotModifyMastery(actionAttempted: string): void {
  if (
    actionAttempted.includes("mastery") ||
    actionAttempted.includes("state") ||
    actionAttempted.includes("score")
  ) {
    throw new MasteryModificationForbiddenError();
  }
}

/**
 * Validates that grounding corpus contains sufficient reviewed material.
 * If not, returns safe fallback without guessing.
 */
export function buildGroundedParentResponse(
  query: ParentCopilotQuery
): ParentCopilotResponse {
  const { groundingCorpus, mode } = query;

  if (
    !groundingCorpus.parentGuide &&
    !groundingCorpus.reviewedExplanation &&
    groundingCorpus.sourceRefs.length === 0
  ) {
    return {
      mode,
      summaryForParent: "Nguồn hiện có chưa đủ để trả lời chắc chắn.",
      childStumblingPoint: "Chưa có bằng chứng chẩn đoán cụ thể.",
      guidanceApproach: "Khuyến khích con trao đổi trực tiếp với giáo viên bộ môn.",
      suggestedQuestion: "Con cảm thấy vướng mắc nhất ở bước nào trong bài học?",
      sourceAttribution: "N/A",
      isGroundedInReviewedSource: false,
    };
  }

  const guide = groundingCorpus.parentGuide;
  const explanation = groundingCorpus.reviewedExplanation;

  return {
    mode,
    summaryForParent:
      guide?.parentSummary ||
      `Khái niệm cốt lõi: ${groundingCorpus.nodeLabel}. Học sinh cần nắm chắc bản chất trước khi làm bài tập tính toán.`,
    childStumblingPoint:
      groundingCorpus.childMistakeRationale ||
      guide?.commonDifficulties?.[0] ||
      "Con có thể đang áp dụng máy móc quy tắc mà chưa hiểu bản chất đại lượng.",
    guidanceApproach:
      guide?.hintsWithoutGivingAnswer?.[0] ||
      "Gợi ý con quan sát hình ảnh trực quan hoặc vẽ sơ đồ trước khi áp dụng công thức.",
    suggestedQuestion:
      guide?.questionsToAskChild?.[0] ||
      `Theo con, vì sao bước này chúng ta cần làm như vậy thay vì làm cách khác?`,
    realWorldExample: guide?.everydayExamples?.[0],
    sourceAttribution:
      groundingCorpus.sourceRefs[0]?.citationText ||
      "Chương trình GDPT 2018 — Bộ Giáo dục và Đào tạo",
    isGroundedInReviewedSource: true,
  };
}

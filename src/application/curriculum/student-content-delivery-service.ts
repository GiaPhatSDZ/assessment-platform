import "server-only";

import canonicalQuestionItems from "@/curriculum/vietnam/lower-secondary/grade-6/math/question-bank/items.json";
import canonicalLessonData from "@/curriculum/vietnam/lower-secondary/grade-6/math/lessons/fractions-addition.json";
import { filterPublishedForStudent, isPublishedForStudent } from "@/src/domain/content/publication-guard";
import { DiagnosticItem } from "@/src/domain/diagnostic/types";

export type ContentDeliveryStatus = "PUBLISHED" | "CONTENT_NOT_AVAILABLE";

export interface SanitizedDiagnosticItemDto {
  id: string;
  primaryNodeId: string;
  nodeIds: string[];
  type: string;
  cognitiveDemand: string;
  prompt: string;
  options: { id: string; text: string }[];
  isReTest: boolean;
}

export interface DiagnosticDeliveryDto {
  status: ContentDeliveryStatus;
  topicId: string;
  topicTitle: string;
  items: SanitizedDiagnosticItemDto[];
  reTestItems: SanitizedDiagnosticItemDto[];
  reason?: string;
}

export interface LessonDeliveryDto {
  id: string;
  nodeIds: string[];
  title: string;
  learnerGuide: string;
  workedExamples: string[];
  practicePlan: string[];
}

function canonicalToSanitizedItem(item: any): SanitizedDiagnosticItemDto {
  let promptText = "";
  if (Array.isArray(item.prompt)) {
    promptText = item.prompt
      .map((p: any) => (p.type === "block_math" || p.type === "inline_math" ? `$${p.latex}$` : p.value || ""))
      .join(" ");
  } else if (typeof item.prompt === "string") {
    promptText = item.prompt;
  }

  const options = Array.isArray(item.options)
    ? item.options.map((opt: any) => {
        let optText = "";
        if (Array.isArray(opt.content)) {
          optText = opt.content
            .map((c: any) => (c.type === "block_math" || c.type === "inline_math" ? `$${c.latex}$` : c.value || ""))
            .join(" ");
        } else if (typeof opt.text === "string") {
          optText = opt.text;
        } else if (typeof opt.content === "string") {
          optText = opt.content;
        }
        return {
          id: opt.id,
          text: optText || opt.id,
        };
      })
    : [];

  return {
    id: item.id,
    primaryNodeId: item.primaryNodeId,
    nodeIds: [item.primaryNodeId, ...(item.supportingNodeIds || [])],
    type: item.type || "MULTIPLE_CHOICE",
    cognitiveDemand: item.cognitiveDemand || "APPLY",
    prompt: promptText,
    options,
    isReTest: Boolean(item.isReTest),
  };
}

/**
 * Server-only Student Content Delivery Service.
 * Acts as the sole authorized bridge between canonical curriculum storage
 * and student runtime delivery. Enforces cryptographic publication gate before
 * releasing any content to student components.
 */
export class StudentContentDeliveryService {
  /**
   * Evaluates canonical question bank for Grade 6 / requested topic.
   * If items are in DRAFT state or unreviewed, returns fail-closed CONTENT_NOT_AVAILABLE
   * with zero draft question content crossing to client.
   */
  static getDiagnosticDelivery(topicId: string = "math-grade6-fractions"): DiagnosticDeliveryDto {
    const publishedItems = filterPublishedForStudent(canonicalQuestionItems as any[]);

    if (publishedItems.length === 0) {
      return {
        status: "CONTENT_NOT_AVAILABLE",
        topicId,
        topicTitle: "Phép cộng phân số khác mẫu số (Toán Lớp 6)",
        items: [],
        reTestItems: [],
        reason: "DRAFT_AWAITING_HUMAN_REVIEW",
      };
    }

    const sanitized = publishedItems.map(canonicalToSanitizedItem);
    return {
      status: "PUBLISHED",
      topicId,
      topicTitle: "Phép cộng phân số khác mẫu số (Toán Lớp 6)",
      items: sanitized.filter((i) => !i.isReTest),
      reTestItems: sanitized.filter((i) => i.isReTest),
    };
  }

  /**
   * Retrieves reviewed lesson delivery DTO if published through publication gate.
   * Returns null if unreviewed or in DRAFT state.
   */
  static getLessonDelivery(nodeId: string): LessonDeliveryDto | null {
    if (!canonicalLessonData.nodeIds.includes(nodeId)) {
      return null;
    }

    if (!isPublishedForStudent(canonicalLessonData as any)) {
      return null;
    }

    const promptStr = (ex: any) =>
      Array.isArray(ex.prompt)
        ? ex.prompt.map((p: any) => (p.latex ? `$${p.latex}$` : p.value || "")).join(" ")
        : "";
    const stepsStr = (ex: any) =>
      Array.isArray(ex.steps)
        ? ex.steps.map((s: any) => (s.latex ? `$${s.latex}$` : s.value || "")).join(" ")
        : "";

    const workedExamples = Array.isArray(canonicalLessonData.workedExamples)
      ? canonicalLessonData.workedExamples.map(
          (ex: any, idx: number) => `Ví dụ ${idx + 1}: ${promptStr(ex)} ${stepsStr(ex)} => Đáp số: ${ex.finalAnswer || ""}`.trim()
        )
      : [];

    const learnerGuide = Array.isArray(canonicalLessonData.learnerText)
      ? canonicalLessonData.learnerText.map((t: any) => (t.latex ? `$${t.latex}$` : t.value || "")).join(" ").trim()
      : "";

    return {
      id: canonicalLessonData.id,
      nodeIds: canonicalLessonData.nodeIds,
      title: canonicalLessonData.title,
      learnerGuide,
      workedExamples,
      practicePlan: [
        "Bài tự luyện 1: Thực hiện bài toán theo đúng các bước đã hướng dẫn.",
        "Bài tự luyện 2: Rút gọn phân số kết quả về dạng tối giản.",
      ],
    };
  }
}

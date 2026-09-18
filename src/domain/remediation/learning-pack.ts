import { SourceReference } from "../curriculum/types";
import { GapReport } from "../diagnostic/gap-engine";
import canonicalLessonData from "@/curriculum/vietnam/lower-secondary/grade-6/math/lessons/fractions-addition.json";
import { isPublishedForStudent } from "../content/publication-guard";

export interface LearningResourceRef {
  id: string;
  title: string;
  type: "TEXTBOOK_SECTION" | "WORKED_EXAMPLE" | "VIDEO_EXPLANATION" | "OFFICIAL_CURRICULUM_EXCERPT";
  url?: string;
  sourceTier: "A" | "D";
  description: string;
}

export interface LearningPack {
  id: string;
  sessionId: string;
  targetNodeId: string;
  targetNodeLabel: string;
  gapClassification: string;
  focusNodeId: string;
  focusNodeLabel: string;
  prerequisitePath: string[];
  curriculumSourceRefs: SourceReference[];
  learningResourceRefs: LearningResourceRef[];
  objective: string;
  parentGuide: string;
  learnerGuide: string;
  workedExamplePlan: string[];
  practicePlan: string[];
  geminiNotebookInstructions: {
    suggestedTitle: string;
    suggestedSources: string[];
    copyablePrompt: string;
  };
  reTestCriteria: string[];
  version: string;
  generatedAt: string;
  contentStatus: "PUBLISHED" | "CONTENT_NOT_AVAILABLE";
}

export const LEARNING_PACK_VERSION = "1.0.0";

function extractWorkedExamples(lesson: any): string[] {
  if (!lesson || !Array.isArray(lesson.workedExamples)) return [];
  return lesson.workedExamples.map((ex: any, idx: number) => {
    const promptStr = Array.isArray(ex.prompt)
      ? ex.prompt.map((p: any) => (p.latex ? `$${p.latex}$` : p.value || "")).join(" ")
      : "";
    const stepsStr = Array.isArray(ex.steps)
      ? ex.steps.map((s: any) => (s.latex ? `$${s.latex}$` : s.value || "")).join(" ")
      : "";
    return `Ví dụ ${idx + 1}: ${promptStr} ${stepsStr} => Đáp số: ${ex.finalAnswer || ""}`.trim();
  });
}

function extractLearnerText(lesson: any): string {
  if (!lesson || !Array.isArray(lesson.learnerText)) return "";
  return lesson.learnerText
    .map((t: any) => (t.latex ? `$${t.latex}$` : t.value || ""))
    .join(" ")
    .trim();
}

/**
 * Generates an evidence-backed Learning Pack to remediate an identified gap.
 * Student-facing learning content MUST be verified through the publication authority.
 * If canonical lesson content is in DRAFT state or unreviewed, fail closed with CONTENT_NOT_AVAILABLE
 * and strictly zero Tier-D or hardcoded/unreviewed student materials.
 */
export function generateLearningPack(gap: GapReport, lessonOverride?: any): LearningPack {
  const isPrereqGap = gap.classification === "PREREQUISITE_GAP_CANDIDATE";
  const focusNodeId = (isPrereqGap && gap.rootPrerequisiteNodeId) ? gap.rootPrerequisiteNodeId : gap.targetNodeId;
  const focusNodeLabel = (isPrereqGap && gap.rootPrerequisiteNodeLabel) ? gap.rootPrerequisiteNodeLabel : gap.targetNodeLabel;

  // Resolve candidate lesson for the focus node
  const candidateLesson = lessonOverride ?? (
    canonicalLessonData.nodeIds.includes(focusNodeId) ? canonicalLessonData : null
  );

  // Publication gate check
  const isLessonPublished = candidateLesson ? isPublishedForStudent(candidateLesson) : false;
  const contentStatus: "PUBLISHED" | "CONTENT_NOT_AVAILABLE" = isLessonPublished
    ? "PUBLISHED"
    : "CONTENT_NOT_AVAILABLE";

  const curriculumSourceRefs: SourceReference[] = [
    {
      sourceId: "SRC-VN-MOET-MATH-2018",
      documentTitle: "Chương trình Giáo dục phổ thông môn Toán 2018",
      clauseOrSection: "Mục IV - Mạch Số và Đại số",
      quote: "Vận dụng được trong việc quy đồng mẫu số các phân số và thực hiện các phép tính cộng, trừ đối với phân số.",
      url: "https://moet.gov.vn",
    },
  ];

  // Student-facing learning resources: Strictly empty unless authorized by publication guard
  const learningResourceRefs: LearningResourceRef[] = isLessonPublished
    ? [
        {
          id: candidateLesson.id,
          title: candidateLesson.title || "Bài học bổ trợ",
          type: "TEXTBOOK_SECTION",
          sourceTier: "A",
          description: "Học liệu sư phạm đã được phê duyệt.",
        },
      ]
    : [];

  const objective = isPrereqGap
    ? `Bồi đắp kiến thức nền tảng '${focusNodeLabel}' để làm tiền đề giải quyết vững vàng bài '${gap.targetNodeLabel}'.`
    : `Luyện tập thành thạo quy tắc và kỹ năng thực hiện '${gap.targetNodeLabel}'.`;

  const parentGuide = isPrereqGap
    ? `Ba mẹ không cần phải tự dạy lại bài toán từ đầu. Điểm mấu chốt: Con đang vướng ở bước '${focusNodeLabel}' (chưa tìm đúng mẫu số chung nhỏ nhất). Phụ huynh có thể tham khảo Trợ lý Phụ huynh (Parent Copilot) để nhận bộ câu hỏi gợi ý phương pháp đồng hành cùng con mà không làm thay con.`
    : `Con đã nắm vững các bước quy đồng mẫu số. Ba mẹ chỉ cần nhắc con kiểm tra lại khâu tính toán nhẩm và rút gọn phân số sau khi cộng.`;

  // Student-facing text & plans: Empty when unreviewed
  const learnerGuide = isLessonPublished
    ? extractLearnerText(candidateLesson)
    : "";

  const workedExamplePlan = isLessonPublished
    ? extractWorkedExamples(candidateLesson)
    : [];

  const practicePlan: string[] = isLessonPublished
    ? [
        "Bài tự luyện 1: Thực hiện bài toán theo đúng các bước đã hướng dẫn.",
        "Bài tự luyện 2: Rút gọn phân số kết quả về dạng tối giản.",
      ]
    : [];

  const geminiNotebookPrompt = `Bạn là trợ lý sư phạm dành riêng cho phụ huynh/người giám hộ học sinh bám sát Chương trình GDPT 2018 Bộ GD&ĐT Việt Nam.
Mục tiêu: Hỗ trợ phụ huynh phương pháp đồng hành cùng con củng cố mắt xích kiến thức: "${focusNodeLabel}".
Quy tắc sư phạm:
1. Chỉ dựa trên tài liệu học tập chuẩn được cung cấp trong notebook này.
2. Không giải bài hộ học sinh. Hướng dẫn phụ huynh đặt câu hỏi gợi mở cho con: "Để cộng được hai phân số này, bước đầu tiên con cần làm gì với hai mẫu số?".
3. Gợi ý ví dụ trực quan đời thường (như chia bánh, chia cốc nước) để phụ huynh giúp con cảm nhận bản chất quy đồng trước khi áp dụng công thức.
4. Ngôn từ ấm áp, rõ ràng, hỗ trợ phụ huynh kiên nhẫn đồng hành cùng con.`;

  const reTestCriteria = [
    "Thực hiện bài toán tìm BCNN của hai mẫu số đúng quy trình.",
    "Quy đồng mẫu số và tính đúng phép cộng hai phân số không cùng mẫu số.",
    "Rút gọn phân số kết quả về dạng tối giản.",
  ];

  return {
    id: `LP-${gap.sessionId}-${focusNodeId}`,
    sessionId: gap.sessionId,
    targetNodeId: gap.targetNodeId,
    targetNodeLabel: gap.targetNodeLabel,
    gapClassification: gap.classification,
    focusNodeId,
    focusNodeLabel,
    prerequisitePath: gap.prerequisiteChainPath,
    curriculumSourceRefs,
    learningResourceRefs,
    objective,
    parentGuide,
    learnerGuide,
    workedExamplePlan,
    practicePlan,
    geminiNotebookInstructions: {
      suggestedTitle: `Sổ Đồng Hành Phụ Huynh Toán 6 — Hỗ Trợ: ${focusNodeLabel}`,
      suggestedSources: [
        "Trích lục Chương trình GDPT 2018 Môn Toán (Bộ GD&ĐT)",
        "Tài liệu hướng dẫn quy đồng mẫu số và tìm BCNN",
      ],
      copyablePrompt: geminiNotebookPrompt,
    },
    reTestCriteria,
    version: LEARNING_PACK_VERSION,
    generatedAt: new Date().toISOString(),
    contentStatus,
  };
}

import { SourceReference } from "../curriculum/types";
import { GapReport } from "../diagnostic/gap-engine";
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

  // Resolve candidate lesson (supplied ONLY after server-side publication authorization or explicit test injection)
  const candidateLesson = lessonOverride ?? null;

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
    ? `Ba mẹ không cần phải tự dạy lại bài toán từ đầu. Điểm mấu chốt: Con đang vướng ở bước '${focusNodeLabel}' (chưa tìm đúng mẫu số chung nhỏ nhất). Phụ huynh có thể tham khảo Trợ lý Phụ huynh (Parent Copilot) để nhận bộ câu hỏi gợi mở phương pháp đồng hành cùng con mà không làm thay con.`
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
    reTestCriteria,
    version: LEARNING_PACK_VERSION,
    generatedAt: new Date().toISOString(),
    contentStatus,
  };
}

import { SourceReference } from "../curriculum/types";
import { GapReport } from "../diagnostic/gap-engine";

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
}

export const LEARNING_PACK_VERSION = "1.0.0";

/**
 * Generates an evidence-backed Learning Pack to remediate an identified gap.
 */
export function generateLearningPack(gap: GapReport): LearningPack {
  const isPrereqGap = gap.classification === "PREREQUISITE_GAP_CANDIDATE";
  const focusNodeId = (isPrereqGap && gap.rootPrerequisiteNodeId) ? gap.rootPrerequisiteNodeId : gap.targetNodeId;
  const focusNodeLabel = (isPrereqGap && gap.rootPrerequisiteNodeLabel) ? gap.rootPrerequisiteNodeLabel : gap.targetNodeLabel;

  const curriculumSourceRefs: SourceReference[] = [
    {
      sourceId: "SRC-VN-MOET-MATH-2018",
      documentTitle: "Chương trình Giáo dục phổ thông môn Toán 2018",
      clauseOrSection: "Mục IV - Mạch Số và Đại số",
      quote: "Vận dụng được trong việc quy đồng mẫu số các phân số và thực hiện các phép tính cộng, trừ đối với phân số.",
      url: "https://moet.gov.vn",
    },
  ];

  const learningResourceRefs: LearningResourceRef[] = [
    {
      id: "RES-MATH-G6-BCNN",
      title: "Chuyên đề: Bội chung nhỏ nhất và Quy tắc tìm Mẫu số chung",
      type: "WORKED_EXAMPLE",
      sourceTier: "D",
      description: "Các bước phân tích mẫu số ra thừa số nguyên tố và chọn lũy thừa lớn nhất để làm BCNN.",
    },
    {
      id: "RES-MATH-G6-ADD-WORKED",
      title: "Ví dụ mẫu: Quy đồng mẫu số và Phép cộng phân số khác mẫu",
      type: "WORKED_EXAMPLE",
      sourceTier: "D",
      description: "Ví dụ chi tiết từng bước có giải thích lý do tại sao không thể cộng trực tiếp mẫu số với mẫu số.",
    },
  ];

  const objective = isPrereqGap
    ? `Bồi đắp kiến thức nền tảng '${focusNodeLabel}' để làm tiền đề giải quyết vững vàng bài '${gap.targetNodeLabel}'.`
    : `Luyện tập thành thạo quy tắc và kỹ năng thực hiện '${gap.targetNodeLabel}'.`;

  const parentGuide = isPrereqGap
    ? `Ba mẹ không cần phải tự dạy lại bài toán từ đầu. Điểm mấu chốt: Con đang vướng ở bước '${focusNodeLabel}' (chưa tìm đúng mẫu số chung nhỏ nhất). Hãy cho con xem 2 ví dụ mẫu có hướng dẫn dưới đây; phụ huynh có thể tham khảo Trợ lý Phụ huynh (Parent Copilot / NotebookLM) để nhận bộ câu hỏi gợi ý phương pháp đồng hành cùng con mà không làm thay con.`
    : `Con đã nắm vững các bước quy đồng mẫu số. Ba mẹ chỉ cần nhắc con kiểm tra lại khâu tính toán nhẩm và rút gọn phân số sau khi cộng.`;

  const learnerGuide = isPrereqGap
    ? `Khi gặp bài cộng phân số khác mẫu như 3/8 + 5/12, nhầm lẫn thường gặp là vội lấy (3+5)/(8+12). Hãy nhớ: Ta không thể cộng trực tiếp khi các phần chia chưa cùng kích thước. Bước 1 luôn là tìm BCNN của 8 và 12 (bằng 24) để quy đồng!`
    : `Con thực hiện lần lượt 3 bước: 1. Tìm mẫu chung (BCNN) -> 2. Nhân cả tử và mẫu với thừa số phụ tương ứng -> 3. Giữ nguyên mẫu số chung, cộng tử số và rút gọn tối giản.`;

  const workedExamplePlan = [
    "Ví dụ 1: Tìm mẫu chung nhỏ nhất của 8 và 12 bằng phân tích thừa số nguyên tố: 8 = 2^3; 12 = 2^2 * 3 => BCNN = 2^3 * 3 = 24.",
    "Ví dụ 2: Quy đồng 3/8 = (3*3)/24 = 9/24 và 5/12 = (5*2)/24 = 10/24.",
    "Ví dụ 3: Thực hiện phép cộng: 9/24 + 10/24 = (9+10)/24 = 19/24 (kết quả đã tối giản).",
  ];

  const practicePlan = [
    "Bài tự luyện 1: Tìm BCNN của 6 và 10.",
    "Bài tự luyện 2: Quy đồng mẫu số hai phân số 1/6 và 3/10 với mẫu chung là 30.",
    "Bài tự luyện 3: Tính phép cộng 1/6 + 3/10 và rút gọn về phân số tối giản.",
  ];

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
        "3 bài tập ví dụ mẫu có lời giải chi tiết",
      ],
      copyablePrompt: geminiNotebookPrompt,
    },
    reTestCriteria,
    version: LEARNING_PACK_VERSION,
    generatedAt: new Date().toISOString(),
  };
}

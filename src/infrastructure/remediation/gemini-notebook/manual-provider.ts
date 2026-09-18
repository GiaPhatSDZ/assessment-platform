import { LearningPack } from "@/src/domain/remediation/learning-pack";

export interface NotebookManualGuide {
  notebookName: string;
  notebookUrl: string;
  stepByStepGuide: string[];
  suggestedPrompt: string;
  recommendedSources: string[];
  safetyAndAgeNote: string;
}

export function createParentNotebookPrompt(focusNodeLabel: string): string {
  return `Bạn là trợ lý sư phạm dành riêng cho phụ huynh/người giám hộ học sinh bám sát Chương trình GDPT 2018 Bộ GD&ĐT Việt Nam.
Mục tiêu: Hỗ trợ phụ huynh phương pháp đồng hành cùng con củng cố mắt xích kiến thức: "${focusNodeLabel}".
Quy tắc sư phạm:
1. Chỉ dựa trên tài liệu học tập chuẩn được cung cấp trong notebook này.
2. Không giải bài hộ học sinh. Hướng dẫn phụ huynh đặt câu hỏi gợi mở cho con: "Để cộng được hai phân số này, bước đầu tiên con cần làm gì với hai mẫu số?".
3. Gợi ý ví dụ trực quan đời thường (như chia bánh, chia cốc nước) để phụ huynh giúp con cảm nhận bản chất quy đồng trước khi áp dụng công thức.
4. Ngôn từ ấm áp, rõ ràng, hỗ trợ phụ huynh kiên nhẫn đồng hành cùng con.`;
}

/**
 * Provides manual instructions and versioned prompts for Gemini Notebook remediation.
 * Conforms strictly to V3_GEMINI_NOTEBOOK_REMEDIATION_PROTOCOL.md
 * Strictly isolated for parent-only use.
 */
export class ManualGeminiNotebookProvider {
  static getRemediationGuide(learningPackOrFocus: LearningPack | { focusNodeLabel?: string }): NotebookManualGuide {
    const focusNodeLabel =
      "focusNodeLabel" in learningPackOrFocus && learningPackOrFocus.focusNodeLabel
        ? learningPackOrFocus.focusNodeLabel
        : "Kiến thức trọng tâm";

    const suggestedTitle = `Sổ Đồng Hành Phụ Huynh Toán 6 — Hỗ Trợ: ${focusNodeLabel}`;
    const suggestedPrompt = createParentNotebookPrompt(focusNodeLabel);
    const recommendedSources = [
      "Trích lục Chương trình GDPT 2018 Môn Toán (Bộ GD&ĐT)",
      "Tài liệu hướng dẫn quy đồng mẫu số và tìm BCNN",
    ];

    return {
      notebookName: suggestedTitle,
      notebookUrl: "https://notebooklm.google.com/",
      stepByStepGuide: [
        "1. Phụ huynh bấm nút 'Mở NotebookLM' để truy cập giao diện Google NotebookLM (dành riêng cho phụ huynh/người giám hộ).",
        "2. Tạo một cuốn sổ tay mới (New Notebook) và đặt tên là: '" + suggestedTitle + "'.",
        "3. Tải lên hoặc dán các nguồn tài liệu học tập chuẩn được chỉ định ở dưới.",
        "4. Dán đoạn Lời nhắc sư phạm (Prompt) có sẵn bên dưới vào khung đối soát để nhận các câu hỏi gợi mở và ví dụ đời thường.",
        "5. Phụ huynh sử dụng câu hỏi gợi mở để hướng dẫn con tự suy nghĩ và tự làm bài trên giấy, tuyệt đối không cho con sử dụng AI trực tiếp.",
      ],
      suggestedPrompt,
      recommendedSources,
      safetyAndAgeNote:
        "Lưu ý an toàn: Học sinh không trực tiếp sử dụng hay trò chuyện với AI. Công cụ này được thiết kế dành riêng cho phụ huynh nhằm tham khảo phương pháp sư phạm gợi mở, hỗ trợ con tự làm chủ kiến thức.",
    };
  }
}

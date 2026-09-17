import { LearningPack } from "@/src/domain/remediation/learning-pack";

export interface NotebookManualGuide {
  notebookName: string;
  notebookUrl: string;
  stepByStepGuide: string[];
  suggestedPrompt: string;
  recommendedSources: string[];
  safetyAndAgeNote: string;
}

/**
 * Provides manual instructions and versioned prompts for Gemini Notebook remediation.
 * Conforms strictly to V3_GEMINI_NOTEBOOK_REMEDIATION_PROTOCOL.md
 */
export class ManualGeminiNotebookProvider {
  static getRemediationGuide(learningPack: LearningPack): NotebookManualGuide {
    return {
      notebookName: learningPack.geminiNotebookInstructions.suggestedTitle,
      notebookUrl: "https://notebooklm.google.com/",
      stepByStepGuide: [
        "1. Phụ huynh bấm nút 'Mở NotebookLM' để truy cập giao diện Google NotebookLM (dành riêng cho phụ huynh/người giám hộ).",
        "2. Tạo một cuốn sổ tay mới (New Notebook) và đặt tên là: '" + learningPack.geminiNotebookInstructions.suggestedTitle + "'.",
        "3. Tải lên hoặc dán các nguồn tài liệu học tập chuẩn được chỉ định ở dưới.",
        "4. Dán đoạn Lời nhắc sư phạm (Prompt) có sẵn bên dưới vào khung đối soát để nhận các câu hỏi gợi mở và ví dụ đời thường.",
        "5. Phụ huynh sử dụng câu hỏi gợi mở để hướng dẫn con tự suy nghĩ và tự làm bài trên giấy, tuyệt đối không cho con sử dụng AI trực tiếp.",
      ],
      suggestedPrompt: learningPack.geminiNotebookInstructions.copyablePrompt,
      recommendedSources: learningPack.geminiNotebookInstructions.suggestedSources,
      safetyAndAgeNote:
        "Lưu ý an toàn: Học sinh không trực tiếp sử dụng hay trò chuyện với AI. Công cụ này được thiết kế dành riêng cho phụ huynh nhằm tham khảo phương pháp sư phạm gợi mở, hỗ trợ con tự làm chủ kiến thức.",
    };
  }
}

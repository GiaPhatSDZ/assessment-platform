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
        "1. Bấm nút 'Mở Gemini Notebook' để truy cập giao diện Google Notebook.",
        "2. Tạo một cuốn sổ mới (New Notebook) và đặt tên là: '" + learningPack.geminiNotebookInstructions.suggestedTitle + "'.",
        "3. Tải lên hoặc dán các nguồn tài liệu ôn tập được chỉ định ở dưới.",
        "4. Dán đoạn Lời nhắc sư phạm (Prompt) có sẵn bên dưới vào khung chat để bắt đầu phiên học tập có trợ lý hướng dẫn.",
        "5. Sau khi đã nắm vững các bước làm, quay trở lại hệ thống để thực hiện bài Kiểm Tra Lại (Re-test).",
      ],
      suggestedPrompt: learningPack.geminiNotebookInstructions.copyablePrompt,
      recommendedSources: learningPack.geminiNotebookInstructions.suggestedSources,
      safetyAndAgeNote:
        "Lưu ý an toàn: Với học sinh lớp 6, phụ huynh nên đồng hành thiết lập sổ tay và giám sát phiên học. Gemini Notebook đóng vai trò người gia sư giải thích các nguồn học tập có sẵn, không thay thế việc tự tay làm bài tập.",
    };
  }
}

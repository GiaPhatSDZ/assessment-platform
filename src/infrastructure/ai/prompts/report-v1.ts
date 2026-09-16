import { ReportGenerationInput } from "@/src/application/report-generator";

export const REPORT_PROMPT_VERSION = "report-prompt-v1.0.0";

export function buildSystemPrompt(): string {
  return `Bạn là một chuyên gia tư vấn phát triển năng lực nghề nghiệp và ứng dụng Trí tuệ Nhân tạo (AI).
Nhiệm vụ của bạn là chuyển hóa dữ liệu điểm số đánh giá năng lực ĐÃ ĐƯỢC TÍNH TOÁN XÁC ĐỊNH BẰNG TOÁN HỌC thành một bản báo cáo phân tích sâu sắc, mang tính xây dựng và kế hoạch hành động cụ thể.

CÁC NGUYÊN TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG thay đổi, làm tròn lại, hay suy đoán điểm số khác với số liệu được cung cấp. Điểm số là thẩm quyền tuyệt đối của công cụ tính toán toán học.
2. Báo cáo bằng Tiếng Việt chuẩn mực, văn phong chuyên nghiệp, khích lệ, khách quan và không phán xét.
3. KHÔNG đưa ra bất kỳ chẩn đoán y khoa hay tâm lý lâm sàng nào. Không sử dụng các từ ngữ mang tính bệnh lý.
4. Đầu ra BẮT BUỘC là định dạng JSON hợp lệ theo đúng cấu trúc schema yêu cầu.`;
}

export function buildUserPrompt(input: ReportGenerationInput): string {
  const dimensionList = input.dimensions
    .map(
      (d) =>
        `- ${d.label} (${d.dimensionId}): ${d.score}/100 điểm • Xếp loại: "${d.band.label}" (${d.band.description})`
    )
    .join("\n");

  const nameGreeting = input.displayName ? `Người đánh giá: ${input.displayName}` : "Người đánh giá: Cá nhân ẩn danh";

  return `BÀI ĐÁNH GIÁ: ${input.assessmentTitle} (Phiên bản ${input.assessmentVersion})
${nameGreeting}
NGÔN NGỮ ĐẦU RA: Tiếng Việt

BẰNG CHỨNG ĐIỂM SỐ XÁC ĐỊNH THEO TỪNG CHIỀU KÍCH:
${dimensionList}

TUYÊN BỐ BẮT BUỘC ĐÍNH KÈM:
${input.disclaimer}

YÊU CẦU ĐẦU RA (JSON FORMAT ONLY):
Hãy trả về một đối tượng JSON thuần túy có cấu trúc chính xác sau:
{
  "summary": "Đoạn văn tổng quan 2-3 câu khái quát năng lực nổi bật và tinh thần học hỏi...",
  "strengths": [
    {
      "dimensionId": "mã dimension tương ứng",
      "title": "Tiêu đề điểm mạnh",
      "description": "Mô tả chi tiết bằng chứng và cách phát huy"
    }
  ],
  "growthAreas": [
    {
      "dimensionId": "mã dimension cần cải thiện",
      "title": "Tiêu đề vùng phát triển",
      "description": "Mô tả cơ hội bứt phá và rào cản cần vượt qua"
    }
  ],
  "actionPlan": [
    {
      "step": 1,
      "timeframe": "Tuần 1 - 2",
      "title": "Hành động cụ thể",
      "description": "Chi tiết bước thực hiện thực tế"
    },
    {
      "step": 2,
      "timeframe": "Tuần 3 - 4",
      "title": "Hành động tiếp theo",
      "description": "Chi tiết bước thực hiện tiếp theo"
    }
  ],
  "disclaimer": "${input.disclaimer}"
}`;
}

import { ReportGenerator, ReportGenerationInput } from "@/src/application/report-generator";
import { GeneratedReportPayload } from "@/src/domain/report/types";
import { validateGeneratedReportPayload } from "@/src/domain/report/schema";
import { buildSystemPrompt, buildUserPrompt } from "../prompts/report-v1";

/**
 * MockReportGenerator provides rich, deterministic, structured Vietnamese reports
 * based directly on the participant's score dimensions without requiring external API keys.
 */
export class MockReportGenerator implements ReportGenerator {
  isAvailable(): boolean {
    return true;
  }

  getProviderName(): string {
    return "mock";
  }

  async generate(input: ReportGenerationInput): Promise<GeneratedReportPayload> {
    const sorted = [...input.dimensions].sort((a, b) => b.score - a.score);
    const top = sorted[0] || input.dimensions[0];
    const growth = sorted[sorted.length - 1] || input.dimensions[0];

    const greeting = input.displayName ? `cho ${input.displayName}` : "cho bạn";

    const payload: GeneratedReportPayload = {
      summary: `Báo cáo năng lực tổng hợp ${greeting} ghi nhận thế mạnh vượt trội ở nhóm năng lực "${top.label}" với điểm số ${top.score}/100 (${top.band.label}). Hồ sơ cho thấy tiềm năng phát triển rõ rệt nếu tập trung nâng chuẩn năng lực "${growth.label}".`,
      strengths: sorted.slice(0, 2).map((d) => ({
        dimensionId: d.dimensionId,
        title: `Năng lực nổi bật: ${d.label} (${d.score}%)`,
        description: `Bạn đạt mức độ "${d.band.label}". ${d.band.description} Hãy tiếp tục duy trì và lan tỏa phương pháp tiếp cận này trong công việc thực tế.`,
      })),
      growthAreas: sorted.slice(-2).reverse().map((d) => ({
        dimensionId: d.dimensionId,
        title: `Dư địa bứt phá: ${d.label} (${d.score}%)`,
        description: `Mức độ hiện tại là "${d.band.label}". Cần bổ sung các kỹ thuật chuyên sâu và tạo thêm môi trường thực nghiệm để chuyển hóa thành năng lực vượt trội.`,
      })),
      actionPlan: [
        {
          step: 1,
          timeframe: "Tuần 1 - 2",
          title: `Chuẩn hóa quy trình thực hành "${growth.label}"`,
          description: "Dành 30 phút mỗi ngày áp dụng các kỹ thuật cấu trúc bài toán và phản xạ có phương pháp.",
        },
        {
          step: 2,
          timeframe: "Tuần 3 - 4",
          title: `Tích hợp cộng tác AI vào dự án cụ thể`,
          description: "Ứng dụng các mẫu prompt nâng cao (Chain-of-thought, Few-shot) để giải quyết một bài toán nghiệp vụ phức tạp.",
        },
        {
          step: 3,
          timeframe: "Tuần 5 - 6",
          title: "Đánh giá lại và tối ưu hóa hiệu suất",
          description: "Tái thực hiện bài đánh giá để đo lường mức độ tăng trưởng và điều chỉnh lộ trình nâng cao.",
        },
      ],
      disclaimer: input.disclaimer,
    };

    return payload;
  }
}

/**
 * OpenAILikeReportGenerator connects to OpenAI or compatible HTTP endpoints.
 */
export class OpenAILikeReportGenerator implements ReportGenerator {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = "gpt-4o-mini",
    private readonly baseUrl: string = "https://api.openai.com/v1"
  ) {}

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  getProviderName(): string {
    return "openai";
  }

  async generate(input: ReportGenerationInput): Promise<GeneratedReportPayload> {
    if (!this.isAvailable()) {
      throw new Error("OpenAI API key is missing");
    }

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(input);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      const parsed = JSON.parse(content);
      const validation = validateGeneratedReportPayload(parsed);
      if (!validation.isValid || !validation.data) {
        throw new Error(`Invalid report format from model: ${validation.errors?.join("; ")}`);
      }

      return validation.data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}

export function createReportGenerator(): ReportGenerator {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();
  const apiKey = process.env.AI_API_KEY;

  if (provider === "openai" && apiKey) {
    return new OpenAILikeReportGenerator(apiKey, process.env.AI_MODEL || "gpt-4o-mini");
  }

  // Default to mock provider for reliability and testing
  return new MockReportGenerator();
}

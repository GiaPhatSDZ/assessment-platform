import { describe, it, expect } from "vitest";
import { buildSystemPrompt, buildUserPrompt, REPORT_PROMPT_VERSION } from "./report-v1";
import { ReportGenerationInput } from "@/src/application/report-generator";
import { getResultBand } from "@/src/domain/assessment/result-bands";

describe("Versioned AI Prompt Builder V1", () => {
  it("exports valid version identifier", () => {
    expect(REPORT_PROMPT_VERSION).toBe("report-prompt-v1.0.0");
  });

  it("builds system prompt with score preservation and non-clinical constraints", () => {
    const systemPrompt = buildSystemPrompt();
    expect(systemPrompt).toContain("TUYỆT ĐỐI KHÔNG thay đổi");
    expect(systemPrompt).toContain("KHÔNG đưa ra bất kỳ chẩn đoán y khoa");
    expect(systemPrompt).toContain("JSON");
  });

  it("injects exact deterministic dimension evidence and disclaimer in user prompt", () => {
    const input: ReportGenerationInput = {
      assessmentTitle: "Đánh Giá Năng Lực AI",
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      displayName: "Nguyễn Văn Test",
      locale: "vi",
      disclaimer: "Tuyên bố miễn trừ trách nhiệm mẫu.",
      dimensions: [
        {
          dimensionId: "analytical_thinking",
          label: "Tư duy phân tích",
          score: 85,
          band: getResultBand(85),
        },
      ],
    };

    const userPrompt = buildUserPrompt(input);
    expect(userPrompt).toContain("Nguyễn Văn Test");
    expect(userPrompt).toContain("85/100 điểm");
    expect(userPrompt).toContain("analytical_thinking");
    expect(userPrompt).toContain("Tuyên bố miễn trừ trách nhiệm mẫu.");
  });
});

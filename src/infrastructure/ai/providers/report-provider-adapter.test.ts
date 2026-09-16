import { describe, it, expect, vi } from "vitest";
import { MockReportGenerator, OpenAILikeReportGenerator } from "./report-provider-adapter";
import { ReportGenerationInput } from "@/src/application/report-generator";
import { getResultBand } from "@/src/domain/assessment/result-bands";
import { validateGeneratedReportPayload } from "@/src/domain/report/schema";

describe("AI Report Provider Adapters", () => {
  const sampleInput: ReportGenerationInput = {
    assessmentTitle: "Đánh Giá Năng Lực AI",
    assessmentSlug: "ai-career-readiness",
    assessmentVersion: 1,
    displayName: "Lê Thị B",
    locale: "vi",
    disclaimer: "Tuyên bố mẫu không chẩn đoán y khoa.",
    dimensions: [
      {
        dimensionId: "analytical_thinking",
        label: "Tư duy phân tích",
        score: 80,
        band: getResultBand(80),
      },
      {
        dimensionId: "ai_literacy",
        label: "Hiểu biết AI",
        score: 60,
        band: getResultBand(60),
      },
    ],
  };

  it("MockReportGenerator generates valid, schema-compliant report payload", async () => {
    const generator = new MockReportGenerator();
    expect(generator.isAvailable()).toBe(true);
    expect(generator.getProviderName()).toBe("mock");

    const report = await generator.generate(sampleInput);
    expect(report.summary).toContain("Lê Thị B");
    expect(report.strengths.length).toBeGreaterThanOrEqual(1);
    expect(report.growthAreas.length).toBeGreaterThanOrEqual(1);
    expect(report.actionPlan.length).toBeGreaterThanOrEqual(1);

    const validation = validateGeneratedReportPayload(report);
    expect(validation.isValid).toBe(true);
  });

  it("OpenAILikeReportGenerator parses valid JSON response from model", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Báo cáo phân tích năng lực rất tốt và có định hướng phát triển rõ ràng.",
                strengths: [
                  { dimensionId: "analytical_thinking", title: "Điểm mạnh", description: "Phân tích tốt" },
                ],
                growthAreas: [
                  { dimensionId: "ai_literacy", title: "Cần cải thiện", description: "Học prompt thêm" },
                ],
                actionPlan: [
                  { step: 1, timeframe: "Tuần 1", title: "Bước 1", description: "Thực hành hàng ngày" },
                ],
                disclaimer: "Tuyên bố mẫu không chẩn đoán y khoa.",
              }),
            },
          },
        ],
      }),
    });

    global.fetch = mockFetch;

    const generator = new OpenAILikeReportGenerator("test-key-123");
    const report = await generator.generate(sampleInput);

    expect(report.summary).toBeTruthy();
    expect(report.strengths).toHaveLength(1);
  });

  it("OpenAILikeReportGenerator rejects malformed JSON response safely", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "invalid json string { not parsed",
            },
          },
        ],
      }),
    });

    global.fetch = mockFetch;
    const generator = new OpenAILikeReportGenerator("test-key-123");

    await expect(generator.generate(sampleInput)).rejects.toThrow();
  });
});

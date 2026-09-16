import { describe, it, expect } from "vitest";
import { GeneratedReportPayloadSchema, validateGeneratedReportPayload } from "./schema";

describe("AI Report Payload Validation", () => {
  const validPayload = {
    summary: "Người đánh giá thể hiện năng lực thích ứng cao và khả năng giải quyết vấn đề bài bản.",
    strengths: [
      {
        dimensionId: "adaptability",
        title: "Khả năng thích ứng vượt trội",
        description: "Bạn luôn cởi mở trước những thay đổi công nghệ và chủ động tái cấu trúc tư duy.",
      },
    ],
    growthAreas: [
      {
        dimensionId: "ai_literacy",
        title: "Tối ưu hóa quy trình prompt nâng cao",
        description: "Cần rèn luyện thêm kỹ thuật xây dựng chuỗi suy luận phức tạp (Chain-of-Thought).",
      },
    ],
    actionPlan: [
      {
        step: 1,
        timeframe: "Tuần 1 - 2",
        title: "Thực hành Prompt Engineering có cấu trúc",
        description: "Áp dụng khung cấu trúc vai trò, bối cảnh và tiêu chí đánh giá vào công việc hàng ngày.",
      },
    ],
    disclaimer: "Báo cáo hỗ trợ định hướng cá nhân, không có giá trị chẩn đoán lâm sàng.",
  };

  it("passes validation for a well-formed report payload", () => {
    const result = validateGeneratedReportPayload(validPayload);
    expect(result.isValid).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("fails if summary is too short or empty", () => {
    const invalid = { ...validPayload, summary: "" };
    const result = validateGeneratedReportPayload(invalid);
    expect(result.isValid).toBe(false);
  });

  it("fails if strengths or growthAreas are missing", () => {
    const invalid = { ...validPayload, strengths: [] };
    const result = validateGeneratedReportPayload(invalid);
    expect(result.isValid).toBe(false);
  });

  it("fails if action plan has invalid step ordering or missing timeframe", () => {
    const invalid = {
      ...validPayload,
      actionPlan: [{ step: -1, timeframe: "", title: "test", description: "test" }],
    };
    const result = validateGeneratedReportPayload(invalid);
    expect(result.isValid).toBe(false);
  });
});

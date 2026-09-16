import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultPageContent } from "./ResultPageContent";
import { AssessmentScore } from "@/src/domain/assessment/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockScore: AssessmentScore = {
  assessmentId: "asmt-ai-career-readiness-v1",
  assessmentVersion: 1,
  completeness: 1,
  dimensions: [
    { dimensionId: "analytical_thinking", rawScore: 12, normalizedScore: 80, evidenceQuestionIds: ["q1", "q2", "q5"] },
    { dimensionId: "problem_solving", rawScore: 10, normalizedScore: 65, evidenceQuestionIds: ["q3", "q4", "q5"] },
    { dimensionId: "ai_literacy", rawScore: 11, normalizedScore: 70, evidenceQuestionIds: ["q6", "q7", "q8"] },
    { dimensionId: "adaptability", rawScore: 13, normalizedScore: 85, evidenceQuestionIds: ["q9", "q10"] },
  ],
  scoringVersion: "1.0.0",
};

describe("Result Page & Deterministic Display", () => {
  it("renders numerical scores and qualitative band labels for all dimensions", () => {
    render(
      <ResultPageContent
        slug="ai-career-readiness"
        sessionId="sess-test-123"
        initialScore={mockScore}
      />
    );

    // Check heading
    expect(screen.getByText(/Hồ Sơ Năng Lực Nghề Nghiệp Kỷ Nguyên AI/i)).toBeInTheDocument();

    // Check dimensions
    expect(screen.getAllByText("Tư duy phân tích").length).toBeGreaterThan(0);
    expect(screen.getByText("80")).toBeInTheDocument();

    expect(screen.getAllByText("Giải quyết vấn đề").length).toBeGreaterThan(0);
    expect(screen.getByText("65")).toBeInTheDocument();

    expect(screen.getAllByText("Hiểu biết & ứng dụng AI").length).toBeGreaterThan(0);
    expect(screen.getByText("70")).toBeInTheDocument();

    expect(screen.getAllByText("Khả năng thích nghi").length).toBeGreaterThan(0);
    expect(screen.getByText("85")).toBeInTheDocument();

    // Check band labels
    expect(screen.getAllByText("Xuất sắc").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Vững vàng").length).toBeGreaterThanOrEqual(1);

    // Check accessible radar chart SVG
    const svgChart = screen.getByRole("img", {
      name: /Biểu đồ radar phân tích 4 nhóm năng lực/i,
    });
    expect(svgChart).toBeInTheDocument();

    // Check disclaimer
    expect(
      screen.getByText(/tham khảo định hướng phát triển cá nhân/i)
    ).toBeInTheDocument();

    // Check Full Report CTA button
    expect(screen.getByRole("button", { name: /Xem báo cáo đầy đủ/i })).toBeInTheDocument();
  });
});

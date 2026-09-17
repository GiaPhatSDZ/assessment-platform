import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParticipantDashboard } from "./ParticipantDashboard";
import { AssessmentSessionRecord } from "@/src/application/assessment-repository";

describe("ParticipantDashboard Component", () => {
  const mockUser = {
    id: "usr_999",
    email: "participant@example.com",
    displayName: "Nguyễn Văn A",
  };

  it("renders empty state when user has no completed assessments", () => {
    render(<ParticipantDashboard user={mockUser} sessions={[]} />);

    expect(screen.getByText(/Lịch Sử & Báo Cáo Đánh Giá/i)).toBeInTheDocument();
    expect(screen.getByText("participant@example.com")).toBeInTheDocument();
    expect(screen.getByText(/Bạn chưa có kết quả đánh giá nào/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Bắt đầu chẩn đoán kiến thức/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders list of completed assessments with scores and links", () => {
    const mockSessions: AssessmentSessionRecord[] = [
      {
        id: "session-123456",
        assessmentVersionId: "ai-career-readiness_v1",
        visitorOwnerHash: "dummyhash",
        userId: mockUser.id,
        status: "completed",
        startedAt: "2026-09-17T00:00:00.000Z",
        completedAt: "2026-09-17T00:05:00.000Z",
        answers: [],
        result: {
          assessmentId: "ai-career-readiness_v1",
          assessmentVersion: 1,
          completeness: 1,
          dimensions: [
            { dimensionId: "analytical_thinking", rawScore: 10, normalizedScore: 85, evidenceQuestionIds: [] },
            { dimensionId: "problem_solving", rawScore: 10, normalizedScore: 70, evidenceQuestionIds: [] },
            { dimensionId: "ai_literacy", rawScore: 10, normalizedScore: 60, evidenceQuestionIds: [] },
            { dimensionId: "adaptability", rawScore: 10, normalizedScore: 90, evidenceQuestionIds: [] },
          ],
          scoringVersion: "1.0.0",
        },
      },
    ];

    render(<ParticipantDashboard user={mockUser} sessions={mockSessions} />);

    expect(screen.getByText(/Đã hoàn thành • Mã phiên #123456/i)).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();

    const resultLink = screen.getByRole("link", { name: /Kết quả đồ thị/i });
    expect(resultLink).toHaveAttribute(
      "href",
      "/assessment/ai-career-readiness/result/session-123456"
    );

    const reportLink = screen.getByRole("link", { name: /Báo cáo chi tiết AI/i });
    expect(reportLink).toHaveAttribute("href", "/report/session-123456");
  });
});

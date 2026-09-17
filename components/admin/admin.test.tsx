import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminOverviewView } from "./AdminOverviewView";
import { AdminFunnelMetrics, AdminSessionInspectionRecord } from "@/src/application/assessment-repository";

describe("AdminOverviewView Component", () => {
  const mockMetrics: AdminFunnelMetrics = {
    totalStarts: 100,
    totalCompletions: 75,
    completionRate: 75.0,
    totalLeadRequests: 30,
    totalReportsGenerated: 25,
    leadConversionRate: 40.0,
    referralBreakdown: [
      { code: "DEMO123", starts: 40, completions: 32 },
      { code: "DIRECT", starts: 60, completions: 43 },
    ],
  };

  const mockSessions: AdminSessionInspectionRecord[] = [
    {
      id: "sess_admin_test_12345678",
      assessmentVersionId: "ai-career-readiness_v1",
      status: "completed",
      referralCode: "DEMO123",
      startedAt: "2026-09-17T00:00:00.000Z",
      completedAt: "2026-09-17T00:06:00.000Z",
      dimensionScores: [
        { dimensionId: "analytical_thinking", normalizedScore: 80 },
        { dimensionId: "problem_solving", normalizedScore: 75 },
        { dimensionId: "ai_literacy", normalizedScore: 90 },
        { dimensionId: "adaptability", normalizedScore: 85 },
      ],
    },
  ];

  it("renders funnel metrics accurately from database calculations", () => {
    render(
      <AdminOverviewView
        adminEmail="admin@example.com"
        metrics={mockMetrics}
        sessions={mockSessions}
      />
    );

    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument(); // totalStarts
    expect(screen.getByText("75")).toBeInTheDocument(); // totalCompletions
    expect(screen.getByText("75%")).toBeInTheDocument(); // completionRate
    expect(screen.getByText("30")).toBeInTheDocument(); // totalLeadRequests
    expect(screen.getByText("25")).toBeInTheDocument(); // totalReportsGenerated
    expect(screen.getByText("40%")).toBeInTheDocument(); // leadConversionRate
  });

  it("renders referral breakdown and session inspector table", () => {
    render(
      <AdminOverviewView
        adminEmail="admin@example.com"
        metrics={mockMetrics}
        sessions={mockSessions}
      />
    );

    expect(screen.getAllByText("DEMO123").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Trực tiếp (Direct)")).toBeInTheDocument();

    // Session inspector checks
    expect(screen.getByText("#12345678")).toBeInTheDocument();
    expect(screen.getByText("80 / 75 / 90 / 85")).toBeInTheDocument();
  });
});

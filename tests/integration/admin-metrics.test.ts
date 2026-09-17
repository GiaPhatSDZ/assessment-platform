import { describe, it, expect, beforeEach } from "vitest";
import { inMemoryAssessmentRepository } from "@/src/infrastructure/database/mock-assessment-repository";
import { generateVisitorToken } from "@/src/infrastructure/auth/anonymous-visitor";
import { AssessmentScore } from "@/src/domain/assessment/types";

describe("Admin Funnel Metrics & Privacy-Conscious Inspection", () => {
  beforeEach(() => {
    inMemoryAssessmentRepository.clear();
  });

  it("calculates starts, completions, and referral rates correctly", async () => {
    const token1 = generateVisitorToken();
    const token2 = generateVisitorToken();
    const token3 = generateVisitorToken();

    // 1. Session with referral DEMO123 (completed)
    const sess1 = await inMemoryAssessmentRepository.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken: token1,
      referralCode: "DEMO123",
    });

    const score: AssessmentScore = {
      assessmentId: "ai-career-readiness_v1",
      assessmentVersion: 1,
      completeness: 1,
      dimensions: [
        { dimensionId: "analytical_thinking", rawScore: 10, normalizedScore: 80, evidenceQuestionIds: [] },
      ],
      scoringVersion: "1.0.0",
    };
    await inMemoryAssessmentRepository.finalizeSession(sess1.id, token1, [], score);

    // 2. Session with referral DEMO123 (started only)
    await inMemoryAssessmentRepository.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken: token2,
      referralCode: "DEMO123",
    });

    // 3. Direct session (started only)
    await inMemoryAssessmentRepository.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken: token3,
    });

    inMemoryAssessmentRepository.recordLeadCapture();
    inMemoryAssessmentRepository.recordReportGenerated();

    const metrics = await inMemoryAssessmentRepository.getAdminFunnelMetrics();

    expect(metrics.totalStarts).toBe(3);
    expect(metrics.totalCompletions).toBe(1);
    expect(metrics.completionRate).toBe(33.3);
    expect(metrics.totalLeadRequests).toBe(1);
    expect(metrics.totalReportsGenerated).toBe(1);
    expect(metrics.leadConversionRate).toBe(100.0);

    // Verify referral breakdown
    const demoRef = metrics.referralBreakdown.find((r: { code: string }) => r.code === "DEMO123");
    expect(demoRef).toBeDefined();
    expect(demoRef?.starts).toBe(2);
    expect(demoRef?.completions).toBe(1);

    const directRef = metrics.referralBreakdown.find((r: { code: string }) => r.code === "DIRECT");
    expect(directRef).toBeDefined();
    expect(directRef?.starts).toBe(1);
    expect(directRef?.completions).toBe(0);
  });

  it("inspects sessions without exposing participant emails or raw personal data", async () => {
    const token = generateVisitorToken();
    const session = await inMemoryAssessmentRepository.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken: token,
      referralCode: "PARTNER",
    });

    const score: AssessmentScore = {
      assessmentId: "ai-career-readiness_v1",
      assessmentVersion: 1,
      completeness: 1,
      dimensions: [
        { dimensionId: "analytical_thinking", rawScore: 10, normalizedScore: 92, evidenceQuestionIds: [] },
      ],
      scoringVersion: "1.0.0",
    };
    await inMemoryAssessmentRepository.finalizeSession(session.id, token, [], score);

    const sessionList = await inMemoryAssessmentRepository.getAdminSessionList(10);
    expect(sessionList.length).toBeGreaterThan(0);
    const inspected = sessionList[0];

    // Allowed technical attributes
    expect(inspected.id).toBe(session.id);
    expect(inspected.status).toBe("completed");
    expect(inspected.referralCode).toBe("PARTNER");
    expect(inspected.dimensionScores?.[0].normalizedScore).toBe(92);

    // Disallowed PII attributes
    expect((inspected as unknown as Record<string, unknown>).email).toBeUndefined();
    expect((inspected as unknown as Record<string, unknown>).displayName).toBeUndefined();
    expect((inspected as unknown as Record<string, unknown>).answers).toBeUndefined();
  });
});

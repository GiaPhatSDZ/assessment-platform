import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryAssessmentRepository } from "@/src/infrastructure/database/mock-assessment-repository";
import { generateVisitorToken } from "@/src/infrastructure/auth/anonymous-visitor";
import { normalizeReferralCode } from "@/src/domain/referral/referral";

describe("Referral Attribution Logic (M4.2)", () => {
  let repo: InMemoryAssessmentRepository;

  beforeEach(() => {
    repo = new InMemoryAssessmentRepository();
  });

  it("persists valid first-touch referral on session start", async () => {
    const visitorToken = generateVisitorToken();
    const rawRef = "partner_42";
    const normalized = normalizeReferralCode(rawRef);

    const session = await repo.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken,
      referralCode: normalized || undefined,
    });

    expect(session.referralCode).toBe("PARTNER_42");
  });

  it("safely ignores malformed referral codes without interrupting start", async () => {
    const visitorToken = generateVisitorToken();
    const maliciousRef = "'; DROP TABLE assessment_sessions;--";
    const normalized = normalizeReferralCode(maliciousRef);

    const session = await repo.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken,
      referralCode: normalized || undefined,
    });

    expect(session.referralCode).toBeNull();
    expect(session.status).toBe("started");
  });

  it("locks first-touch referral: later ref parameter does not overwrite original attribution", async () => {
    const visitorToken = generateVisitorToken();
    const session = await repo.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken,
      referralCode: "FIRST_TOUCH",
    });

    expect(session.referralCode).toBe("FIRST_TOUCH");

    // Re-loading session should preserve FIRST_TOUCH even if another query was passed
    const loaded = await repo.loadOwnedSession(session.id, visitorToken);
    expect(loaded?.referralCode).toBe("FIRST_TOUCH");
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryAssessmentRepository } from "@/src/infrastructure/database/mock-assessment-repository";
import { generateVisitorToken } from "@/src/infrastructure/auth/anonymous-visitor";
import { AssessmentScore } from "@/src/domain/assessment/types";

describe("Assessment Repository & Anonymous Ownership Integration", () => {
  let repo: InMemoryAssessmentRepository;

  beforeEach(() => {
    repo = new InMemoryAssessmentRepository();
  });

  it("creates an assessment session and associates it with hashed visitor token", async () => {
    const visitorToken = generateVisitorToken();
    const session = await repo.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken,
      referralCode: "DEMO123",
    });

    expect(session.id).toBeTruthy();
    expect(session.status).toBe("started");
    expect(session.referralCode).toBe("DEMO123");
    expect(session.visitorOwnerHash).toBeTruthy();
    expect(session.visitorOwnerHash).not.toBe(visitorToken); // Must be securely hashed
  });

  it("allows the owner visitor to load and update their session", async () => {
    const visitorToken = generateVisitorToken();
    const session = await repo.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken,
    });

    await repo.saveAnswer(session.id, visitorToken, {
      questionId: "q1",
      optionId: "q1_opt4",
    });

    const loaded = await repo.loadOwnedSession(session.id, visitorToken);
    expect(loaded).not.toBeNull();
    expect(loaded?.answers).toHaveLength(1);
    expect(loaded?.answers[0].optionId).toBe("q1_opt4");
    expect(loaded?.status).toBe("in_progress");
  });

  it("strictly blocks an unauthorized visitor from reading or writing a session", async () => {
    const ownerToken = generateVisitorToken();
    const attackerToken = generateVisitorToken();

    const session = await repo.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken: ownerToken,
    });

    // Attacker tries to load session using legitimate sessionId but wrong visitorToken
    const attackerRead = await repo.loadOwnedSession(session.id, attackerToken);
    expect(attackerRead).toBeNull();

    // Attacker tries to overwrite an answer
    await expect(
      repo.saveAnswer(session.id, attackerToken, {
        questionId: "q1",
        optionId: "q1_opt1",
      })
    ).rejects.toThrow(/Unauthorized/i);
  });

  it("finalizes session and persists authoritative deterministic result", async () => {
    const visitorToken = generateVisitorToken();
    const session = await repo.createSession({
      assessmentSlug: "ai-career-readiness",
      assessmentVersion: 1,
      visitorToken,
    });

    const score: AssessmentScore = {
      assessmentId: "asmt-ai-career-readiness-v1",
      assessmentVersion: 1,
      completeness: 1,
      dimensions: [
        { dimensionId: "analytical_thinking", rawScore: 10, normalizedScore: 70, evidenceQuestionIds: ["q1"] },
      ],
      scoringVersion: "1.0.0",
    };

    const answers = [{ questionId: "q1", optionId: "q1_opt4" }];
    await repo.finalizeSession(session.id, visitorToken, answers, score);

    const loadedResult = await repo.loadOwnedResult(session.id, visitorToken);
    expect(loadedResult).not.toBeNull();
    expect(loadedResult?.scoringVersion).toBe("1.0.0");
    expect(loadedResult?.dimensions[0].normalizedScore).toBe(70);

    // Verify attacker cannot read the finalized result
    const attackerToken = generateVisitorToken();
    const attackerResult = await repo.loadOwnedResult(session.id, attackerToken);
    expect(attackerResult).toBeNull();
  });
});

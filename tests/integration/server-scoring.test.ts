import { describe, it, expect } from "vitest";
import { POST as submitRoute } from "@/app/api/assessment/submit/route";
import { NextRequest } from "next/server";
import { aiCareerReadinessAssessmentV1 } from "@/assessments/ai-career-readiness-v1";

describe("Server Scoring Authority (M3.6)", () => {
  it("computes authoritative score regardless of what client attempts to submit", async () => {
    // Valid answers for all 10 questions (selecting option 4)
    const answers = aiCareerReadinessAssessmentV1.questions.map((q) => ({
      questionId: q.id,
      optionId: q.options[3].id, // value 4
    }));

    const req = new NextRequest("http://localhost:3000/api/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess-server-test-1",
        slug: "ai-career-readiness",
        answers,
        // Attacker injects a fake score trying to spoof 100%
        tamperedScore: { analytical_thinking: 100 },
      }),
    });

    const res = await submitRoute(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.score).toBeDefined();

    // The score must be recomputed by the server's pure scoring engine
    expect(json.score.scoringVersion).toBe("1.0.0");
    for (const dim of json.score.dimensions) {
      // Option 4 on a 1..5 scale produces 75% normalized score
      expect(dim.normalizedScore).toBe(75);
    }
  });

  it("rejects submission if required answers are incomplete", async () => {
    // Only answer 5 questions
    const answers = aiCareerReadinessAssessmentV1.questions.slice(0, 5).map((q) => ({
      questionId: q.id,
      optionId: q.options[0].id,
    }));

    const req = new NextRequest("http://localhost:3000/api/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess-server-test-incomplete",
        slug: "ai-career-readiness",
        answers,
      }),
    });

    const res = await submitRoute(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/Missing required answer/i);
  });

  it("rejects submission with unknown question ID", async () => {
    const answers = [
      { questionId: "q-fake-hacker", optionId: "opt-1" },
    ];

    const req = new NextRequest("http://localhost:3000/api/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess-server-test-fake",
        slug: "ai-career-readiness",
        answers,
      }),
    });

    const res = await submitRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/unknown question/i);
  });
});

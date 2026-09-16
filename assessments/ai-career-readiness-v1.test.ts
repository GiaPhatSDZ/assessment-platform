import { describe, it, expect } from "vitest";
import { aiCareerReadinessAssessmentV1 } from "./ai-career-readiness-v1";
import { validateAssessmentDefinition } from "../src/domain/assessment/schema";
import { scoreAssessment } from "../src/domain/assessment/scoring";
import { Answer } from "../src/domain/assessment/types";

describe("Vietnamese AI Career Readiness Reference Assessment V1", () => {
  it("passes full Zod schema validation", () => {
    const validation = validateAssessmentDefinition(aiCareerReadinessAssessmentV1);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toBeUndefined();
  });

  it("contains exactly 4 required dimensions", () => {
    expect(aiCareerReadinessAssessmentV1.dimensions).toHaveLength(4);
    const dimIds = aiCareerReadinessAssessmentV1.dimensions.map((d) => d.id);
    expect(dimIds).toEqual([
      "analytical_thinking",
      "problem_solving",
      "ai_literacy",
      "adaptability",
    ]);
  });

  it("contains exactly 10 questions with 5 options each", () => {
    expect(aiCareerReadinessAssessmentV1.questions).toHaveLength(10);
    for (const q of aiCareerReadinessAssessmentV1.questions) {
      expect(q.options).toHaveLength(5);
      const values = q.options.map((o) => o.value);
      expect(values).toEqual([1, 2, 3, 4, 5]);
      expect(q.required).toBe(true);
      expect(q.scoring.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("includes clear non-clinical Vietnamese disclaimer", () => {
    expect(aiCareerReadinessAssessmentV1.disclaimer).toBeTruthy();
    expect(aiCareerReadinessAssessmentV1.disclaimer).toContain("tham khảo");
  });

  it("produces 0% across all dimensions for all minimum answers (option 1)", () => {
    const minAnswers: Answer[] = aiCareerReadinessAssessmentV1.questions.map((q) => ({
      questionId: q.id,
      optionId: q.options[0].id,
    }));

    const score = scoreAssessment(aiCareerReadinessAssessmentV1, minAnswers);
    expect(score.completeness).toBe(1);
    for (const dim of score.dimensions) {
      expect(dim.normalizedScore).toBe(0);
    }
  });

  it("produces 100% across all dimensions for all maximum answers (option 5)", () => {
    const maxAnswers: Answer[] = aiCareerReadinessAssessmentV1.questions.map((q) => ({
      questionId: q.id,
      optionId: q.options[4].id,
    }));

    const score = scoreAssessment(aiCareerReadinessAssessmentV1, maxAnswers);
    expect(score.completeness).toBe(1);
    for (const dim of score.dimensions) {
      expect(dim.normalizedScore).toBe(100);
    }
  });
});

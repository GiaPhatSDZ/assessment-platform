import { describe, it, expect } from "vitest";
import { scoreAssessment, SCORING_ENGINE_VERSION } from "./scoring";
import { AssessmentDefinition, Answer } from "./types";
import { AssessmentScoringError } from "./errors";

const testDefinition: AssessmentDefinition = {
  id: "asmt-scoring-test",
  slug: "scoring-test",
  title: "Scoring Test Assessment",
  locale: "vi",
  version: 1,
  status: "published",
  description: "Assessment definition for scoring tests",
  disclaimer: "Non-clinical test disclaimer",
  dimensions: [
    { id: "dim-analytical", label: "Tư duy phân tích", shortDescription: "Analytical", order: 1 },
    { id: "dim-ai", label: "Hiểu biết AI", shortDescription: "AI Literacy", order: 2 },
  ],
  questions: [
    {
      id: "q-1",
      type: "single_choice_scale",
      prompt: "Q1",
      required: true,
      options: [
        { id: "opt-1-1", label: "1", value: 1 },
        { id: "opt-1-2", label: "2", value: 2 },
        { id: "opt-1-3", label: "3", value: 3 },
        { id: "opt-1-4", label: "4", value: 4 },
        { id: "opt-1-5", label: "5", value: 5 },
      ],
      scoring: [{ dimensionId: "dim-analytical", weight: 1 }],
    },
    {
      id: "q-2",
      type: "single_choice_scale",
      prompt: "Q2",
      required: true,
      options: [
        { id: "opt-2-1", label: "1", value: 1 },
        { id: "opt-2-2", label: "2", value: 2 },
        { id: "opt-2-3", label: "3", value: 3 },
        { id: "opt-2-4", label: "4", value: 4 },
        { id: "opt-2-5", label: "5", value: 5 },
      ],
      scoring: [{ dimensionId: "dim-analytical", weight: 2 }],
    },
    {
      id: "q-3",
      type: "single_choice_scale",
      prompt: "Q3",
      required: true,
      options: [
        { id: "opt-3-1", label: "1", value: 1 },
        { id: "opt-3-2", label: "2", value: 2 },
        { id: "opt-3-3", label: "3", value: 3 },
        { id: "opt-3-4", label: "4", value: 4 },
        { id: "opt-3-5", label: "5", value: 5 },
      ],
      scoring: [{ dimensionId: "dim-ai", weight: 1, reverse: true }],
    },
  ],
  resultBands: [
    { id: "b1", minScore: 0, maxScore: 49, label: "Low", description: "Low" },
    { id: "b2", minScore: 50, maxScore: 100, label: "High", description: "High" },
  ],
};

describe("Deterministic Scoring Engine", () => {
  it("normalizes minimum answers to 0", () => {
    // For q-1: opt-1-1 (1, weight 1) => 1
    // For q-2: opt-2-1 (1, weight 2) => 2. Total analytical raw = 3. Min possible = 1*1 + 1*2 = 3 => 0%
    // For q-3 (reverse): opt-3-5 (5, reverse: 6-5=1, weight 1) => 1. Min possible = 1 => 0%
    const answers: Answer[] = [
      { questionId: "q-1", optionId: "opt-1-1" },
      { questionId: "q-2", optionId: "opt-2-1" },
      { questionId: "q-3", optionId: "opt-3-5" },
    ];

    const score = scoreAssessment(testDefinition, answers);
    expect(score.completeness).toBe(1);
    expect(score.scoringVersion).toBe(SCORING_ENGINE_VERSION);

    const analytical = score.dimensions.find((d) => d.dimensionId === "dim-analytical");
    expect(analytical?.rawScore).toBe(3);
    expect(analytical?.normalizedScore).toBe(0);

    const ai = score.dimensions.find((d) => d.dimensionId === "dim-ai");
    expect(ai?.rawScore).toBe(1);
    expect(ai?.normalizedScore).toBe(0);
  });

  it("normalizes maximum answers to 100", () => {
    // For q-1: opt-1-5 (5, weight 1) => 5
    // For q-2: opt-2-5 (5, weight 2) => 10. Total analytical raw = 15. Max possible = 15 => 100%
    // For q-3 (reverse): opt-3-1 (1, reverse: 6-1=5, weight 1) => 5. Max possible = 5 => 100%
    const answers: Answer[] = [
      { questionId: "q-1", optionId: "opt-1-5" },
      { questionId: "q-2", optionId: "opt-2-5" },
      { questionId: "q-3", optionId: "opt-3-1" },
    ];

    const score = scoreAssessment(testDefinition, answers);
    const analytical = score.dimensions.find((d) => d.dimensionId === "dim-analytical");
    expect(analytical?.rawScore).toBe(15);
    expect(analytical?.normalizedScore).toBe(100);

    const ai = score.dimensions.find((d) => d.dimensionId === "dim-ai");
    expect(ai?.rawScore).toBe(5);
    expect(ai?.normalizedScore).toBe(100);
  });

  it("calculates mixed answers correctly", () => {
    // q-1: opt-1-3 (3, wt 1) => 3
    // q-2: opt-2-3 (3, wt 2) => 6. Total analytical raw = 9. Range: [3, 15] => (9-3)/(15-3) = 6/12 = 50%
    // q-3: opt-3-3 (3, rev: 6-3=3, wt 1) => 3. Range: [1, 5] => (3-1)/(5-1) = 2/4 = 50%
    const answers: Answer[] = [
      { questionId: "q-1", optionId: "opt-1-3" },
      { questionId: "q-2", optionId: "opt-2-3" },
      { questionId: "q-3", optionId: "opt-3-3" },
    ];

    const score = scoreAssessment(testDefinition, answers);
    const analytical = score.dimensions.find((d) => d.dimensionId === "dim-analytical");
    expect(analytical?.normalizedScore).toBe(50);
    expect(analytical?.evidenceQuestionIds).toEqual(["q-1", "q-2"]);

    const ai = score.dimensions.find((d) => d.dimensionId === "dim-ai");
    expect(ai?.normalizedScore).toBe(50);
    expect(ai?.evidenceQuestionIds).toEqual(["q-3"]);
  });

  it("handles weighted contributions accurately", () => {
    // q-1: opt-1-1 (1, wt 1) => 1
    // q-2: opt-2-5 (5, wt 2) => 10. Total raw = 11. Range [3, 15] => (11-3)/12 = 8/12 = 66.67 => rounded to 67
    const answers: Answer[] = [
      { questionId: "q-1", optionId: "opt-1-1" },
      { questionId: "q-2", optionId: "opt-2-5" },
      { questionId: "q-3", optionId: "opt-3-3" },
    ];

    const score = scoreAssessment(testDefinition, answers);
    const analytical = score.dimensions.find((d) => d.dimensionId === "dim-analytical");
    expect(analytical?.normalizedScore).toBe(67);
  });

  it("rejects unknown question ID", () => {
    const answers: Answer[] = [
      { questionId: "q-unknown", optionId: "opt-1-1" },
      { questionId: "q-2", optionId: "opt-2-1" },
      { questionId: "q-3", optionId: "opt-3-1" },
    ];
    expect(() => scoreAssessment(testDefinition, answers)).toThrowError(AssessmentScoringError);
  });

  it("rejects unknown option ID", () => {
    const answers: Answer[] = [
      { questionId: "q-1", optionId: "opt-unknown" },
      { questionId: "q-2", optionId: "opt-2-1" },
      { questionId: "q-3", optionId: "opt-3-1" },
    ];
    expect(() => scoreAssessment(testDefinition, answers)).toThrowError(AssessmentScoringError);
  });

  it("rejects duplicate answers for the same question", () => {
    const answers: Answer[] = [
      { questionId: "q-1", optionId: "opt-1-1" },
      { questionId: "q-1", optionId: "opt-1-2" },
      { questionId: "q-2", optionId: "opt-2-1" },
      { questionId: "q-3", optionId: "opt-3-1" },
    ];
    expect(() => scoreAssessment(testDefinition, answers)).toThrowError(AssessmentScoringError);
  });

  it("rejects missing required answers", () => {
    const answers: Answer[] = [
      { questionId: "q-1", optionId: "opt-1-1" },
      { questionId: "q-2", optionId: "opt-2-1" },
      // q-3 missing
    ];
    expect(() => scoreAssessment(testDefinition, answers)).toThrowError(AssessmentScoringError);
  });

  it("is deterministic: returns identical canonical JSON for identical input", () => {
    const answers: Answer[] = [
      { questionId: "q-1", optionId: "opt-1-4" },
      { questionId: "q-2", optionId: "opt-2-2" },
      { questionId: "q-3", optionId: "opt-3-4" },
    ];

    const run1 = scoreAssessment(testDefinition, answers);
    const run2 = scoreAssessment(testDefinition, answers);

    expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
    expect(run1).toMatchInlineSnapshot(`
      {
        "assessmentId": "asmt-scoring-test",
        "assessmentVersion": 1,
        "completeness": 1,
        "dimensions": [
          {
            "dimensionId": "dim-analytical",
            "evidenceQuestionIds": [
              "q-1",
              "q-2",
            ],
            "normalizedScore": 42,
            "rawScore": 8,
          },
          {
            "dimensionId": "dim-ai",
            "evidenceQuestionIds": [
              "q-3",
            ],
            "normalizedScore": 25,
            "rawScore": 2,
          },
        ],
        "scoringVersion": "1.0.0",
      }
    `);
  });
});

import { describe, it, expect } from "vitest";
import { validateAssessmentDefinition } from "./schema";
import { AssessmentDefinition } from "./types";

const baseValidDefinition: AssessmentDefinition = {
  id: "asmt-001",
  slug: "test-assessment",
  title: "Test Assessment",
  locale: "vi",
  version: 1,
  status: "published",
  description: "Valid assessment description",
  disclaimer: "Valid non-clinical disclaimer",
  dimensions: [
    {
      id: "dim-1",
      label: "Dimension One",
      shortDescription: "First dimension",
      order: 1,
    },
    {
      id: "dim-2",
      label: "Dimension Two",
      shortDescription: "Second dimension",
      order: 2,
    },
  ],
  questions: [
    {
      id: "q-1",
      type: "single_choice_scale",
      prompt: "Question 1 prompt?",
      required: true,
      options: [
        { id: "opt-1", label: "Option 1", value: 1 },
        { id: "opt-2", label: "Option 2", value: 2 },
      ],
      scoring: [{ dimensionId: "dim-1", weight: 1 }],
    },
    {
      id: "q-2",
      type: "single_choice_scale",
      prompt: "Question 2 prompt?",
      required: true,
      options: [
        { id: "opt-3", label: "Option 3", value: 1 },
        { id: "opt-4", label: "Option 4", value: 2 },
      ],
      scoring: [{ dimensionId: "dim-2", weight: 2 }],
    },
  ],
  resultBands: [
    {
      id: "band-1",
      minScore: 0,
      maxScore: 49,
      label: "Basic",
      description: "Basic level",
    },
    {
      id: "band-2",
      minScore: 50,
      maxScore: 100,
      label: "Advanced",
      description: "Advanced level",
    },
  ],
};

describe("Assessment Schema Validation", () => {
  it("passes for a valid assessment definition", () => {
    const result = validateAssessmentDefinition(baseValidDefinition);
    expect(result.isValid).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("fails when duplicate dimension IDs exist", () => {
    const invalid: AssessmentDefinition = {
      ...baseValidDefinition,
      dimensions: [
        { id: "dim-dup", label: "Dim A", shortDescription: "", order: 1 },
        { id: "dim-dup", label: "Dim B", shortDescription: "", order: 2 },
      ],
    };
    const result = validateAssessmentDefinition(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("Duplicate dimension ID")])
    );
  });

  it("fails when duplicate question IDs exist", () => {
    const invalid: AssessmentDefinition = {
      ...baseValidDefinition,
      questions: [
        { ...baseValidDefinition.questions[0], id: "q-dup" },
        { ...baseValidDefinition.questions[1], id: "q-dup" },
      ],
    };
    const result = validateAssessmentDefinition(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("Duplicate question ID")])
    );
  });

  it("fails when duplicate option IDs exist within a question", () => {
    const invalid: AssessmentDefinition = {
      ...baseValidDefinition,
      questions: [
        {
          ...baseValidDefinition.questions[0],
          options: [
            { id: "opt-dup", label: "Option A", value: 1 },
            { id: "opt-dup", label: "Option B", value: 2 },
          ],
        },
      ],
    };
    const result = validateAssessmentDefinition(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("Duplicate option ID")])
    );
  });

  it("fails when scoring refers to an unknown dimension ID", () => {
    const invalid: AssessmentDefinition = {
      ...baseValidDefinition,
      questions: [
        {
          ...baseValidDefinition.questions[0],
          scoring: [{ dimensionId: "dim-unknown", weight: 1 }],
        },
      ],
    };
    const result = validateAssessmentDefinition(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("Unknown dimension ID")])
    );
  });

  it("fails when scoring weight is non-positive or non-finite", () => {
    const invalid: AssessmentDefinition = {
      ...baseValidDefinition,
      questions: [
        {
          ...baseValidDefinition.questions[0],
          scoring: [{ dimensionId: "dim-1", weight: 0 }],
        },
      ],
    };
    const result = validateAssessmentDefinition(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("Weight must be greater than zero")])
    );
  });

  it("fails when required fields are missing", () => {
    const invalid = {
      ...baseValidDefinition,
      title: "",
    };
    const result = validateAssessmentDefinition(invalid);
    expect(result.isValid).toBe(false);
  });
});

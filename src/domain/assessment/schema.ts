import { z } from "zod";
import { AssessmentDefinition } from "./types";

export const DimensionDefinitionSchema = z.object({
  id: z.string().min(1, "Dimension ID is required"),
  label: z.string().min(1, "Dimension label is required"),
  shortDescription: z.string(),
  order: z.number().int().min(0),
});

export const QuestionOptionSchema = z.object({
  id: z.string().min(1, "Option ID is required"),
  label: z.string().min(1, "Option label is required"),
  value: z.number().finite("Option value must be finite"),
});

export const ScoringContributionSchema = z.object({
  dimensionId: z.string().min(1, "Dimension ID is required"),
  weight: z.number().positive("Weight must be greater than zero").finite(),
  reverse: z.boolean().optional(),
});

export const QuestionDefinitionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  type: z.literal("single_choice_scale"),
  prompt: z.string().min(1, "Question prompt is required"),
  required: z.boolean(),
  options: z.array(QuestionOptionSchema).min(2, "At least 2 options required"),
  scoring: z.array(ScoringContributionSchema).min(1, "At least 1 scoring contribution required"),
});

export const ResultBandDefinitionSchema = z.object({
  id: z.string().min(1, "Band ID is required"),
  minScore: z.number().min(0).max(100),
  maxScore: z.number().min(0).max(100),
  label: z.string().min(1, "Band label is required"),
  description: z.string(),
});

export const AssessmentDefinitionSchema = z
  .object({
    id: z.string().min(1, "Assessment ID is required"),
    slug: z.string().min(1, "Slug is required"),
    title: z.string().min(1, "Title is required"),
    locale: z.enum(["vi", "en"]),
    version: z.number().int().positive("Version must be positive integer"),
    status: z.enum(["draft", "published", "archived"]),
    description: z.string().min(1, "Description is required"),
    disclaimer: z.string().min(1, "Disclaimer is required"),
    dimensions: z.array(DimensionDefinitionSchema).min(1, "At least 1 dimension required"),
    questions: z.array(QuestionDefinitionSchema).min(1, "At least 1 question required"),
    resultBands: z.array(ResultBandDefinitionSchema).min(1, "At least 1 result band required"),
  })
  .superRefine((val, ctx) => {
    // 1. Check duplicate dimension IDs
    const dimensionIds = new Set<string>();
    for (let i = 0; i < val.dimensions.length; i++) {
      const dim = val.dimensions[i];
      if (dimensionIds.has(dim.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate dimension ID: ${dim.id}`,
          path: ["dimensions", i, "id"],
        });
      }
      dimensionIds.add(dim.id);
    }

    // 2. Check duplicate question IDs and option IDs
    const questionIds = new Set<string>();
    for (let qIdx = 0; qIdx < val.questions.length; qIdx++) {
      const q = val.questions[qIdx];
      if (questionIds.has(q.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate question ID: ${q.id}`,
          path: ["questions", qIdx, "id"],
        });
      }
      questionIds.add(q.id);

      const optionIds = new Set<string>();
      for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
        const opt = q.options[oIdx];
        if (optionIds.has(opt.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate option ID: ${opt.id} in question ${q.id}`,
            path: ["questions", qIdx, "options", oIdx, "id"],
          });
        }
        optionIds.add(opt.id);
      }

      // 3. Check scoring references existing dimensions
      for (let sIdx = 0; sIdx < q.scoring.length; sIdx++) {
        const scoreContrib = q.scoring[sIdx];
        if (!dimensionIds.has(scoreContrib.dimensionId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Unknown dimension ID referenced in scoring: ${scoreContrib.dimensionId}`,
            path: ["questions", qIdx, "scoring", sIdx, "dimensionId"],
          });
        }
      }
    }
  });

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: string[];
}

export function validateAssessmentDefinition(
  input: unknown
): ValidationResult<AssessmentDefinition> {
  const parseResult = AssessmentDefinitionSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      isValid: false,
      errors: parseResult.error.issues.map((issue) => issue.message),
    };
  }
  return {
    isValid: true,
    data: parseResult.data as AssessmentDefinition,
  };
}

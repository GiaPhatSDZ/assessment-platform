import { z } from "zod";
import { GeneratedReportPayload } from "./types";

export const ReportInsightSchema = z.object({
  dimensionId: z.string().min(1, "Dimension ID required"),
  title: z.string().min(2, "Insight title too short"),
  description: z.string().min(5, "Insight description too short"),
});

export const ReportActionItemSchema = z.object({
  step: z.number().int().positive("Step must be a positive integer"),
  timeframe: z.string().min(2, "Timeframe required"),
  title: z.string().min(2, "Action title too short"),
  description: z.string().min(5, "Action description too short"),
});

export const GeneratedReportPayloadSchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  strengths: z.array(ReportInsightSchema).min(1, "At least 1 strength required"),
  growthAreas: z.array(ReportInsightSchema).min(1, "At least 1 growth area required"),
  actionPlan: z.array(ReportActionItemSchema).min(1, "At least 1 action item required"),
  disclaimer: z.string().min(5, "Disclaimer is required"),
});

export function validateGeneratedReportPayload(input: unknown): {
  isValid: boolean;
  data?: GeneratedReportPayload;
  errors?: string[];
} {
  const result = GeneratedReportPayloadSchema.safeParse(input);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((i) => i.message),
    };
  }
  return {
    isValid: true,
    data: result.data as GeneratedReportPayload,
  };
}

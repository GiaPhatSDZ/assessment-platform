import { GeneratedReportPayload } from "../domain/report/types";
import { DimensionInterpretation } from "../domain/assessment/types";

export interface ReportGenerationInput {
  assessmentTitle: string;
  assessmentSlug: string;
  assessmentVersion: number;
  displayName?: string;
  dimensions: DimensionInterpretation[];
  locale: "vi";
  disclaimer: string;
}

export interface ReportGenerator {
  generate(input: ReportGenerationInput): Promise<GeneratedReportPayload>;
  isAvailable(): boolean;
  getProviderName(): string;
}

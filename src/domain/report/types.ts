export interface ReportInsight {
  dimensionId: string;
  title: string;
  description: string;
}

export interface ReportActionItem {
  step: number;
  timeframe: string; // e.g. "Tuần 1 - 2", "Tuần 3 - 4"
  title: string;
  description: string;
}

export interface GeneratedReportPayload {
  summary: string;
  strengths: ReportInsight[];
  growthAreas: ReportInsight[];
  actionPlan: ReportActionItem[];
  disclaimer: string;
}

export type ReportGenerationStatus = "pending" | "completed" | "failed" | "unavailable";

export interface GeneratedReportRecord {
  sessionId: string;
  provider: string;
  model?: string | null;
  promptVersion: string;
  status: ReportGenerationStatus;
  reportPayload?: GeneratedReportPayload | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

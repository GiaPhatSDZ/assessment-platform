export type AnalyticsEventName =
  | "landing_view"
  | "assessment_started"
  | "question_answered"
  | "assessment_completed"
  | "result_viewed"
  | "report_requested"
  | "report_generated"
  | "signup_completed";

export interface AnalyticsEventPayload {
  sessionId?: string;
  assessmentSlug?: string;
  assessmentVersion?: number;
  referralCode?: string;
  questionNumber?: number;
  totalQuestions?: number;
  dimensionCounts?: number;
  leadConsentedMarketing?: boolean;
  metadata?: Record<string, string | number | boolean>;
}

export interface AnalyticsTracker {
  track(eventName: AnalyticsEventName, payload?: AnalyticsEventPayload): Promise<void>;
}

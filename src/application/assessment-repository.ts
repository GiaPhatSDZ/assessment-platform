import { Answer, AssessmentScore } from "../domain/assessment/types";

export interface AssessmentSessionRecord {
  id: string;
  assessmentVersionId: string;
  visitorOwnerHash: string;
  userId?: string | null;
  referralCode?: string | null;
  status: "started" | "in_progress" | "completed" | "abandoned";
  answers: Answer[];
  startedAt: string;
  completedAt?: string | null;
  result?: AssessmentScore | null;
}

export interface CreateSessionParams {
  sessionId?: string;
  assessmentSlug: string;
  assessmentVersion: number;
  visitorToken: string;
  referralCode?: string;
}

export interface AdminFunnelMetrics {
  totalStarts: number;
  totalCompletions: number;
  completionRate: number; // 0..100
  totalLeadRequests: number;
  totalReportsGenerated: number;
  leadConversionRate: number; // 0..100
  referralBreakdown: Array<{
    code: string;
    starts: number;
    completions: number;
  }>;
}

export interface AdminSessionInspectionRecord {
  id: string;
  assessmentVersionId: string;
  status: string;
  referralCode?: string | null;
  startedAt: string;
  completedAt?: string | null;
  dimensionScores?: Array<{
    dimensionId: string;
    normalizedScore: number;
  }>;
}

export interface AssessmentRepository {
  createSession(params: CreateSessionParams): Promise<AssessmentSessionRecord>;
  loadOwnedSession(sessionId: string, visitorToken: string): Promise<AssessmentSessionRecord | null>;
  saveAnswer(sessionId: string, visitorToken: string, answer: Answer): Promise<void>;
  finalizeSession(
    sessionId: string,
    visitorToken: string,
    answers: Answer[],
    score: AssessmentScore
  ): Promise<AssessmentScore>;
  loadOwnedResult(sessionId: string, visitorToken: string): Promise<AssessmentScore | null>;
  claimSessionsForUser(userId: string, visitorToken: string): Promise<number>;
  getUserSessions(userId: string): Promise<AssessmentSessionRecord[]>;
  upsertUserProfile(profile: {
    id: string;
    email: string;
    displayName?: string | null;
  }): Promise<void>;
  getAdminFunnelMetrics(): Promise<AdminFunnelMetrics>;
  getAdminSessionList(limit?: number): Promise<AdminSessionInspectionRecord[]>;
}

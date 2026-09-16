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
}

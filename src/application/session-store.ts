import { Answer, AssessmentScore } from "../domain/assessment/types";

export interface LocalSessionDraft {
  sessionId: string;
  assessmentId: string;
  assessmentSlug: string;
  assessmentVersion: number;
  currentStepIndex: number;
  answers: Answer[];
  referralCode?: string;
  finalizedScore?: AssessmentScore;
  startedAt: string;
  updatedAt: string;
}

export interface SessionStore {
  getDraft(slug: string): LocalSessionDraft | null;
  saveDraft(draft: LocalSessionDraft): void;
  updateAnswer(slug: string, answer: Answer, currentStepIndex: number): LocalSessionDraft;
  setFinalizedScore(slug: string, score: AssessmentScore): LocalSessionDraft;
  clearDraft(slug: string): void;
}

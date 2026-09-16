import {
  AssessmentRepository,
  AssessmentSessionRecord,
  CreateSessionParams,
} from "../../application/assessment-repository";
import { Answer, AssessmentScore } from "../../domain/assessment/types";
import { hashVisitorToken, verifyVisitorTokenOwnership } from "../auth/anonymous-visitor";

export class InMemoryAssessmentRepository implements AssessmentRepository {
  private sessions = new Map<string, AssessmentSessionRecord>();
  private results = new Map<string, AssessmentScore>();

  async createSession(params: CreateSessionParams): Promise<AssessmentSessionRecord> {
    const id = params.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const visitorOwnerHash = hashVisitorToken(params.visitorToken);

    const record: AssessmentSessionRecord = {
      id,
      assessmentVersionId: `${params.assessmentSlug}_v${params.assessmentVersion}`,
      visitorOwnerHash,
      referralCode: params.referralCode || null,
      status: "started",
      answers: [],
      startedAt: new Date().toISOString(),
    };

    this.sessions.set(id, record);
    return record;
  }

  async loadOwnedSession(sessionId: string, visitorToken: string): Promise<AssessmentSessionRecord | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (!verifyVisitorTokenOwnership(visitorToken, session.visitorOwnerHash)) {
      return null; // Unauthorized
    }

    const result = this.results.get(sessionId) || null;
    return { ...session, result };
  }

  async saveAnswer(sessionId: string, visitorToken: string, answer: Answer): Promise<void> {
    const session = await this.loadOwnedSession(sessionId, visitorToken);
    if (!session) {
      throw new Error(`Unauthorized or session not found: ${sessionId}`);
    }

    const existingIdx = session.answers.findIndex((a) => a.questionId === answer.questionId);
    if (existingIdx >= 0) {
      session.answers[existingIdx] = answer;
    } else {
      session.answers.push(answer);
    }
    session.status = "in_progress";
    this.sessions.set(sessionId, session);
  }

  async finalizeSession(
    sessionId: string,
    visitorToken: string,
    answers: Answer[],
    score: AssessmentScore
  ): Promise<AssessmentScore> {
    const session = await this.loadOwnedSession(sessionId, visitorToken);
    if (!session) {
      throw new Error(`Unauthorized or session not found: ${sessionId}`);
    }

    session.answers = answers;
    session.status = "completed";
    session.completedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);
    this.results.set(sessionId, score);

    return score;
  }

  async loadOwnedResult(sessionId: string, visitorToken: string): Promise<AssessmentScore | null> {
    const session = await this.loadOwnedSession(sessionId, visitorToken);
    if (!session) return null;
    return this.results.get(sessionId) || null;
  }

  // Helper for test cleanup
  clear(): void {
    this.sessions.clear();
    this.results.clear();
  }
}

export const inMemoryAssessmentRepository = new InMemoryAssessmentRepository();

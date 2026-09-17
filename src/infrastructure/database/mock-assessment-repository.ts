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

  private userProfiles = new Map<string, { id: string; email: string; displayName?: string | null }>();

  async upsertUserProfile(profile: {
    id: string;
    email: string;
    displayName?: string | null;
  }): Promise<void> {
    this.userProfiles.set(profile.id, profile);
  }

  async claimSessionsForUser(userId: string, visitorToken: string): Promise<number> {
    let claimedCount = 0;
    for (const [_, session] of this.sessions.entries()) {
      if (verifyVisitorTokenOwnership(visitorToken, session.visitorOwnerHash)) {
        if (!session.userId) {
          session.userId = userId;
          claimedCount++;
        }
      }
    }
    return claimedCount;
  }

  async getUserSessions(userId: string): Promise<AssessmentSessionRecord[]> {
    const userSessions: AssessmentSessionRecord[] = [];
    for (const [_, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        const result = this.results.get(session.id) || null;
        userSessions.push({ ...session, result });
      }
    }
    // Sort completed sessions first, newest first
    return userSessions.sort((a, b) => {
      const timeA = new Date(a.completedAt || a.startedAt).getTime();
      const timeB = new Date(b.completedAt || b.startedAt).getTime();
      return timeB - timeA;
    });
  }

  // Helper for test cleanup
  clear(): void {
    this.sessions.clear();
    this.results.clear();
    this.userProfiles.clear();
  }
}

export const inMemoryAssessmentRepository = new InMemoryAssessmentRepository();

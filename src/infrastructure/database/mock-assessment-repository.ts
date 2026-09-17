import {
  AssessmentRepository,
  AssessmentSessionRecord,
  CreateSessionParams,
  AdminFunnelMetrics,
  AdminSessionInspectionRecord,
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

  private leadCount = 0;
  private reportCount = 0;

  recordLeadCapture(): void {
    this.leadCount++;
  }

  recordReportGenerated(): void {
    this.reportCount++;
  }

  async getAdminFunnelMetrics(): Promise<AdminFunnelMetrics> {
    const all = Array.from(this.sessions.values());
    const totalStarts = all.length;
    const completions = all.filter((s) => s.status === "completed");
    const totalCompletions = completions.length;
    const completionRate =
      totalStarts > 0 ? Math.round((totalCompletions / totalStarts) * 1000) / 10 : 0;

    const referralMap = new Map<string, { starts: number; completions: number }>();
    for (const s of all) {
      const code = s.referralCode || "DIRECT";
      const existing = referralMap.get(code) || { starts: 0, completions: 0 };
      existing.starts += 1;
      if (s.status === "completed") {
        existing.completions += 1;
      }
      referralMap.set(code, existing);
    }

    const referralBreakdown = Array.from(referralMap.entries()).map(([code, counts]) => ({
      code,
      starts: counts.starts,
      completions: counts.completions,
    }));

    return {
      totalStarts,
      totalCompletions,
      completionRate,
      totalLeadRequests: this.leadCount,
      totalReportsGenerated: this.reportCount,
      leadConversionRate:
        totalCompletions > 0 ? Math.round((this.leadCount / totalCompletions) * 1000) / 10 : 0,
      referralBreakdown,
    };
  }

  async getAdminSessionList(limit: number = 50): Promise<AdminSessionInspectionRecord[]> {
    const all = Array.from(this.sessions.values());
    all.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return all.slice(0, limit).map((s) => {
      const score = this.results.get(s.id);
      return {
        id: s.id,
        assessmentVersionId: s.assessmentVersionId,
        status: s.status,
        referralCode: s.referralCode,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        dimensionScores: score?.dimensions.map((d) => ({
          dimensionId: d.dimensionId,
          normalizedScore: d.normalizedScore,
        })),
      };
    });
  }

  // Helper for test cleanup
  clear(): void {
    this.sessions.clear();
    this.results.clear();
    this.userProfiles.clear();
    this.leadCount = 0;
    this.reportCount = 0;
  }
}

export const inMemoryAssessmentRepository = new InMemoryAssessmentRepository();

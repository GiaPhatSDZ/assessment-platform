import {
  AssessmentRepository,
  AssessmentSessionRecord,
  CreateSessionParams,
  AdminFunnelMetrics,
  AdminSessionInspectionRecord,
} from "../../application/assessment-repository";
import { Answer, AssessmentScore } from "../../domain/assessment/types";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "./supabase-server";
import { inMemoryAssessmentRepository } from "./mock-assessment-repository";
import { hashVisitorToken, verifyVisitorTokenOwnership } from "../auth/anonymous-visitor";

export class SupabaseAssessmentRepository implements AssessmentRepository {
  private getClient() {
    return getSupabaseAdminClient();
  }

  async createSession(params: CreateSessionParams): Promise<AssessmentSessionRecord> {
    if (!isSupabaseAdminConfigured()) {
      return inMemoryAssessmentRepository.createSession(params);
    }

    const supabase = this.getClient()!;
    const id = params.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const visitorOwnerHash = hashVisitorToken(params.visitorToken);
    const versionId = `${params.assessmentSlug}_v${params.assessmentVersion}`;

    const { data, error } = await supabase
      .from("assessment_sessions")
      .insert({
        id,
        assessment_version_id: versionId,
        visitor_owner_hash: visitorOwnerHash,
        referral_code: params.referralCode || null,
        status: "started",
      })
      .select()
      .single();

    if (error || !data) {
      // Graceful fallback to memory on database connection issue
      return inMemoryAssessmentRepository.createSession(params);
    }

    return {
      id: data.id,
      assessmentVersionId: data.assessment_version_id,
      visitorOwnerHash: data.visitor_owner_hash,
      userId: data.user_id,
      referralCode: data.referral_code,
      status: data.status,
      answers: [],
      startedAt: data.started_at,
    };
  }

  async loadOwnedSession(sessionId: string, visitorToken: string): Promise<AssessmentSessionRecord | null> {
    if (!isSupabaseAdminConfigured()) {
      return inMemoryAssessmentRepository.loadOwnedSession(sessionId, visitorToken);
    }

    const supabase = this.getClient()!;
    const { data: session, error } = await supabase
      .from("assessment_sessions")
      .select(`
        *,
        assessment_answers (question_id, option_id, answered_at),
        assessment_results (completeness, dimensions, scoring_version)
      `)
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return inMemoryAssessmentRepository.loadOwnedSession(sessionId, visitorToken);
    }

    if (!verifyVisitorTokenOwnership(visitorToken, session.visitor_owner_hash)) {
      return null;
    }

    const answers: Answer[] = ((session.assessment_answers as Array<{
      question_id: string;
      option_id: string;
      answered_at: string;
    }>) || []).map((a) => ({
      questionId: a.question_id,
      optionId: a.option_id,
      answeredAt: a.answered_at,
    }));

    let result: AssessmentScore | null = null;
    if (session.assessment_results && session.assessment_results.length > 0) {
      const r = session.assessment_results[0];
      result = {
        assessmentId: session.assessment_version_id,
        assessmentVersion: 1,
        completeness: Number(r.completeness),
        dimensions: r.dimensions,
        scoringVersion: r.scoring_version,
      };
    }

    return {
      id: session.id,
      assessmentVersionId: session.assessment_version_id,
      visitorOwnerHash: session.visitor_owner_hash,
      userId: session.user_id,
      referralCode: session.referral_code,
      status: session.status,
      answers,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      result,
    };
  }

  async saveAnswer(sessionId: string, visitorToken: string, answer: Answer): Promise<void> {
    if (!isSupabaseAdminConfigured()) {
      return inMemoryAssessmentRepository.saveAnswer(sessionId, visitorToken, answer);
    }

    const session = await this.loadOwnedSession(sessionId, visitorToken);
    if (!session) {
      throw new Error(`Unauthorized or session not found: ${sessionId}`);
    }

    const supabase = this.getClient()!;
    const { error } = await supabase.from("assessment_answers").upsert(
      {
        session_id: sessionId,
        question_id: answer.questionId,
        option_id: answer.optionId,
        answered_at: new Date().toISOString(),
      },
      { onConflict: "session_id,question_id" }
    );

    if (error) {
      // Fallback
      await inMemoryAssessmentRepository.saveAnswer(sessionId, visitorToken, answer);
    }
  }

  async finalizeSession(
    sessionId: string,
    visitorToken: string,
    answers: Answer[],
    score: AssessmentScore
  ): Promise<AssessmentScore> {
    if (!isSupabaseAdminConfigured()) {
      return inMemoryAssessmentRepository.finalizeSession(sessionId, visitorToken, answers, score);
    }

    const session = await this.loadOwnedSession(sessionId, visitorToken);
    if (!session) {
      throw new Error(`Unauthorized or session not found: ${sessionId}`);
    }

    const supabase = this.getClient()!;

    // 1. Update session status
    await supabase
      .from("assessment_sessions")
      .update({
        status: "completed",
        completedAt: new Date().toISOString(),
      })
      .eq("id", sessionId);

    // 2. Persist deterministic result
    await supabase.from("assessment_results").upsert(
      {
        session_id: sessionId,
        assessment_id: score.assessmentId,
        assessment_version: score.assessmentVersion,
        completeness: score.completeness,
        dimensions: score.dimensions,
        scoring_version: score.scoringVersion,
      },
      { onConflict: "session_id" }
    );

    return inMemoryAssessmentRepository.finalizeSession(sessionId, visitorToken, answers, score);
  }

  async loadOwnedResult(sessionId: string, visitorToken: string): Promise<AssessmentScore | null> {
    const session = await this.loadOwnedSession(sessionId, visitorToken);
    if (!session) return null;
    return session.result || inMemoryAssessmentRepository.loadOwnedResult(sessionId, visitorToken);
  }

  async claimSessionsForUser(userId: string, visitorToken: string): Promise<number> {
    const memoryClaimed = await inMemoryAssessmentRepository.claimSessionsForUser(userId, visitorToken);

    if (!isSupabaseAdminConfigured()) {
      return memoryClaimed;
    }

    const supabase = this.getClient()!;
    const visitorOwnerHash = hashVisitorToken(visitorToken);

    const { data, error } = await supabase
      .from("assessment_sessions")
      .update({ user_id: userId })
      .eq("visitor_owner_hash", visitorOwnerHash)
      .is("user_id", null)
      .select("id");

    if (error || !data) {
      return memoryClaimed;
    }

    return Math.max(data.length, memoryClaimed);
  }

  async getUserSessions(userId: string): Promise<AssessmentSessionRecord[]> {
    if (!isSupabaseAdminConfigured()) {
      return inMemoryAssessmentRepository.getUserSessions(userId);
    }

    const supabase = this.getClient()!;
    const { data, error } = await supabase
      .from("assessment_sessions")
      .select(`
        *,
        assessment_answers (question_id, option_id, answered_at),
        assessment_results (completeness, dimensions, scoring_version)
      `)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error || !data) {
      return inMemoryAssessmentRepository.getUserSessions(userId);
    }

    return data.map((session) => {
      const answers: Answer[] = ((session.assessment_answers as Array<{
        question_id: string;
        option_id: string;
        answered_at: string;
      }>) || []).map((a) => ({
        questionId: a.question_id,
        optionId: a.option_id,
        answeredAt: a.answered_at,
      }));

      let result: AssessmentScore | null = null;
      if (session.assessment_results && session.assessment_results.length > 0) {
        const r = session.assessment_results[0];
        result = {
          assessmentId: session.assessment_version_id,
          assessmentVersion: 1,
          completeness: Number(r.completeness),
          dimensions: r.dimensions,
          scoringVersion: r.scoring_version,
        };
      }

      return {
        id: session.id,
        assessmentVersionId: session.assessment_version_id,
        visitorOwnerHash: session.visitor_owner_hash,
        userId: session.user_id,
        referralCode: session.referral_code,
        status: session.status,
        answers,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        result,
      };
    });
  }

  async upsertUserProfile(profile: {
    id: string;
    email: string;
    displayName?: string | null;
  }): Promise<void> {
    await inMemoryAssessmentRepository.upsertUserProfile(profile);

    if (!isSupabaseAdminConfigured()) {
      return;
    }

    const supabase = this.getClient()!;
    await supabase.from("user_profiles").upsert(
      {
        id: profile.id,
        email: profile.email,
        display_name: profile.displayName || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  }

  async getAdminFunnelMetrics(): Promise<AdminFunnelMetrics> {
    if (!isSupabaseAdminConfigured()) {
      return inMemoryAssessmentRepository.getAdminFunnelMetrics();
    }

    const supabase = this.getClient()!;

    try {
      const { count: totalStarts } = await supabase
        .from("assessment_sessions")
        .select("*", { count: "exact", head: true });

      const { count: totalCompletions } = await supabase
        .from("assessment_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { count: totalLeadRequests } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      const { count: totalReportsGenerated } = await supabase
        .from("generated_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const starts = totalStarts || 0;
      const completions = totalCompletions || 0;
      const leads = totalLeadRequests || 0;
      const reports = totalReportsGenerated || 0;

      const completionRate = starts > 0 ? Math.round((completions / starts) * 1000) / 10 : 0;
      const leadConversionRate =
        completions > 0 ? Math.round((leads / completions) * 1000) / 10 : 0;

      const { data: referralSessions } = await supabase
        .from("assessment_sessions")
        .select("referral_code, status");

      const referralMap = new Map<string, { starts: number; completions: number }>();
      for (const s of (referralSessions as Array<{ referral_code: string | null; status: string }>) || []) {
        const code = s.referral_code || "DIRECT";
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
        totalStarts: starts,
        totalCompletions: completions,
        completionRate,
        totalLeadRequests: leads,
        totalReportsGenerated: reports,
        leadConversionRate,
        referralBreakdown,
      };
    } catch {
      return inMemoryAssessmentRepository.getAdminFunnelMetrics();
    }
  }

  async getAdminSessionList(limit: number = 50): Promise<AdminSessionInspectionRecord[]> {
    if (!isSupabaseAdminConfigured()) {
      return inMemoryAssessmentRepository.getAdminSessionList(limit);
    }

    const supabase = this.getClient()!;

    try {
      const { data, error } = await supabase
        .from("assessment_sessions")
        .select(`
          id,
          assessment_version_id,
          status,
          referral_code,
          started_at,
          completed_at,
          assessment_results (dimensions)
        `)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error || !data) {
        return inMemoryAssessmentRepository.getAdminSessionList(limit);
      }

      return data.map((session) => {
        let dimensionScores: Array<{ dimensionId: string; normalizedScore: number }> | undefined;
        if (session.assessment_results && session.assessment_results.length > 0) {
          const res = session.assessment_results[0] as {
            dimensions?: Array<{ dimensionId: string; normalizedScore: number }>;
          };
          dimensionScores = res.dimensions?.map((d) => ({
            dimensionId: d.dimensionId,
            normalizedScore: d.normalizedScore,
          }));
        }

        return {
          id: session.id,
          assessmentVersionId: session.assessment_version_id,
          status: session.status,
          referralCode: session.referral_code,
          startedAt: session.started_at,
          completedAt: session.completed_at,
          dimensionScores,
        };
      });
    } catch {
      return inMemoryAssessmentRepository.getAdminSessionList(limit);
    }
  }
}

export const assessmentRepository = new SupabaseAssessmentRepository();

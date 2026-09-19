import "server-only";

/**
 * AI School Learning Persistence V1 — Supabase Repository
 *
 * Implements Controller Audit Requirements:
 * - A5: In production, missing Supabase admin config throws PERSISTENCE_NOT_CONFIGURED.
 * - A6: Server-only module (`import "server-only"`).
 * - A7: knowledge_evidence and mastery_history are append-only.
 * - A8: Structured studentResponse payload only.
 * - A9: Full ownership chain verification on all writes.
 * - Fail-Loud Policy: Database errors throw DatabasePersistenceError; zero silent memory fallback.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { LearningPersistenceRepository } from "../../application/learning-persistence-repository";
import {
  LearnerProfile,
  GuardianRelationshipType,
  LearningSessionRecord,
  EvaluatedAttemptRecord,
  KnowledgeEvidenceRecord,
  KnowledgeNodeStateRecord,
  MasteryTransitionHistoryRecord,
  CreateLearnerParams,
  CreateSessionParams,
  SaveAttemptParams,
  AppendEvidenceParams,
  UpsertNodeStateParams,
  AppendMasteryTransitionParams,
  OwnershipContext,
  UnauthorizedLearnerAccessError,
  OwnershipChainMismatchError,
  DatabasePersistenceError,
  validateItemContentHash,
  validateEvidenceType,
  validateLearnerStageConstraints,
  validateStudentResponse,
  validateNodeStateConsistency,
  sessionKindToEvidenceType,
  sessionKindToMasteryReason,
  EvidenceSemanticMismatchError,
  MasterySemanticMismatchError,
} from "../../domain/learning-persistence/types";
import {
  AtomicDiagnosticGradingParams,
  AtomicDiagnosticGradingResult,
  AttemptAlreadyRecordedError,
  SessionClosedError,
  StateConflictRetryError,
} from "../../domain/diagnostic/types";
import { hashVisitorToken, verifyVisitorTokenOwnership } from "../auth/anonymous-visitor";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "./supabase-server";

export class SupabaseLearningPersistenceRepository implements LearningPersistenceRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    if (client) {
      this.client = client;
      return;
    }

    if (!isSupabaseAdminConfigured()) {
      if (process.env.NODE_ENV === "production") {
        throw new DatabasePersistenceError(
          "PERSISTENCE_NOT_CONFIGURED: Supabase admin credentials are not configured in production."
        );
      }
      throw new DatabasePersistenceError("Supabase admin credentials are not configured.");
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      throw new DatabasePersistenceError("Failed to initialize Supabase admin client.");
    }
    this.client = adminClient;
  }

  private async isOwner(learner: LearnerProfile, ownership: OwnershipContext): Promise<boolean> {
    if (ownership.visitorToken && verifyVisitorTokenOwnership(ownership.visitorToken, learner.visitorOwnerHash)) {
      return true;
    }
    if (ownership.userId) {
      const { data, error } = await this.client
        .from("guardian_learner_relationships")
        .select("learner_id")
        .eq("guardian_user_id", ownership.userId)
        .eq("learner_id", learner.id)
        .maybeSingle();

      if (error) {
        throw new DatabasePersistenceError(`Database error checking guardian relationship: ${error.message}`, error);
      }
      if (data) {
        return true;
      }
    }
    return false;
  }

  private async assertLearnerOwnership(learnerId: string, ownership: OwnershipContext): Promise<LearnerProfile> {
    const { data, error } = await this.client
      .from("learner_profiles")
      .select("*")
      .eq("id", learnerId)
      .maybeSingle();

    if (error) {
      throw new DatabasePersistenceError(`Database error loading learner '${learnerId}': ${error.message}`, error);
    }
    if (!data) {
      throw new UnauthorizedLearnerAccessError(`Learner '${learnerId}' not found.`);
    }

    const learner: LearnerProfile = {
      id: data.id,
      visitorOwnerHash: data.visitor_owner_hash,
      nickname: data.nickname,
      educationStage: data.education_stage,
      gradeLevel: data.grade_level,
      ageBand: data.age_band,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    const authorized = await this.isOwner(learner, ownership);
    if (!authorized) {
      throw new UnauthorizedLearnerAccessError(`Unauthorized access to learner '${learnerId}'.`);
    }
    return learner;
  }

  async createLearner(params: CreateLearnerParams, ownership: OwnershipContext): Promise<LearnerProfile> {
    if (!ownership.visitorToken) {
      throw new UnauthorizedLearnerAccessError("Anonymous learner profile creation requires visitorToken in OwnershipContext.");
    }
    validateLearnerStageConstraints(params.educationStage, params.gradeLevel, params.ageBand);

    const visitorOwnerHash = hashVisitorToken(ownership.visitorToken);
    const { data, error } = await this.client
      .from("learner_profiles")
      .insert({
        visitor_owner_hash: visitorOwnerHash,
        nickname: params.nickname?.trim() || null,
        education_stage: params.educationStage,
        grade_level: params.gradeLevel ?? null,
        age_band: params.ageBand ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new DatabasePersistenceError(`Database error creating learner: ${error.message}`, error);
    }

    return {
      id: data.id,
      visitorOwnerHash: data.visitor_owner_hash,
      nickname: data.nickname,
      educationStage: data.education_stage,
      gradeLevel: data.grade_level,
      ageBand: data.age_band,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async loadOwnedLearner(learnerId: string, ownership: OwnershipContext): Promise<LearnerProfile | null> {
    const { data, error } = await this.client
      .from("learner_profiles")
      .select("*")
      .eq("id", learnerId)
      .maybeSingle();

    if (error) {
      throw new DatabasePersistenceError(`Database error loading learner: ${error.message}`, error);
    }
    if (!data) return null;

    const learner: LearnerProfile = {
      id: data.id,
      visitorOwnerHash: data.visitor_owner_hash,
      nickname: data.nickname,
      educationStage: data.education_stage,
      gradeLevel: data.grade_level,
      ageBand: data.age_band,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    const isOwned = await this.isOwner(learner, ownership);
    if (!isOwned) return null;
    return learner;
  }

  async claimLearnerForGuardian(
    learnerId: string,
    guardianUserId: string,
    relationshipType: GuardianRelationshipType,
    ownership: OwnershipContext
  ): Promise<boolean> {
    const { data: learnerData, error: learnerError } = await this.client
      .from("learner_profiles")
      .select("*")
      .eq("id", learnerId)
      .maybeSingle();

    if (learnerError) {
      throw new DatabasePersistenceError(`Database error loading learner: ${learnerError.message}`, learnerError);
    }
    if (!learnerData) {
      throw new UnauthorizedLearnerAccessError(`Learner '${learnerId}' not found.`);
    }

    // P0-1: If identical relationship already exists, authenticated guardian may treat as idempotent success
    if (ownership.userId && ownership.userId === guardianUserId) {
      const { data: existingRel, error: relError } = await this.client
        .from("guardian_learner_relationships")
        .select("learner_id")
        .eq("guardian_user_id", guardianUserId)
        .eq("learner_id", learnerId)
        .maybeSingle();

      if (relError) {
        throw new DatabasePersistenceError(`Database error checking existing guardian relationship: ${relError.message}`, relError);
      }
      if (existingRel) {
        return true;
      }
    }

    // P0-1: Initial anonymous learner -> guardian binding MUST satisfy all 4 conditions:
    // 1. ownership.userId exists
    // 2. ownership.userId === guardianUserId
    // 3. ownership.visitorToken exists
    // 4. visitor token verifies against learner.visitor_owner_hash
    if (!ownership.userId || ownership.userId !== guardianUserId) {
      throw new UnauthorizedLearnerAccessError("Guardian claim requires authenticated userId matching guardianUserId.");
    }

    if (!ownership.visitorToken || !verifyVisitorTokenOwnership(ownership.visitorToken, learnerData.visitor_owner_hash)) {
      throw new UnauthorizedLearnerAccessError("Guardian claim requires verified current visitor ownership of the learner profile.");
    }

    const { error: insertError } = await this.client
      .from("guardian_learner_relationships")
      .upsert({
        learner_id: learnerId,
        guardian_user_id: guardianUserId,
        relationship_type: relationshipType,
      });

    if (insertError) {
      throw new DatabasePersistenceError(`Database error creating guardian relationship: ${insertError.message}`, insertError);
    }

    return true;
  }

  async createLearningSession(params: CreateSessionParams, ownership: OwnershipContext): Promise<LearningSessionRecord> {
    await this.assertLearnerOwnership(params.learnerId, ownership);

    const { data, error } = await this.client
      .from("learning_sessions")
      .insert({
        learner_id: params.learnerId,
        session_kind: params.sessionKind,
        subject_id: params.subjectId,
        topic_id: params.topicId ?? null,
        target_node_id: params.targetNodeId ?? null,
        status: "STARTED",
        rule_version: params.ruleVersion,
      })
      .select()
      .single();

    if (error) {
      throw new DatabasePersistenceError(`Database error creating learning session: ${error.message}`, error);
    }

    return {
      id: data.id,
      learnerId: data.learner_id,
      sessionKind: data.session_kind,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      targetNodeId: data.target_node_id,
      status: data.status,
      ruleVersion: data.rule_version,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async loadOwnedLearningSession(sessionId: string, ownership: OwnershipContext): Promise<LearningSessionRecord | null> {
    const { data, error } = await this.client
      .from("learning_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      throw new DatabasePersistenceError(`Database error loading session: ${error.message}`, error);
    }
    if (!data) return null;

    const ownedLearner = await this.loadOwnedLearner(data.learner_id, ownership);
    if (!ownedLearner) return null;

    return {
      id: data.id,
      learnerId: data.learner_id,
      sessionKind: data.session_kind,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      targetNodeId: data.target_node_id,
      status: data.status,
      ruleVersion: data.rule_version,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async saveEvaluatedAttempt(attempt: SaveAttemptParams, ownership: OwnershipContext): Promise<EvaluatedAttemptRecord> {
    await this.assertLearnerOwnership(attempt.learnerId, ownership);

    // A1 & A9: Verify session belongs to this learner
    const { data: sessionData, error: sessionError } = await this.client
      .from("learning_sessions")
      .select("learner_id")
      .eq("id", attempt.sessionId)
      .maybeSingle();

    if (sessionError) {
      throw new DatabasePersistenceError(`Database error verifying session: ${sessionError.message}`, sessionError);
    }
    if (!sessionData || sessionData.learner_id !== attempt.learnerId) {
      throw new OwnershipChainMismatchError(
        `Session '${attempt.sessionId}' does not belong to learner '${attempt.learnerId}'.`
      );
    }

    validateItemContentHash(attempt.itemContentHash);
    validateStudentResponse(attempt.studentResponse);

    const { data, error } = await this.client
      .from("learning_attempts")
      .insert({
        session_id: attempt.sessionId,
        learner_id: attempt.learnerId,
        item_id: attempt.itemId,
        item_version: attempt.itemVersion,
        item_content_hash: attempt.itemContentHash,
        primary_node_id: attempt.primaryNodeId,
        student_response: attempt.studentResponse,
        selected_option_id: attempt.selectedOptionId ?? null,
        is_correct: attempt.isCorrect,
        misconception_tags: attempt.misconceptionTags ?? [],
        grading_rule_version: attempt.gradingRuleVersion,
        attempted_at: attempt.attemptedAt || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new DatabasePersistenceError(`Database error saving evaluated attempt: ${error.message}`, error);
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      learnerId: data.learner_id,
      itemId: data.item_id,
      itemVersion: data.item_version,
      itemContentHash: data.item_content_hash,
      primaryNodeId: data.primary_node_id,
      studentResponse: data.student_response,
      selectedOptionId: data.selected_option_id,
      isCorrect: data.is_correct,
      misconceptionTags: data.misconception_tags,
      gradingRuleVersion: data.grading_rule_version,
      attemptedAt: data.attempted_at,
    };
  }

  async appendKnowledgeEvidence(evidence: AppendEvidenceParams, ownership: OwnershipContext): Promise<KnowledgeEvidenceRecord> {
    await this.assertLearnerOwnership(evidence.learnerId, ownership);

    // A1 & A9: Verify session belongs to this learner
    const { data: sessionData, error: sessionError } = await this.client
      .from("learning_sessions")
      .select("learner_id, session_kind")
      .eq("id", evidence.sessionId)
      .maybeSingle();

    if (sessionError) {
      throw new DatabasePersistenceError(`Database error verifying session: ${sessionError.message}`, sessionError);
    }
    if (!sessionData || sessionData.learner_id !== evidence.learnerId) {
      throw new OwnershipChainMismatchError(
        `Session '${evidence.sessionId}' does not belong to learner '${evidence.learnerId}'.`
      );
    }

    // A1 & A9: Verify attempt belongs to this session and learner
    const { data: attemptData, error: attemptError } = await this.client
      .from("learning_attempts")
      .select("session_id, learner_id, primary_node_id, is_correct")
      .eq("id", evidence.attemptId)
      .maybeSingle();

    if (attemptError) {
      throw new DatabasePersistenceError(`Database error verifying attempt: ${attemptError.message}`, attemptError);
    }
    if (
      !attemptData ||
      attemptData.learner_id !== evidence.learnerId ||
      attemptData.session_id !== evidence.sessionId
    ) {
      throw new OwnershipChainMismatchError(
        `Attempt '${evidence.attemptId}' does not match session '${evidence.sessionId}' and learner '${evidence.learnerId}'.`
      );
    }

    validateEvidenceType(evidence.evidenceType);

    // P1-1: Semantic integrity checks
    if (evidence.nodeId !== attemptData.primary_node_id) {
      throw new EvidenceSemanticMismatchError(
        `evidence.nodeId '${evidence.nodeId}' does not match attempt.primaryNodeId '${attemptData.primary_node_id}'.`
      );
    }
    const expectedOutcome = attemptData.is_correct ? "CORRECT" : "INCORRECT";
    if (evidence.outcome !== expectedOutcome) {
      throw new EvidenceSemanticMismatchError(
        `evidence.outcome '${evidence.outcome}' does not match attempt.isCorrect (${attemptData.is_correct} -> '${expectedOutcome}').`
      );
    }
    const expectedEvidenceType = sessionKindToEvidenceType(sessionData.session_kind);
    if (evidence.evidenceType !== expectedEvidenceType) {
      throw new EvidenceSemanticMismatchError(
        `evidence.evidenceType '${evidence.evidenceType}' does not match session.sessionKind '${sessionData.session_kind}' -> '${expectedEvidenceType}'.`
      );
    }

    const { data, error } = await this.client
      .from("knowledge_evidence")
      .insert({
        learner_id: evidence.learnerId,
        session_id: evidence.sessionId,
        attempt_id: evidence.attemptId,
        node_id: evidence.nodeId,
        evidence_type: evidence.evidenceType,
        outcome: evidence.outcome,
        rule_version: evidence.ruleVersion,
        observed_at: evidence.observedAt || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new DatabasePersistenceError(`Database error appending knowledge evidence: ${error.message}`, error);
    }

    return {
      id: data.id,
      learnerId: data.learner_id,
      sessionId: data.session_id,
      attemptId: data.attempt_id,
      nodeId: data.node_id,
      evidenceType: data.evidence_type,
      outcome: data.outcome,
      observedAt: data.observed_at,
      ruleVersion: data.rule_version,
    };
  }

  async upsertNodeState(state: UpsertNodeStateParams, ownership: OwnershipContext): Promise<KnowledgeNodeStateRecord> {
    await this.assertLearnerOwnership(state.learnerId, ownership);

    // P1-3: Strengthen NOT_ASSESSED consistency
    validateNodeStateConsistency(state.state, state.attemptsCount, state.correctCount, state.lastAssessedAt);

    const { data, error } = await this.client
      .from("knowledge_node_states")
      .upsert({
        learner_id: state.learnerId,
        node_id: state.nodeId,
        state: state.state,
        confidence: state.confidence,
        attempts_count: state.attemptsCount,
        correct_count: state.correctCount,
        misconception_tags: state.misconceptionTags ?? [],
        last_assessed_at: state.state === "NOT_ASSESSED" ? null : (state.lastAssessedAt || new Date().toISOString()),
        rule_version: state.ruleVersion,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new DatabasePersistenceError(`Database error upserting node state: ${error.message}`, error);
    }

    return {
      learnerId: data.learner_id,
      nodeId: data.node_id,
      state: data.state,
      confidence: data.confidence,
      attemptsCount: data.attempts_count,
      correctCount: data.correct_count,
      misconceptionTags: data.misconception_tags,
      lastAssessedAt: data.last_assessed_at,
      ruleVersion: data.rule_version,
      updatedAt: data.updated_at,
    };
  }

  async appendMasteryTransition(
    transition: AppendMasteryTransitionParams,
    ownership: OwnershipContext
  ): Promise<MasteryTransitionHistoryRecord> {
    await this.assertLearnerOwnership(transition.learnerId, ownership);

    // A1 & A9: Verify trigger session belongs to this learner
    const { data: sessionData, error: sessionError } = await this.client
      .from("learning_sessions")
      .select("learner_id, session_kind")
      .eq("id", transition.triggerSessionId)
      .maybeSingle();

    if (sessionError) {
      throw new DatabasePersistenceError(`Database error verifying session: ${sessionError.message}`, sessionError);
    }
    if (!sessionData || sessionData.learner_id !== transition.learnerId) {
      throw new OwnershipChainMismatchError(
        `Trigger session '${transition.triggerSessionId}' does not belong to learner '${transition.learnerId}'.`
      );
    }

    // P1-4: Semantic integrity check between trigger session kind and reasonCode
    const expectedReasonCode = sessionKindToMasteryReason(sessionData.session_kind);
    if (transition.reasonCode !== expectedReasonCode) {
      throw new MasterySemanticMismatchError(
        `transition.reasonCode '${transition.reasonCode}' does not match trigger session.sessionKind '${sessionData.session_kind}' -> '${expectedReasonCode}'.`
      );
    }

    const { data, error } = await this.client
      .from("mastery_history")
      .insert({
        learner_id: transition.learnerId,
        node_id: transition.nodeId,
        trigger_session_id: transition.triggerSessionId,
        previous_state: transition.previousState,
        previous_confidence: transition.previousConfidence,
        new_state: transition.newState,
        new_confidence: transition.newConfidence,
        reason_code: transition.reasonCode,
        rule_version: transition.ruleVersion,
        occurred_at: transition.occurredAt || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new DatabasePersistenceError(`Database error appending mastery transition: ${error.message}`, error);
    }

    return {
      id: data.id,
      learnerId: data.learner_id,
      nodeId: data.node_id,
      triggerSessionId: data.trigger_session_id,
      previousState: data.previous_state,
      previousConfidence: data.previous_confidence,
      newState: data.new_state,
      newConfidence: data.new_confidence,
      reasonCode: data.reason_code,
      ruleVersion: data.rule_version,
      occurredAt: data.occurred_at,
    };
  }

  async completeLearningSession(sessionId: string, ownership: OwnershipContext): Promise<LearningSessionRecord> {
    const { data: sessionData, error: sessionError } = await this.client
      .from("learning_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError) {
      throw new DatabasePersistenceError(`Database error loading session: ${sessionError.message}`, sessionError);
    }
    if (!sessionData) {
      throw new Error(`Session '${sessionId}' not found.`);
    }

    await this.assertLearnerOwnership(sessionData.learner_id, ownership);

    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from("learning_sessions")
      .update({
        status: "COMPLETED",
        completed_at: now,
        updated_at: now,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      throw new DatabasePersistenceError(`Database error completing session: ${error.message}`, error);
    }

    return {
      id: data.id,
      learnerId: data.learner_id,
      sessionKind: data.session_kind,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      targetNodeId: data.target_node_id,
      status: data.status,
      ruleVersion: data.rule_version,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getCurrentNodeStates(learnerId: string, ownership: OwnershipContext): Promise<Record<string, KnowledgeNodeStateRecord>> {
    await this.assertLearnerOwnership(learnerId, ownership);

    const { data, error } = await this.client
      .from("knowledge_node_states")
      .select("*")
      .eq("learner_id", learnerId);

    if (error) {
      throw new DatabasePersistenceError(`Database error loading node states: ${error.message}`, error);
    }

    const result: Record<string, KnowledgeNodeStateRecord> = {};
    for (const item of data || []) {
      result[item.node_id] = {
        learnerId: item.learner_id,
        nodeId: item.node_id,
        state: item.state,
        confidence: item.confidence,
        attemptsCount: item.attempts_count,
        correctCount: item.correct_count,
        misconceptionTags: item.misconception_tags,
        lastAssessedAt: item.last_assessed_at,
        ruleVersion: item.rule_version,
        updatedAt: item.updated_at,
      };
    }
    return result;
  }

  async getMasteryHistory(learnerId: string, ownership: OwnershipContext): Promise<MasteryTransitionHistoryRecord[]> {
    await this.assertLearnerOwnership(learnerId, ownership);

    const { data, error } = await this.client
      .from("mastery_history")
      .select("*")
      .eq("learner_id", learnerId)
      .order("occurred_at", { ascending: true });

    if (error) {
      throw new DatabasePersistenceError(`Database error loading mastery history: ${error.message}`, error);
    }

    return (data || []).map((item) => ({
      id: item.id,
      learnerId: item.learner_id,
      nodeId: item.node_id,
      triggerSessionId: item.trigger_session_id,
      previousState: item.previous_state,
      previousConfidence: item.previous_confidence,
      newState: item.new_state,
      newConfidence: item.new_confidence,
      reasonCode: item.reason_code,
      ruleVersion: item.rule_version,
      occurredAt: item.occurred_at,
    }));
  }

  async getLearnerNodeAttempts(
    learnerId: string,
    nodeId: string,
    ownership: OwnershipContext
  ): Promise<EvaluatedAttemptRecord[]> {
    await this.assertLearnerOwnership(learnerId, ownership);

    const { data, error } = await this.client
      .from("learning_attempts")
      .select("*")
      .eq("learner_id", learnerId)
      .eq("primary_node_id", nodeId)
      .order("attempted_at", { ascending: true });

    if (error) {
      throw new DatabasePersistenceError(`Database error loading learner node attempts: ${error.message}`, error);
    }

    return (data || []).map((item) => ({
      id: item.id,
      sessionId: item.session_id,
      learnerId: item.learner_id,
      itemId: item.item_id,
      itemVersion: item.item_version,
      itemContentHash: item.item_content_hash,
      primaryNodeId: item.primary_node_id,
      studentResponse: item.student_response,
      selectedOptionId: item.selected_option_id,
      isCorrect: item.is_correct,
      misconceptionTags: item.misconception_tags,
      gradingRuleVersion: item.grading_rule_version,
      attemptedAt: item.attempted_at,
    }));
  }

  async recordAtomicDiagnosticSubmission(
    params: AtomicDiagnosticGradingParams,
    ownership: OwnershipContext
  ): Promise<AtomicDiagnosticGradingResult> {
    await this.assertLearnerOwnership(params.learnerId, ownership);

    validateNodeStateConsistency(
      params.nodeState,
      params.attemptsCount,
      params.correctCount,
      params.lastAssessedAt
    );

    const { data, error } = await this.client.rpc("record_atomic_diagnostic_grading", {
      p_learner_id: params.learnerId,
      p_session_id: params.sessionId,
      p_item_id: params.itemId,
      p_item_version: params.itemVersion,
      p_item_content_hash: params.itemContentHash,
      p_primary_node_id: params.primaryNodeId,
      p_student_response: params.studentResponse,
      p_selected_option_id: params.selectedOptionId ?? null,
      p_is_correct: params.isCorrect,
      p_misconception_tags: params.misconceptionTags ?? [],
      p_grading_rule_version: params.gradingRuleVersion,
      p_evidence_rule_version: params.evidenceRuleVersion,
      p_node_state: params.nodeState,
      p_node_confidence: params.nodeConfidence,
      p_attempts_count: params.attemptsCount,
      p_correct_count: params.correctCount,
      p_last_assessed_at: params.nodeState === "NOT_ASSESSED" ? null : (params.lastAssessedAt || new Date().toISOString()),
      p_node_rule_version: params.nodeRuleVersion,
      p_expected_node_updated_at: params.expectedNodeUpdatedAt ?? null,
      p_has_mastery_transition: params.hasMasteryTransition,
      p_previous_state: params.previousState ?? null,
      p_previous_confidence: params.previousConfidence ?? null,
      p_new_state: params.newState ?? null,
      p_new_confidence: params.newConfidence ?? null,
      p_reason_code: params.reasonCode ?? null,
      p_mastery_rule_version: params.masteryRuleVersion ?? null,
    });

    if (error) {
      if (error.message.includes("ATTEMPT_ALREADY_RECORDED")) {
        throw new AttemptAlreadyRecordedError(error.message);
      }
      if (error.message.includes("STATE_CONFLICT_RETRY")) {
        throw new StateConflictRetryError(error.message);
      }
      if (error.message.includes("SESSION_CLOSED")) {
        throw new SessionClosedError(error.message);
      }
      throw new DatabasePersistenceError(`Database error executing atomic diagnostic grading: ${error.message}`, error);
    }

    return {
      attemptId: data.attempt_id,
      evidenceId: data.evidence_id,
      masteryId: data.mastery_id,
      nodeUpdatedAt: data.node_updated_at,
    };
  }
}

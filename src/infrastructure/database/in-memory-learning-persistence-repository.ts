/**
 * AI School Learning Persistence V1 — In-Memory Repository
 *
 * Implements full domain ownership, composite integrity, and validation rules.
 * Intended for development and isolated unit/integration testing only.
 */

import crypto from "crypto";
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
  validateItemContentHash,
  validateEvidenceType,
  validateLearnerStageConstraints,
  validateStudentResponse,
  validateNodeStateCounts,
} from "../../domain/learning-persistence/types";
import { hashVisitorToken, verifyVisitorTokenOwnership } from "../auth/anonymous-visitor";

export class InMemoryLearningPersistenceRepository implements LearningPersistenceRepository {
  private learners = new Map<string, LearnerProfile>();
  private guardianRelationships = new Map<string, { learnerId: string; guardianUserId: string; relationshipType: GuardianRelationshipType; createdAt: string }>();
  private sessions = new Map<string, LearningSessionRecord>();
  private attempts = new Map<string, EvaluatedAttemptRecord>();
  private evidence = new Map<string, KnowledgeEvidenceRecord>();
  private nodeStates = new Map<string, KnowledgeNodeStateRecord>(); // key: `${learnerId}:${nodeId}`
  private masteryTransitions = new Map<string, MasteryTransitionHistoryRecord>();

  public clear(): void {
    this.learners.clear();
    this.guardianRelationships.clear();
    this.sessions.clear();
    this.attempts.clear();
    this.evidence.clear();
    this.nodeStates.clear();
    this.masteryTransitions.clear();
  }

  private isOwner(learner: LearnerProfile, ownership: OwnershipContext): boolean {
    if (ownership.visitorToken && verifyVisitorTokenOwnership(ownership.visitorToken, learner.visitorOwnerHash)) {
      return true;
    }
    if (ownership.userId) {
      const relKey = `${ownership.userId}:${learner.id}`;
      if (this.guardianRelationships.has(relKey)) {
        return true;
      }
    }
    return false;
  }

  private assertLearnerOwnership(learnerId: string, ownership: OwnershipContext): LearnerProfile {
    const learner = this.learners.get(learnerId);
    if (!learner || !this.isOwner(learner, ownership)) {
      throw new UnauthorizedLearnerAccessError(`Unauthorized access to learner '${learnerId}'.`);
    }
    return learner;
  }

  async createLearner(params: CreateLearnerParams, ownership: OwnershipContext): Promise<LearnerProfile> {
    if (!ownership.visitorToken) {
      throw new UnauthorizedLearnerAccessError("Anonymous learner profile creation requires visitorToken in OwnershipContext.");
    }
    validateLearnerStageConstraints(params.educationStage, params.gradeLevel, params.ageBand);

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const visitorOwnerHash = hashVisitorToken(ownership.visitorToken);

    const profile: LearnerProfile = {
      id,
      visitorOwnerHash,
      nickname: params.nickname?.trim() || null,
      educationStage: params.educationStage,
      gradeLevel: params.gradeLevel ?? null,
      ageBand: params.ageBand ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.learners.set(id, profile);
    return profile;
  }

  async loadOwnedLearner(learnerId: string, ownership: OwnershipContext): Promise<LearnerProfile | null> {
    const learner = this.learners.get(learnerId);
    if (!learner) return null;
    if (!this.isOwner(learner, ownership)) return null;
    return learner;
  }

  async claimLearnerForGuardian(
    learnerId: string,
    guardianUserId: string,
    relationshipType: GuardianRelationshipType,
    ownership: OwnershipContext
  ): Promise<boolean> {
    const learner = this.learners.get(learnerId);
    if (!learner) {
      throw new UnauthorizedLearnerAccessError(`Learner '${learnerId}' not found.`);
    }

    // A4: Guardian claim must bind guardianUserId to authenticated ownership.userId OR require verified current visitor ownership
    const hasVisitorOwnership = !!ownership.visitorToken && verifyVisitorTokenOwnership(ownership.visitorToken, learner.visitorOwnerHash);
    const hasMatchingUserId = ownership.userId === guardianUserId;

    if (!hasVisitorOwnership && !hasMatchingUserId) {
      throw new UnauthorizedLearnerAccessError("Guardian claim requires verified current visitor ownership or matching authenticated userId.");
    }

    // If userId provided, it must match guardianUserId
    if (ownership.userId && ownership.userId !== guardianUserId) {
      throw new UnauthorizedLearnerAccessError("Authenticated userId must match guardianUserId.");
    }

    const relKey = `${guardianUserId}:${learnerId}`;
    this.guardianRelationships.set(relKey, {
      learnerId,
      guardianUserId,
      relationshipType,
      createdAt: new Date().toISOString(),
    });

    return true;
  }

  async createLearningSession(params: CreateSessionParams, ownership: OwnershipContext): Promise<LearningSessionRecord> {
    this.assertLearnerOwnership(params.learnerId, ownership);

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const session: LearningSessionRecord = {
      id,
      learnerId: params.learnerId,
      sessionKind: params.sessionKind,
      subjectId: params.subjectId,
      topicId: params.topicId ?? null,
      targetNodeId: params.targetNodeId ?? null,
      status: "STARTED",
      ruleVersion: params.ruleVersion,
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(id, session);
    return session;
  }

  async loadOwnedLearningSession(sessionId: string, ownership: OwnershipContext): Promise<LearningSessionRecord | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    const learner = this.learners.get(session.learnerId);
    if (!learner || !this.isOwner(learner, ownership)) return null;
    return session;
  }

  async saveEvaluatedAttempt(attempt: SaveAttemptParams, ownership: OwnershipContext): Promise<EvaluatedAttemptRecord> {
    this.assertLearnerOwnership(attempt.learnerId, ownership);

    // A1 & A9: Verify session belongs to this learner
    const session = this.sessions.get(attempt.sessionId);
    if (!session || session.learnerId !== attempt.learnerId) {
      throw new OwnershipChainMismatchError(`Session '${attempt.sessionId}' does not belong to learner '${attempt.learnerId}'.`);
    }

    // A8: Validate structured response and hash
    validateItemContentHash(attempt.itemContentHash);
    validateStudentResponse(attempt.studentResponse);

    const now = attempt.attemptedAt || new Date().toISOString();
    const id = crypto.randomUUID();

    const record: EvaluatedAttemptRecord = {
      id,
      sessionId: attempt.sessionId,
      learnerId: attempt.learnerId,
      itemId: attempt.itemId,
      itemVersion: attempt.itemVersion,
      itemContentHash: attempt.itemContentHash,
      primaryNodeId: attempt.primaryNodeId,
      studentResponse: attempt.studentResponse,
      selectedOptionId: attempt.selectedOptionId ?? null,
      isCorrect: attempt.isCorrect,
      misconceptionTags: attempt.misconceptionTags ?? [],
      gradingRuleVersion: attempt.gradingRuleVersion,
      attemptedAt: now,
    };

    this.attempts.set(id, record);
    return record;
  }

  async appendKnowledgeEvidence(evidence: AppendEvidenceParams, ownership: OwnershipContext): Promise<KnowledgeEvidenceRecord> {
    this.assertLearnerOwnership(evidence.learnerId, ownership);

    // A1 & A9: Verify attempt belongs to this learner and session
    const attempt = this.attempts.get(evidence.attemptId);
    if (!attempt || attempt.learnerId !== evidence.learnerId || attempt.sessionId !== evidence.sessionId) {
      throw new OwnershipChainMismatchError(
        `Attempt '${evidence.attemptId}' does not belong to session '${evidence.sessionId}' and learner '${evidence.learnerId}'.`
      );
    }

    validateEvidenceType(evidence.evidenceType);

    const now = evidence.observedAt || new Date().toISOString();
    const id = crypto.randomUUID();

    const record: KnowledgeEvidenceRecord = {
      id,
      learnerId: evidence.learnerId,
      sessionId: evidence.sessionId,
      attemptId: evidence.attemptId,
      nodeId: evidence.nodeId,
      evidenceType: evidence.evidenceType,
      outcome: evidence.outcome,
      observedAt: now,
      ruleVersion: evidence.ruleVersion,
    };

    this.evidence.set(id, record);
    return record;
  }

  async upsertNodeState(state: UpsertNodeStateParams, ownership: OwnershipContext): Promise<KnowledgeNodeStateRecord> {
    this.assertLearnerOwnership(state.learnerId, ownership);

    // A3: Count checks and nullable lastAssessedAt for NOT_ASSESSED
    validateNodeStateCounts(state.attemptsCount, state.correctCount);
    if (state.state !== "NOT_ASSESSED" && !state.lastAssessedAt) {
      throw new Error(`State '${state.state}' requires lastAssessedAt.`);
    }

    const key = `${state.learnerId}:${state.nodeId}`;
    const now = new Date().toISOString();

    const record: KnowledgeNodeStateRecord = {
      learnerId: state.learnerId,
      nodeId: state.nodeId,
      state: state.state,
      confidence: state.confidence,
      attemptsCount: state.attemptsCount,
      correctCount: state.correctCount,
      misconceptionTags: state.misconceptionTags ?? [],
      lastAssessedAt: state.state === "NOT_ASSESSED" ? (state.lastAssessedAt ?? null) : (state.lastAssessedAt || now),
      ruleVersion: state.ruleVersion,
      updatedAt: now,
    };

    this.nodeStates.set(key, record);
    return record;
  }

  async appendMasteryTransition(
    transition: AppendMasteryTransitionParams,
    ownership: OwnershipContext
  ): Promise<MasteryTransitionHistoryRecord> {
    this.assertLearnerOwnership(transition.learnerId, ownership);

    // A1 & A9: Verify trigger session belongs to this learner
    const session = this.sessions.get(transition.triggerSessionId);
    if (!session || session.learnerId !== transition.learnerId) {
      throw new OwnershipChainMismatchError(
        `Trigger session '${transition.triggerSessionId}' does not belong to learner '${transition.learnerId}'.`
      );
    }

    const now = transition.occurredAt || new Date().toISOString();
    const id = crypto.randomUUID();

    const record: MasteryTransitionHistoryRecord = {
      id,
      learnerId: transition.learnerId,
      nodeId: transition.nodeId,
      triggerSessionId: transition.triggerSessionId,
      previousState: transition.previousState,
      previousConfidence: transition.previousConfidence,
      newState: transition.newState,
      newConfidence: transition.newConfidence,
      reasonCode: transition.reasonCode,
      ruleVersion: transition.ruleVersion,
      occurredAt: now,
    };

    this.masteryTransitions.set(id, record);
    return record;
  }

  async completeLearningSession(sessionId: string, ownership: OwnershipContext): Promise<LearningSessionRecord> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found.`);
    }
    this.assertLearnerOwnership(session.learnerId, ownership);

    const now = new Date().toISOString();
    session.status = "COMPLETED";
    session.completedAt = now;
    session.updatedAt = now;

    this.sessions.set(sessionId, session);
    return session;
  }

  async getCurrentNodeStates(learnerId: string, ownership: OwnershipContext): Promise<Record<string, KnowledgeNodeStateRecord>> {
    this.assertLearnerOwnership(learnerId, ownership);

    const result: Record<string, KnowledgeNodeStateRecord> = {};
    for (const [key, state] of this.nodeStates.entries()) {
      if (state.learnerId === learnerId) {
        result[state.nodeId] = { ...state };
      }
    }
    return result;
  }

  async getMasteryHistory(learnerId: string, ownership: OwnershipContext): Promise<MasteryTransitionHistoryRecord[]> {
    this.assertLearnerOwnership(learnerId, ownership);

    const transitions: MasteryTransitionHistoryRecord[] = [];
    for (const record of this.masteryTransitions.values()) {
      if (record.learnerId === learnerId) {
        transitions.push({ ...record });
      }
    }
    // Chronological sort
    transitions.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    return transitions;
  }
}

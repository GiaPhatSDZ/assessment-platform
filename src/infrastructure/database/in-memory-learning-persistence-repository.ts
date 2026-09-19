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

    const relKey = `${guardianUserId}:${learnerId}`;

    // P0-1: If identical relationship already exists, authenticated guardian may treat as idempotent success
    if (this.guardianRelationships.has(relKey) && ownership.userId === guardianUserId) {
      return true;
    }

    // P0-1: Initial binding MUST satisfy all 4 conditions:
    // 1. ownership.userId exists
    // 2. ownership.userId === guardianUserId
    // 3. ownership.visitorToken exists
    // 4. visitor token verifies against learner.visitor_owner_hash
    if (!ownership.userId || ownership.userId !== guardianUserId) {
      throw new UnauthorizedLearnerAccessError("Guardian claim requires authenticated userId matching guardianUserId.");
    }

    if (!ownership.visitorToken || !verifyVisitorTokenOwnership(ownership.visitorToken, learner.visitorOwnerHash)) {
      throw new UnauthorizedLearnerAccessError("Guardian claim requires verified current visitor ownership of the learner profile.");
    }

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

    // A1 & A9: Verify session belongs to learner
    const session = this.sessions.get(evidence.sessionId);
    if (!session || session.learnerId !== evidence.learnerId) {
      throw new OwnershipChainMismatchError(
        `Session '${evidence.sessionId}' does not belong to learner '${evidence.learnerId}'.`
      );
    }

    // A1 & A9: Verify attempt belongs to this learner and session
    const attempt = this.attempts.get(evidence.attemptId);
    if (!attempt || attempt.learnerId !== evidence.learnerId || attempt.sessionId !== evidence.sessionId) {
      throw new OwnershipChainMismatchError(
        `Attempt '${evidence.attemptId}' does not belong to session '${evidence.sessionId}' and learner '${evidence.learnerId}'.`
      );
    }

    validateEvidenceType(evidence.evidenceType);

    // P1-1: Semantic integrity checks
    if (evidence.nodeId !== attempt.primaryNodeId) {
      throw new EvidenceSemanticMismatchError(
        `evidence.nodeId '${evidence.nodeId}' does not match attempt.primaryNodeId '${attempt.primaryNodeId}'.`
      );
    }
    const expectedOutcome = attempt.isCorrect ? "CORRECT" : "INCORRECT";
    if (evidence.outcome !== expectedOutcome) {
      throw new EvidenceSemanticMismatchError(
        `evidence.outcome '${evidence.outcome}' does not match attempt.isCorrect (${attempt.isCorrect} -> '${expectedOutcome}').`
      );
    }
    const expectedEvidenceType = sessionKindToEvidenceType(session.sessionKind);
    if (evidence.evidenceType !== expectedEvidenceType) {
      throw new EvidenceSemanticMismatchError(
        `evidence.evidenceType '${evidence.evidenceType}' does not match session.sessionKind '${session.sessionKind}' -> '${expectedEvidenceType}'.`
      );
    }

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

    // P1-3: Strengthen NOT_ASSESSED consistency
    validateNodeStateConsistency(state.state, state.attemptsCount, state.correctCount, state.lastAssessedAt);

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
      lastAssessedAt: state.state === "NOT_ASSESSED" ? null : (state.lastAssessedAt || now),
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

    // P1-4: Semantic integrity check between trigger session kind and reasonCode
    const expectedReasonCode = sessionKindToMasteryReason(session.sessionKind);
    if (transition.reasonCode !== expectedReasonCode) {
      throw new MasterySemanticMismatchError(
        `transition.reasonCode '${transition.reasonCode}' does not match trigger session.sessionKind '${session.sessionKind}' -> '${expectedReasonCode}'.`
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

  async getLearnerNodeAttempts(
    learnerId: string,
    nodeId: string,
    ownership: OwnershipContext
  ): Promise<EvaluatedAttemptRecord[]> {
    this.assertLearnerOwnership(learnerId, ownership);
    const result: EvaluatedAttemptRecord[] = [];
    for (const attempt of this.attempts.values()) {
      if (attempt.learnerId === learnerId && attempt.primaryNodeId === nodeId) {
        result.push({ ...attempt });
      }
    }
    result.sort((a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime());
    return result;
  }

  async recordAtomicDiagnosticSubmission(
    params: AtomicDiagnosticGradingParams,
    ownership: OwnershipContext
  ): Promise<AtomicDiagnosticGradingResult> {
    this.assertLearnerOwnership(params.learnerId, ownership);

    const session = this.sessions.get(params.sessionId);
    if (!session || session.learnerId !== params.learnerId) {
      throw new OwnershipChainMismatchError(
        `Session '${params.sessionId}' does not belong to learner '${params.learnerId}'.`
      );
    }
    if (session.sessionKind !== "DIAGNOSTIC") {
      throw new Error(`Invalid session kind '${session.sessionKind}'. Expected 'DIAGNOSTIC'.`);
    }
    if (session.status !== "STARTED" && session.status !== "IN_PROGRESS") {
      throw new SessionClosedError(`Session '${params.sessionId}' is closed with status '${session.status}'.`);
    }

    // Duplicate attempt check: UNIQUE(session_id, item_id)
    for (const existing of this.attempts.values()) {
      if (existing.sessionId === params.sessionId && existing.itemId === params.itemId) {
        throw new AttemptAlreadyRecordedError(
          `ATTEMPT_ALREADY_RECORDED: Item '${params.itemId}' has already been attempted in session '${params.sessionId}'.`
        );
      }
    }

    // A3 & P0-2: Check CAS on node state (explicitly handling presence/absence)
    const nodeKey = `${params.learnerId}:${params.primaryNodeId}`;
    const currentNode = this.nodeStates.get(nodeKey);
    if (!params.expectedNodeExists) {
      if (currentNode) {
        throw new StateConflictRetryError(
          `STATE_CONFLICT_RETRY: Node state for node '${params.primaryNodeId}' was created concurrently.`
        );
      }
    } else {
      if (!currentNode) {
        throw new StateConflictRetryError(
          `STATE_CONFLICT_RETRY: Expected node state for node '${params.primaryNodeId}' does not exist.`
        );
      }
      if (params.expectedNodeUpdatedAt !== undefined && params.expectedNodeUpdatedAt !== null) {
        if (currentNode.updatedAt !== params.expectedNodeUpdatedAt) {
          throw new StateConflictRetryError(
            `STATE_CONFLICT_RETRY: Stale projection for node '${params.primaryNodeId}'. Expected '${params.expectedNodeUpdatedAt}', found '${currentNode.updatedAt}'.`
          );
        }
      }
    }

    // Transactional snapshot to ensure all-or-nothing rollback on any failure
    const attemptsSnapshot = new Map(this.attempts);
    const evidenceSnapshot = new Map(this.evidence);
    const nodeStatesSnapshot = new Map(this.nodeStates);
    const masterySnapshot = new Map(this.masteryTransitions);

    try {
      const now = new Date().toISOString();
      const attemptId = crypto.randomUUID();
      const evidenceId = crypto.randomUUID();

      // 1. Learning attempt
      const attemptRecord: EvaluatedAttemptRecord = {
        id: attemptId,
        sessionId: params.sessionId,
        learnerId: params.learnerId,
        itemId: params.itemId,
        itemVersion: params.itemVersion,
        itemContentHash: params.itemContentHash,
        primaryNodeId: params.primaryNodeId,
        studentResponse: params.studentResponse,
        selectedOptionId: params.selectedOptionId ?? null,
        isCorrect: params.isCorrect,
        misconceptionTags: params.misconceptionTags ?? [],
        gradingRuleVersion: params.gradingRuleVersion,
        attemptedAt: now,
      };
      this.attempts.set(attemptId, attemptRecord);

      // 2. Knowledge evidence
      const expectedEvidenceOutcome = params.isCorrect ? "CORRECT" : "INCORRECT";
      const evidenceRecord: KnowledgeEvidenceRecord = {
        id: evidenceId,
        learnerId: params.learnerId,
        sessionId: params.sessionId,
        attemptId,
        nodeId: params.primaryNodeId,
        evidenceType: "DIAGNOSTIC_ATTEMPT",
        outcome: expectedEvidenceOutcome,
        observedAt: now,
        ruleVersion: params.evidenceRuleVersion,
      };
      this.evidence.set(evidenceId, evidenceRecord);

      // 3. Node state projection
      validateNodeStateConsistency(
        params.nodeState,
        params.attemptsCount,
        params.correctCount,
        params.lastAssessedAt
      );

      const nodeRecord: KnowledgeNodeStateRecord = {
        learnerId: params.learnerId,
        nodeId: params.primaryNodeId,
        state: params.nodeState,
        confidence: params.nodeConfidence,
        attemptsCount: params.attemptsCount,
        correctCount: params.correctCount,
        misconceptionTags: params.misconceptionTags ?? [],
        lastAssessedAt: params.nodeState === "NOT_ASSESSED" ? null : (params.lastAssessedAt || now),
        ruleVersion: params.nodeRuleVersion,
        updatedAt: now,
      };
      this.nodeStates.set(nodeKey, nodeRecord);

      // 4. Mastery history (if transition occurred)
      let masteryId: string | null = null;
      if (params.hasMasteryTransition && params.newState && params.newConfidence) {
        masteryId = crypto.randomUUID();
        const masteryRecord: MasteryTransitionHistoryRecord = {
          id: masteryId,
          learnerId: params.learnerId,
          nodeId: params.primaryNodeId,
          triggerSessionId: params.sessionId,
          previousState: params.previousState || "NOT_ASSESSED",
          previousConfidence: params.previousConfidence || "LOW",
          newState: params.newState,
          newConfidence: params.newConfidence,
          reasonCode: "DIAGNOSTIC_EVALUATION",
          ruleVersion: params.masteryRuleVersion || "1.0.0",
          occurredAt: now,
        };
        this.masteryTransitions.set(masteryId, masteryRecord);
      }

      return {
        attemptId,
        evidenceId,
        masteryId,
        nodeUpdatedAt: now,
      };
    } catch (err) {
      // Rollback to snapshot on any error
      this.attempts = attemptsSnapshot;
      this.evidence = evidenceSnapshot;
      this.nodeStates = nodeStatesSnapshot;
      this.masteryTransitions = masterySnapshot;
      throw err;
    }
  }
}

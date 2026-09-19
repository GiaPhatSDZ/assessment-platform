/**
 * AI School Learning Persistence V1 — Application Repository Interface
 *
 * Implements Controller Audit Requirements:
 * - A4: Guardian claim binds guardianUserId to authenticated ownership.userId or verified visitor ownership.
 * - A7: knowledge_evidence and mastery_history are append-only. Zero update/delete API.
 * - A9: Every write verifies complete ownership chain (ownership -> learner -> session -> attempt).
 */

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
} from "../domain/learning-persistence/types";
import {
  AtomicDiagnosticGradingParams,
  AtomicDiagnosticGradingResult,
} from "../domain/diagnostic/types";

export interface LearningPersistenceRepository {
  /**
   * Creates a new learner profile bound to ownership context (visitorToken hash).
   */
  createLearner(
    params: CreateLearnerParams,
    ownership: OwnershipContext
  ): Promise<LearnerProfile>;

  /**
   * Loads a learner profile only if caller owns it (via visitorToken hash or guardian relationship).
   * Returns null if unowned or not found.
   */
  loadOwnedLearner(
    learnerId: string,
    ownership: OwnershipContext
  ): Promise<LearnerProfile | null>;

  /**
   * Links an authenticated guardian user to a learner profile.
   * A4: Must bind guardianUserId to authenticated ownership.userId OR require verified visitor ownership.
   */
  claimLearnerForGuardian(
    learnerId: string,
    guardianUserId: string,
    relationshipType: GuardianRelationshipType,
    ownership: OwnershipContext
  ): Promise<boolean>;

  /**
   * Starts a new learning session for an owned learner.
   */
  createLearningSession(
    params: CreateSessionParams,
    ownership: OwnershipContext
  ): Promise<LearningSessionRecord>;

  /**
   * Loads a learning session only if caller owns the parent learner.
   * Returns null if unowned or not found.
   */
  loadOwnedLearningSession(
    sessionId: string,
    ownership: OwnershipContext
  ): Promise<LearningSessionRecord | null>;

  /**
   * Saves evaluated attempt.
   * A9: Verifies ownership of learner and session.
   * A8: Enforces structured response; rejects client grading truth.
   */
  saveEvaluatedAttempt(
    attempt: SaveAttemptParams,
    ownership: OwnershipContext
  ): Promise<EvaluatedAttemptRecord>;

  /**
   * Appends immutable knowledge evidence.
   * A7: Append-only.
   * A9: Verifies ownership -> learner -> session -> attempt chain.
   */
  appendKnowledgeEvidence(
    evidence: AppendEvidenceParams,
    ownership: OwnershipContext
  ): Promise<KnowledgeEvidenceRecord>;

  /**
   * Deterministic current node state upsert.
   * A9: Verifies ownership -> learner.
   * A3: Nullable last_assessed_at for NOT_ASSESSED; count checks.
   */
  upsertNodeState(
    state: UpsertNodeStateParams,
    ownership: OwnershipContext
  ): Promise<KnowledgeNodeStateRecord>;

  /**
   * Appends mastery transition record.
   * A7: Append-only.
   * A9: Verifies ownership -> learner -> session.
   */
  appendMasteryTransition(
    transition: AppendMasteryTransitionParams,
    ownership: OwnershipContext
  ): Promise<MasteryTransitionHistoryRecord>;

  /**
   * Completes a learning session.
   * A9: Verifies ownership -> learner -> session.
   */
  completeLearningSession(
    sessionId: string,
    ownership: OwnershipContext
  ): Promise<LearningSessionRecord>;

  /**
   * Retrieves current projection of all assessed node states for an owned learner.
   */
  getCurrentNodeStates(
    learnerId: string,
    ownership: OwnershipContext
  ): Promise<Record<string, KnowledgeNodeStateRecord>>;

  /**
   * Retrieves chronological mastery transition history for an owned learner.
   */
  getMasteryHistory(
    learnerId: string,
    ownership: OwnershipContext
  ): Promise<MasteryTransitionHistoryRecord[]>;

  /**
   * Retrieves historical attempts for an owned learner on a specific knowledge node.
   * Used to count distinct canonical items for independent evidence verification (A5).
   */
  getLearnerNodeAttempts(
    learnerId: string,
    nodeId: string,
    ownership: OwnershipContext
  ): Promise<EvaluatedAttemptRecord[]>;

  /**
   * Executes atomic diagnostic submission transaction:
   * learning_attempt + knowledge_evidence + node-state projection + optional mastery_history.
   * Concurrency-safe, transactional rollback on any error, duplicate prevention.
   */
  recordAtomicDiagnosticSubmission(
    params: AtomicDiagnosticGradingParams,
    ownership: OwnershipContext
  ): Promise<AtomicDiagnosticGradingResult>;
}

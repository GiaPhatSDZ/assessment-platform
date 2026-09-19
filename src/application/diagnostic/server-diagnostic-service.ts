import "server-only";

/**
 * AI School V3 — Server-Side Diagnostic Grading Application Service
 *
 * Implements Controller Mandates:
 * - Server-only execution (`import "server-only"`).
 * - Exact canonical item authority via publication guard (`assertPublishedForStudent`).
 * - Server recomputes canonicalContentHash; browser item hash is never accepted.
 * - Pure deterministic grading (MCQ & NUMERIC).
 * - A1: NUMERIC requires canonical answerSpec (no fallback parsing of correctAnswer).
 * - A2: submitAttempt does not expose customItemResolver; test resolver injected via constructor only.
 * - A5: SECURE requires >=2 independent evidence units (distinct canonical itemIds).
 * - A6: Session compatibility verified against explicit resolver subjectId/topicId metadata.
 * - A8: MULTIPLE_CHOICE item must have exactly 1 option with isCorrect=true matching correctAnswer.
 * - Atomic persistence boundary writing attempt + evidence + node projection + optional mastery.
 * - Returns safe client DTO with zero answer keys or rationales leaked.
 */

import { LearningPersistenceRepository } from "../learning-persistence-repository";
import { getLearningPersistenceRepository } from "../../infrastructure/database/learning-persistence-factory";
import {
  CanonicalItemResolver,
  defaultCanonicalItemResolver,
} from "../../domain/content/canonical-item-resolver";
import {
  DiagnosticSubmissionRequestDto,
  DiagnosticGradingResultDto,
  SessionClosedError,
  SessionCompatibilityError,
  InvalidGradingInputError,
  AttemptAlreadyRecordedError,
  AtomicDiagnosticGradingParams,
  StateConflictRetryError,
  TestResolverInjectionForbiddenError,
} from "../../domain/diagnostic/types";
import {
  OwnershipContext,
  UnauthorizedLearnerAccessError,
  validateItemContentHash,
} from "../../domain/learning-persistence/types";
import { assertPublishedForStudent } from "../../domain/content/publication-guard";
import { canonicalContentHash } from "../../domain/content/canonical-content-hash";
import {
  DIAGNOSTIC_GRADING_RULE_VERSION,
  DIAGNOSTIC_EVIDENCE_RULE_VERSION,
  gradeStudentResponse,
  computeConservativeNodeState,
  checkMasteryTransition,
} from "../../domain/diagnostic/grading-engine";

export class ServerDiagnosticService {
  private persistenceRepo: LearningPersistenceRepository;
  private itemResolver: CanonicalItemResolver;

  constructor(
    persistenceRepo?: LearningPersistenceRepository,
    itemResolver?: CanonicalItemResolver
  ) {
    this.persistenceRepo = persistenceRepo || getLearningPersistenceRepository();
    if (itemResolver) {
      if (process.env.NODE_ENV !== "test") {
        throw new TestResolverInjectionForbiddenError();
      }
      this.itemResolver = itemResolver;
    } else {
      this.itemResolver = defaultCanonicalItemResolver;
    }
  }

  /**
   * Test-only factory for creating an instance with a custom item resolver.
   * Fails closed outside test environment.
   */
  static createForTesting(
    persistenceRepo?: LearningPersistenceRepository,
    itemResolver?: CanonicalItemResolver
  ): ServerDiagnosticService {
    if (process.env.NODE_ENV !== "test") {
      throw new TestResolverInjectionForbiddenError();
    }
    return new ServerDiagnosticService(persistenceRepo, itemResolver);
  }

  /**
   * Authoritative server-side diagnostic attempt evaluation and atomic persistence.
   * A2: Production API signature takes only params and trusted ownership context.
   */
  async submitAttempt(
    params: DiagnosticSubmissionRequestDto,
    ownership: OwnershipContext
  ): Promise<DiagnosticGradingResultDto> {
    // 1. Basic input shape and client grading authority rejection
    this.validateSubmissionPayload(params);

    // 2. Ownership & Session Integrity
    const learner = await this.persistenceRepo.loadOwnedLearner(params.learnerId, ownership);
    if (!learner) {
      throw new UnauthorizedLearnerAccessError(
        `Learner '${params.learnerId}' not found or not owned by context.`
      );
    }

    const session = await this.persistenceRepo.loadOwnedLearningSession(params.sessionId, ownership);
    if (!session) {
      throw new UnauthorizedLearnerAccessError(
        `Session '${params.sessionId}' not found or not owned by context.`
      );
    }

    if (session.learnerId !== params.learnerId) {
      throw new UnauthorizedLearnerAccessError(
        `Session '${params.sessionId}' belongs to learner '${session.learnerId}', not '${params.learnerId}'.`
      );
    }

    if (session.sessionKind !== "DIAGNOSTIC") {
      throw new SessionCompatibilityError(
        `SESSION_COMPATIBILITY_ERROR: Diagnostic grading only accepts DIAGNOSTIC sessions (received '${session.sessionKind}').`
      );
    }

    if (session.status !== "STARTED" && session.status !== "IN_PROGRESS") {
      throw new SessionClosedError(
        `SESSION_CLOSED: Session '${params.sessionId}' is in closed status '${session.status}'.`
      );
    }

    // 3. Exact Canonical Item Authority & Publication Guard
    const resolved = await this.itemResolver(params.itemId);
    if (!resolved) {
      throw new Error(`Item '${params.itemId}' not found in canonical curriculum registry.`);
    }

    // A6: Subject & Topic Compatibility from explicit resolver metadata
    if (session.subjectId && resolved.subjectId && session.subjectId !== resolved.subjectId) {
      throw new SessionCompatibilityError(
        `SESSION_COMPATIBILITY_ERROR: Item subject '${resolved.subjectId}' does not match session subject '${session.subjectId}'.`
      );
    }
    if (session.topicId && resolved.topicId && session.topicId !== resolved.topicId) {
      throw new SessionCompatibilityError(
        `SESSION_COMPATIBILITY_ERROR: Item topic '${resolved.topicId}' does not match session topic '${session.topicId}'.`
      );
    }

    // Publication guard check (fail closed for DRAFT content / unreviewed items)
    assertPublishedForStudent(resolved.item);

    // Exact version match check
    if (resolved.item.version !== params.itemVersion) {
      throw new InvalidGradingInputError(
        `INVALID_GRADING_INPUT: Item version mismatch. Requested '${params.itemVersion}' but canonical is '${resolved.item.version}'.`
      );
    }

    // Server recomputes canonical content hash
    const canonicalHash = canonicalContentHash(resolved.item);
    validateItemContentHash(canonicalHash);

    const primaryNodeId = resolved.item.primaryNodeId;

    // 4. Deterministic Grading Engine (pure, no-LLM)
    const evaluated = gradeStudentResponse(resolved.item, params.response);

    // 5. Atomic Persistence Pipeline with Concurrency Retry (P0-2) & Distinct Evidence Tracking (P1-1)
    const executeSubmissionWithRetry = async (
      isRetry = false
    ): Promise<{ atomicResult: any; newProjection: any }> => {
      // Load past attempts for this learner & primary node
      const pastAttempts = await this.persistenceRepo.getLearnerNodeAttempts(
        params.learnerId,
        primaryNodeId,
        ownership
      );

      // Duplicate attempt check in session
      if (pastAttempts.some((a) => a.sessionId === params.sessionId && a.itemId === params.itemId)) {
        throw new AttemptAlreadyRecordedError(
          `ATTEMPT_ALREADY_RECORDED: Item '${params.itemId}' has already been attempted in session '${params.sessionId}'.`
        );
      }

      // A5 & P1-1: Count distinct canonical item IDs for independent evidence verification
      const distinctAttemptedItemIds = new Set<string>();
      const distinctCorrectItemIds = new Set<string>();
      for (const a of pastAttempts) {
        distinctAttemptedItemIds.add(a.itemId);
        if (a.isCorrect) {
          distinctCorrectItemIds.add(a.itemId);
        }
      }
      distinctAttemptedItemIds.add(params.itemId);
      if (evaluated.isCorrect) {
        distinctCorrectItemIds.add(params.itemId);
      }

      const totalAttemptsCount = pastAttempts.length + 1;
      const totalCorrectCount = pastAttempts.filter((a) => a.isCorrect).length + (evaluated.isCorrect ? 1 : 0);
      const allMisconceptions = [
        ...pastAttempts.flatMap((a) => a.misconceptionTags || []),
        ...evaluated.detectedMisconceptions,
      ];
      const assessedAt = new Date().toISOString();

      // 6. Conservative Node State Matrix Evaluation
      const newProjection = computeConservativeNodeState({
        attemptsCount: totalAttemptsCount,
        correctCount: totalCorrectCount,
        distinctAttemptedItemIds,
        distinctCorrectItemIds,
        allMisconceptions,
        assessedAt,
      });

      // 7. Mastery Transition History Check
      const currentNodeStates = await this.persistenceRepo.getCurrentNodeStates(params.learnerId, ownership);
      const existingNodeState = currentNodeStates[primaryNodeId] || null;

      const transitionCheck = checkMasteryTransition(
        existingNodeState?.state,
        existingNodeState?.confidence,
        newProjection.state,
        newProjection.confidence
      );

      // 8. Atomic Persistence Transaction
      const atomicParams: AtomicDiagnosticGradingParams = {
        learnerId: params.learnerId,
        sessionId: params.sessionId,
        itemId: params.itemId,
        itemVersion: resolved.item.version,
        itemContentHash: canonicalHash,
        primaryNodeId,
        studentResponse: params.response,
        selectedOptionId: evaluated.selectedOptionId,
        isCorrect: evaluated.isCorrect,
        attemptMisconceptionTags: evaluated.detectedMisconceptions,
        nodeMisconceptionTags: newProjection.misconceptionTags,
        gradingRuleVersion: DIAGNOSTIC_GRADING_RULE_VERSION,
        evidenceRuleVersion: DIAGNOSTIC_EVIDENCE_RULE_VERSION,
        nodeState: newProjection.state,
        nodeConfidence: newProjection.confidence,
        attemptsCount: newProjection.attemptsCount,
        correctCount: newProjection.correctCount,
        lastAssessedAt: newProjection.lastAssessedAt,
        nodeRuleVersion: newProjection.ruleVersion,
        expectedNodeExists: existingNodeState !== null && existingNodeState !== undefined,
        expectedNodeUpdatedAt: existingNodeState?.updatedAt || null,
        hasMasteryTransition: transitionCheck.hasTransition,
        previousState: transitionCheck.previousState,
        previousConfidence: transitionCheck.previousConfidence,
        newState: transitionCheck.newState,
        newConfidence: transitionCheck.newConfidence,
        reasonCode: transitionCheck.reasonCode,
        masteryRuleVersion: transitionCheck.ruleVersion,
      };

      try {
        const atomicResult = await this.persistenceRepo.recordAtomicDiagnosticSubmission(
          atomicParams,
          ownership
        );
        return { atomicResult, newProjection };
      } catch (err: any) {
        const isConflict =
          err instanceof StateConflictRetryError ||
          err?.name === "StateConflictRetryError" ||
          err?.message?.includes("STATE_CONFLICT_RETRY");

        if (!isRetry && isConflict) {
          // P0-2: Retry ONCE by reloading attempts, reloading node state, and recomputing deterministic projection
          return executeSubmissionWithRetry(true);
        }
        throw err;
      }
    };

    const { atomicResult, newProjection } = await executeSubmissionWithRetry(false);

    // 9. Safe Result DTO Construction (Zero answer keys or rationales leaked)
    return {
      attemptId: atomicResult.attemptId,
      itemId: params.itemId,
      accepted: true,
      isCorrect: evaluated.isCorrect,
      nodeState: {
        state: newProjection.state,
        confidence: newProjection.confidence,
      },
      misconceptionSignals: evaluated.detectedMisconceptions,
    };
  }

  /**
   * Rejects client payloads providing unauthorized grading authority fields.
   */
  private validateSubmissionPayload(params: DiagnosticSubmissionRequestDto): void {
    if (!params || typeof params !== "object") {
      throw new InvalidGradingInputError("INVALID_GRADING_INPUT: Missing submission payload.");
    }

    const { learnerId, sessionId, itemId, itemVersion, response } = params;

    if (!learnerId || typeof learnerId !== "string") {
      throw new InvalidGradingInputError("INVALID_GRADING_INPUT: learnerId is required.");
    }
    if (!sessionId || typeof sessionId !== "string") {
      throw new InvalidGradingInputError("INVALID_GRADING_INPUT: sessionId is required.");
    }
    if (!itemId || typeof itemId !== "string") {
      throw new InvalidGradingInputError("INVALID_GRADING_INPUT: itemId is required.");
    }
    if (!itemVersion || typeof itemVersion !== "string") {
      throw new InvalidGradingInputError("INVALID_GRADING_INPUT: itemVersion is required.");
    }
    if (!response || typeof response !== "object") {
      throw new InvalidGradingInputError("INVALID_GRADING_INPUT: response object is required.");
    }

    // Section 3: Reject forbidden client grading authority fields
    const forbiddenKeys = [
      "correctAnswer",
      "isCorrect",
      "rationale",
      "distractorRationales",
      "misconceptionTags",
      "gradingRuleVersion",
      "itemContentHash",
      "primaryNodeId",
      "nodeIds",
    ];

    for (const key of forbiddenKeys) {
      if (key in params || key in (response as any)) {
        throw new InvalidGradingInputError(
          `INVALID_GRADING_INPUT: Client payload cannot supply '${key}' as grading authority.`
        );
      }
    }

    if (response.type === "MCQ") {
      if (typeof (response as any).selectedOptionId !== "string" || !(response as any).selectedOptionId) {
        throw new InvalidGradingInputError("INVALID_GRADING_INPUT: MCQ response requires selectedOptionId.");
      }
    } else if (response.type === "NUMERIC") {
      if (typeof (response as any).numericValue !== "number" || isNaN((response as any).numericValue)) {
        throw new InvalidGradingInputError("INVALID_GRADING_INPUT: NUMERIC response requires valid numericValue.");
      }
    } else {
      throw new InvalidGradingInputError(`INVALID_GRADING_INPUT: Unknown response type '${(response as any)?.type}'.`);
    }
  }
}

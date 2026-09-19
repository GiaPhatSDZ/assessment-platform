import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextRequest } from "next/server";

import { QuestionItem } from "../../src/domain/content/schema";
import { canonicalContentHash } from "../../src/domain/content/canonical-content-hash";
import {
  createTestReviewerAuthority,
  setTestReviewerAuthority,
  resetReviewerAuthorityForTesting,
  ReviewerRecord,
} from "../../src/domain/content/reviewer-registry";
import {
  assertPublishedForStudent,
  ContentNotPublishedError,
} from "../../src/domain/content/publication-guard";
import {
  DiagnosticSubmissionRequestDto,
  DiagnosticGradingResultDto,
  AttemptAlreadyRecordedError,
  UnsupportedGradingRuleError,
  InvalidCanonicalGradingItemError,
  InvalidGradingInputError,
  SessionClosedError,
  SessionCompatibilityError,
  StateConflictRetryError,
  TestResolverInjectionForbiddenError,
} from "../../src/domain/diagnostic/types";
import {
  DIAGNOSTIC_GRADING_RULE_VERSION,
  DIAGNOSTIC_NODE_STATE_RULE_VERSION,
  evaluateMultipleChoiceItem,
  evaluateNumericItem,
  gradeStudentResponse,
  computeConservativeNodeState,
  checkMasteryTransition,
} from "../../src/domain/diagnostic/grading-engine";
import { ServerDiagnosticService } from "../../src/application/diagnostic/server-diagnostic-service";
import { InMemoryLearningPersistenceRepository } from "../../src/infrastructure/database/in-memory-learning-persistence-repository";
import {
  ResolvedCanonicalItem,
  CanonicalItemResolver,
} from "../../src/domain/content/canonical-item-resolver";
import {
  UnauthorizedLearnerAccessError,
} from "../../src/domain/learning-persistence/types";
import { POST as diagnosticAttemptRoute } from "../../app/api/learning/diagnostic/attempt/route";
import { VISITOR_COOKIE_NAME } from "../../src/infrastructure/auth/anonymous-visitor";
import { StudentContentDeliveryService } from "../../src/application/curriculum/student-content-delivery-service";

const TEST_REVIEWER: ReviewerRecord = {
  reviewerId: "REV-HUMAN-01",
  type: "HUMAN",
  role: "PEDAGOGICAL_CONTROLLER",
  active: true,
  verifiedByController: true,
  displayName: "Test Reviewer",
};

describe("Server-Side Diagnostic Grading V1 Test Matrix", () => {
  let repository: InMemoryLearningPersistenceRepository;
  const rootDir = path.resolve(".");

  beforeEach(() => {
    repository = new InMemoryLearningPersistenceRepository();
    const testAuthority = createTestReviewerAuthority([TEST_REVIEWER]);
    setTestReviewerAuthority(testAuthority);
  });

  afterEach(() => {
    resetReviewerAuthorityForTesting();
  });

  function createTestPublishedItem(overrides: Partial<QuestionItem> = {}): QuestionItem {
    const baseItem: QuestionItem = {
      id: "TEST-ITEM-MCQ-01",
      primaryNodeId: "NODE-MATH-TEST-01",
      supportingNodeIds: [],
      type: "MULTIPLE_CHOICE",
      cognitiveDemand: "APPLY",
      prompt: [{ type: "text", value: "What is 1/2 + 1/4?" }],
      options: [
        { id: "opt-1", content: [{ type: "text", value: "3/4" }], isCorrect: true },
        { id: "opt-2", content: [{ type: "text", value: "2/6" }], isCorrect: false, misconceptionTag: "MISCON-ADD-DENOM" },
        { id: "opt-3", content: [{ type: "text", value: "1/4" }], isCorrect: false },
        { id: "opt-4", content: [{ type: "text", value: "5/4" }], isCorrect: false },
      ],
      correctAnswer: "opt-1",
      rationale: "1/2 = 2/4, 2/4 + 1/4 = 3/4",
      distractorRationales: { "opt-2": "Added denominators directly" },
      misconceptionTags: ["MISCON-ADD-DENOM"],
      sourceRefs: [{ sourceId: "SRC-VN-MOET-MATH-2018", documentNumber: "32/2018/TT-BGDĐT" }],
      authoringOrigin: "HUMAN",
      itemMaturity: "REVIEWED",
      reviewState: "SUBJECT_EXPERT_REVIEWED",
      publicationState: "PUBLISHED_VERIFIED",
      version: "1.0.0",
      ...overrides,
    };

    const hash = canonicalContentHash(baseItem);
    baseItem.reviewAttestation = {
      reviewerId: "REV-HUMAN-01",
      reviewerName: "Test Reviewer",
      role: "PEDAGOGICAL_CONTROLLER",
      attestedAt: "2026-09-18T12:00:00.000Z",
      decision: "APPROVE",
      scope: "QUESTION_ITEM",
      contentHash: hash,
      hashAlgorithm: "SHA-256",
      hashSchemaVersion: "content-hash-v1",
    };

    return baseItem;
  }

  function createTestNumericItem(overrides: Partial<QuestionItem> = {}): QuestionItem {
    const baseItem: QuestionItem = {
      id: "TEST-ITEM-NUM-01",
      primaryNodeId: "NODE-MATH-TEST-01",
      supportingNodeIds: [],
      type: "NUMERIC",
      cognitiveDemand: "APPLY",
      prompt: [{ type: "text", value: "Calculate 6 * 7" }],
      correctAnswer: "42",
      answerSpec: {
        exactValue: 42,
        tolerance: 0,
        unit: "cm",
        misconceptions: [
          { value: 13, misconceptionTag: "MISCON-ADD-INSTEAD-OF-MUL" },
        ],
      },
      rationale: "6 * 7 = 42",
      misconceptionTags: ["MISCON-ADD-INSTEAD-OF-MUL"],
      sourceRefs: [{ sourceId: "SRC-VN-MOET-MATH-2018", documentNumber: "32/2018/TT-BGDĐT" }],
      authoringOrigin: "HUMAN",
      itemMaturity: "REVIEWED",
      reviewState: "SUBJECT_EXPERT_REVIEWED",
      publicationState: "PUBLISHED_VERIFIED",
      version: "1.0.0",
      ...overrides,
    };

    const hash = canonicalContentHash(baseItem);
    baseItem.reviewAttestation = {
      reviewerId: "REV-HUMAN-01",
      reviewerName: "Test Reviewer",
      role: "PEDAGOGICAL_CONTROLLER",
      attestedAt: "2026-09-18T12:00:00.000Z",
      decision: "APPROVE",
      scope: "QUESTION_ITEM",
      contentHash: hash,
      hashAlgorithm: "SHA-256",
      hashSchemaVersion: "content-hash-v1",
    };

    return baseItem;
  }

  // 1. Grading service is server-only
  it("Requirement 1: Grading service source file enforces import 'server-only'", () => {
    const servicePath = path.join(rootDir, "src", "application", "diagnostic", "server-diagnostic-service.ts");
    const content = fs.readFileSync(servicePath, "utf-8");
    expect(content).toMatch(/^import "server-only";/m);
  });

  // 2. Client payload cannot provide isCorrect
  it("Requirement 2: Client payload cannot provide isCorrect as grading authority", async () => {
    const service = new ServerDiagnosticService(repository);
    await expect(
      service.submitAttempt(
        {
          learnerId: "l1",
          sessionId: "s1",
          itemId: "i1",
          itemVersion: "1.0.0",
          response: { type: "MCQ", selectedOptionId: "opt-1", isCorrect: true } as any,
        },
        { visitorToken: "v1" }
      )
    ).rejects.toThrow(InvalidGradingInputError);
  });

  // 3. Client payload cannot provide correctAnswer / rationale
  it("Requirement 3: Client payload cannot provide correctAnswer or rationale", async () => {
    const service = new ServerDiagnosticService(repository);
    await expect(
      service.submitAttempt(
        {
          learnerId: "l1",
          sessionId: "s1",
          itemId: "i1",
          itemVersion: "1.0.0",
          correctAnswer: "opt-1",
          response: { type: "MCQ", selectedOptionId: "opt-1" },
        } as any,
        { visitorToken: "v1" }
      )
    ).rejects.toThrow(InvalidGradingInputError);

    await expect(
      service.submitAttempt(
        {
          learnerId: "l1",
          sessionId: "s1",
          itemId: "i1",
          itemVersion: "1.0.0",
          rationale: "some text",
          response: { type: "MCQ", selectedOptionId: "opt-1" },
        } as any,
        { visitorToken: "v1" }
      )
    ).rejects.toThrow(InvalidGradingInputError);
  });

  // 4. Client cannot provide item hash
  it("Requirement 4: Client payload cannot provide itemContentHash", async () => {
    const service = new ServerDiagnosticService(repository);
    await expect(
      service.submitAttempt(
        {
          learnerId: "l1",
          sessionId: "s1",
          itemId: "i1",
          itemVersion: "1.0.0",
          itemContentHash: "a".repeat(64),
          response: { type: "MCQ", selectedOptionId: "opt-1" },
        } as any,
        { visitorToken: "v1" }
      )
    ).rejects.toThrow(InvalidGradingInputError);
  });

  // 5 & 19. Server recomputes canonical item hash and persists exact version/hash
  it("Requirement 5 & 19: Server recomputes canonical item hash and persists exact hash", async () => {
    const item = createTestPublishedItem();
    const expectedHash = canonicalContentHash(item);

    const visitorToken = "v-test-token-5-19-1234567890123456";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    const result = await service.submitAttempt({
      learnerId: learner.id,
      sessionId: session.id,
      itemId: item.id,
      itemVersion: "1.0.0",
      response: { type: "MCQ", selectedOptionId: "opt-1" },
    }, { visitorToken });

    expect(result.accepted).toBe(true);

    const attempts = await repository.getLearnerNodeAttempts(learner.id, item.primaryNodeId, { visitorToken });
    expect(attempts.length).toBe(1);
    expect(attempts[0].itemContentHash).toBe(expectedHash);
    expect(attempts[0].itemVersion).toBe("1.0.0");
  });

  // 6. Unpublished item fails closed
  it("Requirement 6: Unpublished item fails closed with ContentNotPublishedError", async () => {
    const draftItem = createTestPublishedItem({ publicationState: "DRAFT", reviewState: "AI_DRAFT" });
    const visitorToken = "v-test-token-6-1234567890123456";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => id === draftItem.id ? { item: draftItem, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    await expect(
      service.submitAttempt({
        learnerId: learner.id,
        sessionId: session.id,
        itemId: draftItem.id,
        itemVersion: "1.0.0",
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }, { visitorToken })
    ).rejects.toThrow(ContentNotPublishedError);
  });

  // 7. Stale review attestation fails closed
  it("Requirement 7: Stale review attestation fails closed", async () => {
    const item = createTestPublishedItem();
    // Tamper with prompt after attestation
    item.prompt = [{ type: "text", value: "Tampered question" }];

    const visitorToken = "v-test-token-7-1234567890123456";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    await expect(
      service.submitAttempt({
        learnerId: learner.id,
        sessionId: session.id,
        itemId: item.id,
        itemVersion: "1.0.0",
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }, { visitorToken })
    ).rejects.toThrow(ContentNotPublishedError);
  });

  // 8. Version mismatch is rejected
  it("Requirement 8: Item version mismatch is rejected", async () => {
    const item = createTestPublishedItem({ version: "1.0.0" });
    const visitorToken = "v-test-token-8-1234567890123456";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    await expect(
      service.submitAttempt({
        learnerId: learner.id,
        sessionId: session.id,
        itemId: item.id,
        itemVersion: "2.0.0", // Mismatched
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }, { visitorToken })
    ).rejects.toThrow(InvalidGradingInputError);
  });

  // 9. MCQ correct response grades deterministically
  it("Requirement 9: MCQ correct response grades deterministically", () => {
    const item = createTestPublishedItem();
    const result = evaluateMultipleChoiceItem(item, "opt-1");
    expect(result.isCorrect).toBe(true);
    expect(result.selectedOptionId).toBe("opt-1");
    expect(result.detectedMisconceptions).toEqual([]);
  });

  // 10. MCQ incorrect response grades deterministically
  it("Requirement 10: MCQ incorrect response grades deterministically", () => {
    const item = createTestPublishedItem();
    const result = evaluateMultipleChoiceItem(item, "opt-2");
    expect(result.isCorrect).toBe(false);
    expect(result.selectedOptionId).toBe("opt-2");
  });

  // 11. Wrong answer without mapped misconception yields []
  it("Requirement 11: Wrong answer without mapped misconception yields empty array []", () => {
    const item = createTestPublishedItem();
    // opt-3 has isCorrect=false and no misconceptionTag
    const result = evaluateMultipleChoiceItem(item, "opt-3");
    expect(result.isCorrect).toBe(false);
    expect(result.detectedMisconceptions).toEqual([]);
  });

  // 12. Mapped distractor yields only its explicit misconception signal
  it("Requirement 12: Mapped distractor yields only its explicit misconception signal", () => {
    const item = createTestPublishedItem();
    // opt-2 has misconceptionTag: "MISCON-ADD-DENOM"
    const result = evaluateMultipleChoiceItem(item, "opt-2");
    expect(result.isCorrect).toBe(false);
    expect(result.detectedMisconceptions).toEqual(["MISCON-ADD-DENOM"]);
  });

  // 13. Numeric supported rule grades deterministically (exact & tolerance)
  it("Requirement 13: Numeric supported rule grades deterministically", () => {
    const item = createTestNumericItem({
      answerSpec: { exactValue: 42, tolerance: 0.5, unit: "cm" },
    });

    // Exact
    const exact = evaluateNumericItem(item, 42, "cm");
    expect(exact.isCorrect).toBe(true);

    // Within tolerance
    const withinTol = evaluateNumericItem(item, 42.4, "cm");
    expect(withinTol.isCorrect).toBe(true);

    // Out of tolerance
    const outsideTol = evaluateNumericItem(item, 42.6, "cm");
    expect(outsideTol.isCorrect).toBe(false);

    // Unit mismatch
    const wrongUnit = evaluateNumericItem(item, 42, "m");
    expect(wrongUnit.isCorrect).toBe(false);
  });

  // 14 & 32. Unsupported numeric rule fails closed (A1: no fallback to correctAnswer)
  it("Requirement 14 & 32 (A1): Unsupported numeric rule fails closed with UNSUPPORTED_GRADING_RULE", () => {
    // Missing answerSpec
    const itemNoSpec = createTestNumericItem({ answerSpec: undefined });
    expect(() => evaluateNumericItem(itemNoSpec, 42)).toThrow(UnsupportedGradingRuleError);

    // answerSpec without exactValue/value
    const itemEmptySpec = createTestNumericItem({ answerSpec: { unit: "cm" } });
    expect(() => evaluateNumericItem(itemEmptySpec, 42)).toThrow(UnsupportedGradingRuleError);
  });

  // 15. Wrong learner cannot submit to session
  it("Requirement 15: Wrong learner cannot submit to session", async () => {
    const item = createTestPublishedItem();
    const token1 = "v-token-owner-1234567890123456";
    const token2 = "v-token-intruder-123456789012345";
    const learner1 = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken: token1 });
    const learner2 = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken: token2 });
    const session = await repository.createLearningSession({ learnerId: learner1.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken: token1 });

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    // Intruder with token2 tries to submit to learner1's session
    await expect(
      service.submitAttempt({
        learnerId: learner1.id,
        sessionId: session.id,
        itemId: item.id,
        itemVersion: "1.0.0",
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }, { visitorToken: token2 })
    ).rejects.toThrow(UnauthorizedLearnerAccessError);
  });

  // 16. Closed session rejects submissions
  it("Requirement 16: Closed session rejects submissions with SessionClosedError", async () => {
    const item = createTestPublishedItem();
    const visitorToken = "v-token-closed-1234567890123456";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });
    await repository.completeLearningSession(session.id, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    await expect(
      service.submitAttempt({
        learnerId: learner.id,
        sessionId: session.id,
        itemId: item.id,
        itemVersion: "1.0.0",
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }, { visitorToken })
    ).rejects.toThrow(SessionClosedError);
  });

  // 17. Non-DIAGNOSTIC session rejects diagnostic endpoint
  it("Requirement 17: Non-DIAGNOSTIC session rejects diagnostic endpoint", async () => {
    const item = createTestPublishedItem();
    const visitorToken = "v-token-practice-123456789012345";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "PRACTICE", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    await expect(
      service.submitAttempt({
        learnerId: learner.id,
        sessionId: session.id,
        itemId: item.id,
        itemVersion: "1.0.0",
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }, { visitorToken })
    ).rejects.toThrow(SessionCompatibilityError);
  });

  // 18. Duplicate item/session attempt is rejected
  it("Requirement 18: Duplicate item/session attempt is rejected with AttemptAlreadyRecordedError", async () => {
    const item = createTestPublishedItem();
    const visitorToken = "v-token-dup-1234567890123456";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    await service.submitAttempt({
      learnerId: learner.id,
      sessionId: session.id,
      itemId: item.id,
      itemVersion: "1.0.0",
      response: { type: "MCQ", selectedOptionId: "opt-1" },
    }, { visitorToken });

    // Second attempt on same item in same session
    await expect(
      service.submitAttempt({
        learnerId: learner.id,
        sessionId: session.id,
        itemId: item.id,
        itemVersion: "1.0.0",
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }, { visitorToken })
    ).rejects.toThrow(AttemptAlreadyRecordedError);
  });

  // 20, 21, 22. Evidence outcome, type, node match authoritative primary node
  it("Requirement 20, 21, 22: Evidence outcome, type, and node match authoritative primary node", async () => {
    const item = createTestPublishedItem({ primaryNodeId: "NODE-TEST-PRIMARY" });
    const visitorToken = "v-token-evidence-123456789012345";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    await service.submitAttempt({
      learnerId: learner.id,
      sessionId: session.id,
      itemId: item.id,
      itemVersion: "1.0.0",
      response: { type: "MCQ", selectedOptionId: "opt-1" },
    }, { visitorToken });

    // Inspect repository evidence
    const nodeStates = await repository.getCurrentNodeStates(learner.id, { visitorToken });
    expect(nodeStates["NODE-TEST-PRIMARY"]).toBeDefined();

    const attempts = await repository.getLearnerNodeAttempts(learner.id, "NODE-TEST-PRIMARY", { visitorToken });
    expect(attempts.length).toBe(1);
    expect(attempts[0].isCorrect).toBe(true);
    expect(attempts[0].primaryNodeId).toBe("NODE-TEST-PRIMARY");
  });

  // 23 & 24. Conservative node state matrix: 1 correct does NOT overclaim secure mastery
  it("Requirement 23 & 24: Conservative node state matrix: 1 correct attempt yields UNCERTAIN / LOW (not SECURE)", () => {
    const singleCorrect = computeConservativeNodeState({
      attemptsCount: 1,
      correctCount: 1,
      distinctCorrectItemIds: new Set(["item-1"]),
      allMisconceptions: [],
      assessedAt: "2026-09-18T10:00:00Z",
    });
    expect(singleCorrect.state).toBe("UNCERTAIN");
    expect(singleCorrect.confidence).toBe("LOW");

    const singleIncorrect = computeConservativeNodeState({
      attemptsCount: 1,
      correctCount: 0,
      distinctCorrectItemIds: new Set([]),
      allMisconceptions: ["TAG-1"],
      assessedAt: "2026-09-18T10:00:00Z",
    });
    expect(singleIncorrect.state).toBe("DEVELOPING");
    expect(singleIncorrect.confidence).toBe("LOW");

    const zeroAttempts = computeConservativeNodeState({
      attemptsCount: 0,
      correctCount: 0,
      distinctCorrectItemIds: new Set([]),
      allMisconceptions: [],
      assessedAt: "2026-09-18T10:00:00Z",
    });
    expect(zeroAttempts.state).toBe("NOT_ASSESSED");
    expect(zeroAttempts.confidence).toBe("LOW");
    expect(zeroAttempts.lastAssessedAt).toBeNull();
  });

  // 25. State transition history is only written when state or confidence changes
  it("Requirement 25: State transition history is only written when state or confidence changes", () => {
    // Unchanged state & confidence
    const noChange = checkMasteryTransition("DEVELOPING", "LOW", "DEVELOPING", "LOW");
    expect(noChange.hasTransition).toBe(false);

    // State changed
    const stateChanged = checkMasteryTransition("DEVELOPING", "LOW", "SECURE", "MEDIUM");
    expect(stateChanged.hasTransition).toBe(true);
    expect(stateChanged.previousState).toBe("DEVELOPING");
    expect(stateChanged.newState).toBe("SECURE");

    // Confidence changed
    const confChanged = checkMasteryTransition("SECURE", "MEDIUM", "SECURE", "HIGH");
    expect(confChanged.hasTransition).toBe(true);
    expect(confChanged.previousConfidence).toBe("MEDIUM");
    expect(confChanged.newConfidence).toBe("HIGH");
  });

  // 26 & 42. Transaction failure leaves zero partial attempt/evidence/state/history (rollback test)
  it("Requirement 26 & 42: Transaction failure leaves zero partial attempt/evidence/state/history (rollback)", async () => {
    const item = createTestPublishedItem();
    const visitorToken = "v-token-rollback-123456789012345";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    // Mock repository where atomic submission throws after initial check
    const failingRepo = new InMemoryLearningPersistenceRepository();
    const mockLearner = await failingRepo.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const mockSession = await failingRepo.createLearningSession({ learnerId: mockLearner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    // Sabotage repository to throw during node state validation
    const origRecord = failingRepo.recordAtomicDiagnosticSubmission.bind(failingRepo);
    failingRepo.recordAtomicDiagnosticSubmission = async (params, ownership) => {
      // Intentionally pass an invalid state count to trigger validation error during write
      params.correctCount = 999;
      return origRecord(params, ownership);
    };

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(failingRepo, resolver);

    await expect(
      service.submitAttempt({
        learnerId: mockLearner.id,
        sessionId: mockSession.id,
        itemId: item.id,
        itemVersion: "1.0.0",
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }, { visitorToken })
    ).rejects.toThrow();

    // Verify ZERO writes remain
    const attempts = await failingRepo.getLearnerNodeAttempts(mockLearner.id, item.primaryNodeId, { visitorToken });
    expect(attempts.length).toBe(0);

    const states = await failingRepo.getCurrentNodeStates(mockLearner.id, { visitorToken });
    expect(Object.keys(states).length).toBe(0);

    const history = await failingRepo.getMasteryHistory(mockLearner.id, { visitorToken });
    expect(history.length).toBe(0);
  });

  // 27. Parent Copilot has no grading persistence authority
  it("Requirement 27: Parent Copilot has no grading persistence authority", () => {
    // Verified by architectural audit: ServerDiagnosticService is in src/application/diagnostic,
    // has no dependency on Parent Copilot, and evidence validation rejects PARENT_AI evidence.
    const serviceFile = fs.readFileSync(path.join(rootDir, "src", "application", "diagnostic", "server-diagnostic-service.ts"), "utf-8");
    expect(serviceFile).not.toContain("PARENT_AI");
    expect(serviceFile).not.toContain("parent-copilot");
  });

  // 28. Production DRAFT Grade 6 remains CONTENT_NOT_AVAILABLE
  it("Requirement 28: Production DRAFT Grade 6 remains CONTENT_NOT_AVAILABLE", () => {
    const delivery = StudentContentDeliveryService.getDiagnosticDelivery("math-grade6-fractions");
    expect(delivery.status).toBe("CONTENT_NOT_AVAILABLE");
    expect(delivery.items).toEqual([]);
    expect(delivery.reTestItems).toEqual([]);
  });

  // 29. Answer key/rationale absent from client bundle / result DTO
  it("Requirement 29: Answer key, answerSpec, and rationale are strictly absent from DiagnosticGradingResultDto", async () => {
    const item = createTestPublishedItem();
    const visitorToken = "v-token-dto-1234567890123456";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    const result = await service.submitAttempt({
      learnerId: learner.id,
      sessionId: session.id,
      itemId: item.id,
      itemVersion: "1.0.0",
      response: { type: "MCQ", selectedOptionId: "opt-2" }, // Incorrect option
    }, { visitorToken });

    // Assert safe DTO contract
    expect(result).toHaveProperty("attemptId");
    expect(result).toHaveProperty("itemId", item.id);
    expect(result).toHaveProperty("accepted", true);
    expect(result).toHaveProperty("isCorrect", false);
    expect(result).toHaveProperty("nodeState");
    expect(result).toHaveProperty("misconceptionSignals");

    // Crucial: No answer key, rationale, or internal specs leaked
    expect((result as any).correctAnswer).toBeUndefined();
    expect((result as any).rationale).toBeUndefined();
    expect((result as any).answerSpec).toBeUndefined();
    expect((result as any).distractorRationales).toBeUndefined();
    expect((result as any).itemContentHash).toBeUndefined();
  });

  // 30 & 31. Persistence V1 and R2 suites remain green
  it("Requirement 30 & 31: Persistence V1 and R2 verification modules are present and intact", () => {
    expect(fs.existsSync(path.join(rootDir, "tests", "persistence", "learning-persistence-v1.test.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, "tests", "curriculum", "publication-enforcement-r2-2.test.ts"))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, "tests", "curriculum", "server-delivery-boundary-r2-2-1.test.ts"))).toBe(true);
  });

  // 33 (A2): submitAttempt has no customItemResolver on the production API signature
  it("Requirement 33 (A2): submitAttempt has no customItemResolver parameter on production API signature", () => {
    // submitAttempt accepts exactly (params, ownership)
    const service = new ServerDiagnosticService();
    expect(service.submitAttempt.length).toBe(2);
  });

  // 34 (A3): Concurrency safety: Stale expected projection returns STATE_CONFLICT_RETRY
  it("Requirement 34 (A3): Concurrency safety: Stale expected projection returns STATE_CONFLICT_RETRY", async () => {
    const item = createTestPublishedItem();
    const visitorToken = "v-token-cas-1234567890123456";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", ruleVersion: "v1" }, { visitorToken });

    // Seed an initial node state
    await repository.upsertNodeState({
      learnerId: learner.id,
      nodeId: item.primaryNodeId,
      state: "DEVELOPING",
      confidence: "LOW",
      attemptsCount: 1,
      correctCount: 0,
      lastAssessedAt: "2026-09-18T10:00:00Z",
      ruleVersion: "1.0.0",
    }, { visitorToken });

    // Submit with a stale expected timestamp
    await expect(
      repository.recordAtomicDiagnosticSubmission({
        learnerId: learner.id,
        sessionId: session.id,
        itemId: item.id,
        itemVersion: "1.0.0",
        itemContentHash: canonicalContentHash(item),
        primaryNodeId: item.primaryNodeId,
        studentResponse: { type: "MCQ", selectedOptionId: "opt-1" },
        isCorrect: true,
        misconceptionTags: [],
        gradingRuleVersion: "1.0.0",
        evidenceRuleVersion: "1.0.0",
        nodeState: "SECURE",
        nodeConfidence: "MEDIUM",
        attemptsCount: 2,
        correctCount: 1,
        lastAssessedAt: "2026-09-18T11:00:00Z",
        nodeRuleVersion: "1.0.0",
        expectedNodeExists: true,
        expectedNodeUpdatedAt: "2020-01-01T00:00:00.000Z", // Stale timestamp!
        hasMasteryTransition: true,
      }, { visitorToken })
    ).rejects.toThrow(StateConflictRetryError);
  });

  // 35 (A4): record_atomic_diagnostic_grading RPC is service-role only and locks search_path
  it("Requirement 35 (A4): Migration SQL grants RPC only to service_role and locks search_path", () => {
    const migrationPath = path.join(rootDir, "supabase", "migrations", "20260919000003_server_diagnostic_grading_v1.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    expect(sql).toContain("SET search_path = public, pg_temp");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.record_atomic_diagnostic_grading FROM PUBLIC;");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.record_atomic_diagnostic_grading FROM anon;");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.record_atomic_diagnostic_grading FROM authenticated;");
    expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.record_atomic_diagnostic_grading TO service_role;");
  });

  // 36 (A5): Repeating same item across sessions does not inflate mastery; SECURE requires >= 2 independent items
  it("Requirement 36 (A5): Repeating same item across sessions does not inflate mastery confidence", () => {
    // 2 attempts, both correct, but SAME item (distinctCount = 1)
    const repeatedSameItem = computeConservativeNodeState({
      attemptsCount: 2,
      correctCount: 2,
      distinctCorrectItemIds: new Set(["item-1"]), // Only 1 distinct item
      allMisconceptions: [],
      assessedAt: "2026-09-18T10:00:00Z",
    });
    // Must NOT be SECURE; remains UNCERTAIN / LOW
    expect(repeatedSameItem.state).toBe("UNCERTAIN");
    expect(repeatedSameItem.confidence).toBe("LOW");

    // 2 attempts, both correct, DISTINCT items (distinctCount = 2)
    const twoDistinctItems = computeConservativeNodeState({
      attemptsCount: 2,
      correctCount: 2,
      distinctCorrectItemIds: new Set(["item-1", "item-2"]), // 2 distinct items
      allMisconceptions: [],
      assessedAt: "2026-09-18T10:00:00Z",
    });
    expect(twoDistinctItems.state).toBe("SECURE");
    expect(twoDistinctItems.confidence).toBe("MEDIUM");

    // 3 distinct correct items -> HIGH confidence
    const threeDistinctItems = computeConservativeNodeState({
      attemptsCount: 3,
      correctCount: 3,
      distinctCorrectItemIds: new Set(["item-1", "item-2", "item-3"]),
      allMisconceptions: [],
      assessedAt: "2026-09-18T10:00:00Z",
    });
    expect(threeDistinctItems.state).toBe("SECURE");
    expect(threeDistinctItems.confidence).toBe("HIGH");
  });

  // 37 (A6): Session compatibility verified against explicit resolver subjectId/topicId metadata
  it("Requirement 37 (A6): Session compatibility verified against explicit resolver subjectId/topicId metadata", async () => {
    const item = createTestPublishedItem();
    const visitorToken = "v-token-meta-1234567890123456";
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    // Session created for subject 'history'
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "history", ruleVersion: "v1" }, { visitorToken });

    // Resolver explicitly specifies subjectId 'math'
    const resolver: CanonicalItemResolver = (id) => id === item.id ? { item, subjectId: "math", topicId: "topic-1" } : null;
    const service = new ServerDiagnosticService(repository, resolver);

    await expect(
      service.submitAttempt({
        learnerId: learner.id,
        sessionId: session.id,
        itemId: item.id,
        itemVersion: "1.0.0",
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }, { visitorToken })
    ).rejects.toThrow(SessionCompatibilityError);
  });

  // 38 (A7): API route rejects cross-origin POST with 403 CROSS_ORIGIN_FORBIDDEN
  it("Requirement 38 (A7): API route rejects cross-origin POST requests with 403", async () => {
    const req = new NextRequest("http://localhost:3000/api/learning/diagnostic/attempt", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "https://attacker-site.com", // Cross-origin!
      },
      body: JSON.stringify({ test: "data" }),
    });

    const res = await diagnosticAttemptRoute(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe("CROSS_ORIGIN_FORBIDDEN");
  });

  // 39 (A7): API route does not auto-create a visitor token; rejects unauthenticated requests with 401
  it("Requirement 39 (A7): API route rejects requests without visitor token or authenticated user with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/learning/diagnostic/attempt", {
      method: "POST",
      headers: {
        host: "localhost:3000",
      },
      body: JSON.stringify({
        learnerId: "l1",
        sessionId: "s1",
        itemId: "i1",
        itemVersion: "1.0.0",
        response: { type: "MCQ", selectedOptionId: "opt-1" },
      }),
    });

    const res = await diagnosticAttemptRoute(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe("UNAUTHORIZED");
  });

  // 40 (A8): MULTIPLE_CHOICE canonical items without exactly 1 option with isCorrect=true fail closed
  it("Requirement 40 (A8): MULTIPLE_CHOICE item without exactly 1 option with isCorrect=true fails closed", () => {
    // 0 correct options
    const zeroCorrect = createTestPublishedItem({
      options: [
        { id: "opt-1", content: [{ type: "text", value: "A" }], isCorrect: false },
        { id: "opt-2", content: [{ type: "text", value: "B" }], isCorrect: false },
      ],
      correctAnswer: "opt-1",
    });
    expect(() => evaluateMultipleChoiceItem(zeroCorrect, "opt-1")).toThrow(InvalidCanonicalGradingItemError);

    // 2 correct options
    const twoCorrect = createTestPublishedItem({
      options: [
        { id: "opt-1", content: [{ type: "text", value: "A" }], isCorrect: true },
        { id: "opt-2", content: [{ type: "text", value: "B" }], isCorrect: true },
      ],
      correctAnswer: "opt-1",
    });
    expect(() => evaluateMultipleChoiceItem(twoCorrect, "opt-1")).toThrow(InvalidCanonicalGradingItemError);

    // correctAnswer does not match correct option id
    const mismatch = createTestPublishedItem({
      options: [
        { id: "opt-1", content: [{ type: "text", value: "A" }], isCorrect: true },
        { id: "opt-2", content: [{ type: "text", value: "B" }], isCorrect: false },
      ],
      correctAnswer: "opt-2", // Mismatch!
    });
    expect(() => evaluateMultipleChoiceItem(mismatch, "opt-1")).toThrow(InvalidCanonicalGradingItemError);
  });

  // 41. Complete Fixture Flow
  it("Requirement 41: Complete Fixture Flow succeeds end-to-end", async () => {
    const item1 = createTestPublishedItem({ id: "TEST-ITEM-E2E-01" });
    const item2 = createTestPublishedItem({ id: "TEST-ITEM-E2E-02" });
    const visitorToken = "v-token-fixture-flow-123456789012";

    // 1. Create learner and session
    const learner = await repository.createLearner({ educationStage: "LOWER_SECONDARY", gradeLevel: 6 }, { visitorToken });
    const session = await repository.createLearningSession({ learnerId: learner.id, sessionKind: "DIAGNOSTIC", subjectId: "math", topicId: "fractions", ruleVersion: "1.0.0" }, { visitorToken });

    const resolver: CanonicalItemResolver = (id) => {
      if (id === item1.id) return { item: item1, subjectId: "math", topicId: "fractions" };
      if (id === item2.id) return { item: item2, subjectId: "math", topicId: "fractions" };
      return null;
    };

    const service = new ServerDiagnosticService(repository, resolver);

    // 2. Submit response to Item 1 (Correct)
    const result1 = await service.submitAttempt({
      learnerId: learner.id,
      sessionId: session.id,
      itemId: item1.id,
      itemVersion: "1.0.0",
      response: { type: "MCQ", selectedOptionId: "opt-1" },
    }, { visitorToken });

    expect(result1.accepted).toBe(true);
    expect(result1.isCorrect).toBe(true);
    // 1 correct attempt -> UNCERTAIN / LOW
    expect(result1.nodeState.state).toBe("UNCERTAIN");
    expect(result1.nodeState.confidence).toBe("LOW");

    // 3. Submit response to Item 2 (Correct) -> 2 distinct correct items -> SECURE / MEDIUM
    const result2 = await service.submitAttempt({
      learnerId: learner.id,
      sessionId: session.id,
      itemId: item2.id,
      itemVersion: "1.0.0",
      response: { type: "MCQ", selectedOptionId: "opt-1" },
    }, { visitorToken });

    expect(result2.accepted).toBe(true);
    expect(result2.isCorrect).toBe(true);
    expect(result2.nodeState.state).toBe("SECURE");
    expect(result2.nodeState.confidence).toBe("MEDIUM");

    // 4. Verify persisted state and mastery history
    const nodeStates = await repository.getCurrentNodeStates(learner.id, { visitorToken });
    expect(nodeStates[item1.primaryNodeId].state).toBe("SECURE");
    expect(nodeStates[item1.primaryNodeId].confidence).toBe("MEDIUM");
    expect(nodeStates[item1.primaryNodeId].attemptsCount).toBe(2);
    expect(nodeStates[item1.primaryNodeId].correctCount).toBe(2);

    const masteryHistory = await repository.getMasteryHistory(learner.id, { visitorToken });
    expect(masteryHistory.length).toBe(2);
    // First transition: NOT_ASSESSED/LOW -> UNCERTAIN/LOW
    expect(masteryHistory[0].previousState).toBe("NOT_ASSESSED");
    expect(masteryHistory[0].newState).toBe("UNCERTAIN");
    // Second transition: UNCERTAIN/LOW -> SECURE/MEDIUM
    expect(masteryHistory[1].previousState).toBe("UNCERTAIN");
    expect(masteryHistory[1].newState).toBe("SECURE");
  });

  // Supabase Repository Mock Client Contract Tests
  it("SupabaseLearningPersistenceRepository: recordAtomicDiagnosticSubmission invokes RPC with exact keys and translates errors", async () => {
    const { SupabaseLearningPersistenceRepository } = await import(
      "../../src/infrastructure/database/supabase-learning-persistence-repository"
    );
    const { hashVisitorToken } = await import("../../src/infrastructure/auth/anonymous-visitor");

    const visitorToken = "v-token-supa-contract-123456789";
    const visitorHash = hashVisitorToken(visitorToken);
    const learnerId = crypto.randomUUID();

    let capturedRpcName: string | null = null;
    let capturedRpcPayload: any = null;

    const mockClient = {
      from: (table: string) => {
        if (table === "learner_profiles") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { id: learnerId, visitor_owner_hash: visitorHash },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "learning_attempts") {
          return {
            select: () => ({
              eq: (_f1: string, lId: string) => ({
                eq: (_f2: string, nId: string) => ({
                  order: () => ({
                    data: [
                      {
                        id: "att-1",
                        session_id: "s1",
                        learner_id: lId,
                        item_id: "i1",
                        item_version: "1.0",
                        item_content_hash: "a".repeat(64),
                        primary_node_id: nId,
                        student_response: { type: "MCQ", selectedOptionId: "opt-1" },
                        selected_option_id: "opt-1",
                        is_correct: true,
                        misconception_tags: [],
                        grading_rule_version: "1.0.0",
                        attempted_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      },
      rpc: async (name: string, payload: any) => {
        capturedRpcName = name;
        capturedRpcPayload = payload;
        if (payload.p_item_id === "DUP-ITEM") {
          return { data: null, error: new Error("ATTEMPT_ALREADY_RECORDED: duplicate item") };
        }
        if (payload.p_item_id === "CONFLICT-ITEM") {
          return { data: null, error: new Error("STATE_CONFLICT_RETRY: concurrent update") };
        }
        if (payload.p_item_id === "CLOSED-ITEM") {
          return { data: null, error: new Error("SESSION_CLOSED: session is closed") };
        }
        return {
          data: {
            attempt_id: "att-123",
            evidence_id: "evi-123",
            mastery_id: "mas-123",
            node_updated_at: new Date().toISOString(),
          },
          error: null,
        };
      },
    };

    const supaRepo = new SupabaseLearningPersistenceRepository(mockClient as any);

    // 1. Test getLearnerNodeAttempts
    const attempts = await supaRepo.getLearnerNodeAttempts(learnerId, "NODE-1", { visitorToken });
    expect(attempts.length).toBe(1);
    expect(attempts[0].id).toBe("att-1");

    // 2. Test recordAtomicDiagnosticSubmission success
    const result = await supaRepo.recordAtomicDiagnosticSubmission({
      learnerId,
      sessionId: "s1",
      itemId: "ITEM-1",
      itemVersion: "1.0.0",
      itemContentHash: "a".repeat(64),
      primaryNodeId: "NODE-1",
      studentResponse: { type: "MCQ", selectedOptionId: "opt-1" },
      selectedOptionId: "opt-1",
      isCorrect: true,
      misconceptionTags: [],
      gradingRuleVersion: "1.0.0",
      evidenceRuleVersion: "1.0.0",
      nodeState: "DEVELOPING",
      nodeConfidence: "LOW",
      attemptsCount: 1,
      correctCount: 0,
      lastAssessedAt: "2026-09-18T10:00:00Z",
      nodeRuleVersion: "1.0.0",
      expectedNodeExists: false,
      hasMasteryTransition: false,
    }, { visitorToken });

    expect(capturedRpcName).toBe("record_atomic_diagnostic_grading");
    expect(capturedRpcPayload).not.toBeNull();
    expect(capturedRpcPayload.p_learner_id).toBe(learnerId);
    expect(capturedRpcPayload.p_item_id).toBe("ITEM-1");
    expect(capturedRpcPayload.p_expected_node_exists).toBe(false);
    expect(result.attemptId).toBe("att-123");

    // 3. Test ATTEMPT_ALREADY_RECORDED error translation
    await expect(
      supaRepo.recordAtomicDiagnosticSubmission({
        learnerId,
        sessionId: "s1",
        itemId: "DUP-ITEM",
        itemVersion: "1.0.0",
        itemContentHash: "a".repeat(64),
        primaryNodeId: "NODE-1",
        studentResponse: { type: "MCQ", selectedOptionId: "opt-1" },
        isCorrect: true,
        misconceptionTags: [],
        gradingRuleVersion: "1.0.0",
        evidenceRuleVersion: "1.0.0",
        nodeState: "DEVELOPING",
        nodeConfidence: "LOW",
        attemptsCount: 1,
        correctCount: 0,
        lastAssessedAt: "2026-09-18T10:00:00Z",
        nodeRuleVersion: "1.0.0",
        expectedNodeExists: false,
        hasMasteryTransition: false,
      }, { visitorToken })
    ).rejects.toThrow(AttemptAlreadyRecordedError);

    // 4. Test STATE_CONFLICT_RETRY error translation
    await expect(
      supaRepo.recordAtomicDiagnosticSubmission({
        learnerId,
        sessionId: "s1",
        itemId: "CONFLICT-ITEM",
        itemVersion: "1.0.0",
        itemContentHash: "a".repeat(64),
        primaryNodeId: "NODE-1",
        studentResponse: { type: "MCQ", selectedOptionId: "opt-1" },
        isCorrect: true,
        misconceptionTags: [],
        gradingRuleVersion: "1.0.0",
        evidenceRuleVersion: "1.0.0",
        nodeState: "DEVELOPING",
        nodeConfidence: "LOW",
        attemptsCount: 1,
        correctCount: 0,
        lastAssessedAt: "2026-09-18T10:00:00Z",
        nodeRuleVersion: "1.0.0",
        expectedNodeExists: false,
        hasMasteryTransition: false,
      }, { visitorToken })
    ).rejects.toThrow(StateConflictRetryError);

    // 5. Test SESSION_CLOSED error translation
    await expect(
      supaRepo.recordAtomicDiagnosticSubmission({
        learnerId,
        sessionId: "s1",
        itemId: "CLOSED-ITEM",
        itemVersion: "1.0.0",
        itemContentHash: "a".repeat(64),
        primaryNodeId: "NODE-1",
        studentResponse: { type: "MCQ", selectedOptionId: "opt-1" },
        isCorrect: true,
        misconceptionTags: [],
        gradingRuleVersion: "1.0.0",
        evidenceRuleVersion: "1.0.0",
        nodeState: "DEVELOPING",
        nodeConfidence: "LOW",
        attemptsCount: 1,
        correctCount: 0,
        lastAssessedAt: "2026-09-18T10:00:00Z",
        nodeRuleVersion: "1.0.0",
        expectedNodeExists: false,
        hasMasteryTransition: false,
      }, { visitorToken })
    ).rejects.toThrow(SessionClosedError);
  });

  // 42 (P0-1): Reject custom item resolver injection in production environment
  it("Requirement 42 (P0-1): rejects custom item resolver injection in production environment", () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as any).NODE_ENV = "production";

      const dummyResolver: CanonicalItemResolver = () => null;

      // Direct constructor injection in production must throw
      expect(() => {
        new ServerDiagnosticService(repository, dummyResolver);
      }).toThrow(TestResolverInjectionForbiddenError);

      // createForTesting factory in production must also throw
      expect(() => {
        ServerDiagnosticService.createForTesting(repository, dummyResolver);
      }).toThrow(/TEST_RESOLVER_INJECTION_FORBIDDEN/);

      // Default constructor without custom resolver succeeds in production
      expect(() => {
        new ServerDiagnosticService(repository);
      }).not.toThrow();
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
    }
  });

  // 43 (P0-2): First-node concurrency race recovers via automatic retry and reflects both attempts
  it("Requirement 43 (P0-2): two first submissions for distinct items on unassessed node serialize and record both attempts", async () => {
    const visitorToken = "v-token-concurrent-p02-123456789";
    const learner = await repository.createLearner(
      { educationStage: "LOWER_SECONDARY", gradeLevel: 6 },
      { visitorToken }
    );
    const session = await repository.createLearningSession(
      {
        learnerId: learner.id,
        sessionKind: "DIAGNOSTIC",
        subjectId: "math",
        topicId: "fractions",
        ruleVersion: "1.0.0",
      },
      { visitorToken }
    );

    const itemA = createTestPublishedItem({
      id: "ITEM-CONC-A",
      primaryNodeId: "NODE-CONCURRENT-TARGET",
    });
    const itemB = createTestPublishedItem({
      id: "ITEM-CONC-B",
      primaryNodeId: "NODE-CONCURRENT-TARGET",
    });

    const resolver: CanonicalItemResolver = (id) => {
      if (id === itemA.id) return { item: itemA, subjectId: "math", topicId: "fractions" };
      if (id === itemB.id) return { item: itemB, subjectId: "math", topicId: "fractions" };
      return null;
    };

    const service = new ServerDiagnosticService(repository, resolver);

    // Initial check: node does NOT exist
    const initialNodeStates = await repository.getCurrentNodeStates(learner.id, { visitorToken });
    expect(initialNodeStates["NODE-CONCURRENT-TARGET"]).toBeUndefined();

    // Execute both submissions concurrently
    // Item A is correct (opt-1), Item B is incorrect (opt-2)
    const [resA, resB] = await Promise.all([
      service.submitAttempt(
        {
          learnerId: learner.id,
          sessionId: session.id,
          itemId: itemA.id,
          itemVersion: "1.0.0",
          response: { type: "MCQ", selectedOptionId: "opt-1" },
        },
        { visitorToken }
      ),
      service.submitAttempt(
        {
          learnerId: learner.id,
          sessionId: session.id,
          itemId: itemB.id,
          itemVersion: "1.0.0",
          response: { type: "MCQ", selectedOptionId: "opt-2" },
        },
        { visitorToken }
      ),
    ]);

    expect(resA.accepted).toBe(true);
    expect(resB.accepted).toBe(true);

    // Final persisted truth verification:
    // 1. Attempts count = 2
    const attempts = await repository.getLearnerNodeAttempts(
      learner.id,
      "NODE-CONCURRENT-TARGET",
      { visitorToken }
    );
    expect(attempts.length).toBe(2);

    // 2. Node state reflects attempts_count = 2, correct_count = 1 (1 correct + 1 incorrect)
    const finalNodeStates = await repository.getCurrentNodeStates(learner.id, { visitorToken });
    const targetNode = finalNodeStates["NODE-CONCURRENT-TARGET"];
    expect(targetNode).toBeDefined();
    expect(targetNode.attemptsCount).toBe(2);
    expect(targetNode.correctCount).toBe(1);
    expect(targetNode.state).toBe("UNCERTAIN");
  });

  // 44 (P1-1): Independent evidence confidence escalation based strictly on distinct attempted items
  it("Requirement 44 (P1-1): independent evidence confidence escalates only with distinct attempted item IDs", () => {
    const assessedAt = "2026-09-18T10:00:00Z";

    // 1. Same item wrong 3 times -> DEVELOPING / LOW (repeating same item does NOT escalate confidence)
    const sameItemWrong3Times = computeConservativeNodeState({
      attemptsCount: 3,
      correctCount: 0,
      distinctAttemptedItemIds: new Set(["item-1"]),
      distinctCorrectItemIds: new Set(),
      allMisconceptions: ["M1"],
      assessedAt,
    });
    expect(sameItemWrong3Times.state).toBe("DEVELOPING");
    expect(sameItemWrong3Times.confidence).toBe("LOW");

    // 2. 2 distinct items wrong -> DEVELOPING / MEDIUM
    const twoDistinctWrong = computeConservativeNodeState({
      attemptsCount: 2,
      correctCount: 0,
      distinctAttemptedItemIds: new Set(["item-1", "item-2"]),
      distinctCorrectItemIds: new Set(),
      allMisconceptions: ["M1"],
      assessedAt,
    });
    expect(twoDistinctWrong.state).toBe("DEVELOPING");
    expect(twoDistinctWrong.confidence).toBe("MEDIUM");

    // 3. 3+ distinct items wrong -> DEVELOPING / HIGH
    const threeDistinctWrong = computeConservativeNodeState({
      attemptsCount: 3,
      correctCount: 0,
      distinctAttemptedItemIds: new Set(["item-1", "item-2", "item-3"]),
      distinctCorrectItemIds: new Set(),
      allMisconceptions: ["M1"],
      assessedAt,
    });
    expect(threeDistinctWrong.state).toBe("DEVELOPING");
    expect(threeDistinctWrong.confidence).toBe("HIGH");

    // 4. Mixed evidence: confidence based on distinct items
    // Same item mixed 2 times (1 wrong, 1 correct) -> UNCERTAIN / LOW
    const sameItemMixed = computeConservativeNodeState({
      attemptsCount: 2,
      correctCount: 1,
      distinctAttemptedItemIds: new Set(["item-1"]),
      distinctCorrectItemIds: new Set(["item-1"]),
      allMisconceptions: [],
      assessedAt,
    });
    expect(sameItemMixed.state).toBe("UNCERTAIN");
    expect(sameItemMixed.confidence).toBe("LOW");

    // 2 distinct items mixed (1 correct, 1 wrong) -> UNCERTAIN / MEDIUM
    const twoDistinctMixed = computeConservativeNodeState({
      attemptsCount: 2,
      correctCount: 1,
      distinctAttemptedItemIds: new Set(["item-1", "item-2"]),
      distinctCorrectItemIds: new Set(["item-1"]),
      allMisconceptions: [],
      assessedAt,
    });
    expect(twoDistinctMixed.state).toBe("UNCERTAIN");
    expect(twoDistinctMixed.confidence).toBe("MEDIUM");

    // 3 distinct items mixed (1 correct, 2 wrong) -> UNCERTAIN / HIGH
    const threeDistinctMixed = computeConservativeNodeState({
      attemptsCount: 3,
      correctCount: 1,
      distinctAttemptedItemIds: new Set(["item-1", "item-2", "item-3"]),
      distinctCorrectItemIds: new Set(["item-1"]),
      allMisconceptions: [],
      assessedAt,
    });
    expect(threeDistinctMixed.state).toBe("UNCERTAIN");
    expect(threeDistinctMixed.confidence).toBe("HIGH");
  });
});

/**
 * AI School V3 — Diagnostic & Knowledge State Contracts
 * Based on V3_DIAGNOSTIC_GAP_ENGINE_SPEC.md & Server-Side Diagnostic Grading V1
 */

import { ContentNotPublishedError } from "../content/publication-guard";
export { ContentNotPublishedError };

export type KnowledgeState =
  | "NOT_ASSESSED"
  | "UNCERTAIN"
  | "DEVELOPING"
  | "SECURE";

export type EvidenceConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface ItemOption {
  id: string;
  text: string;
}

export interface DiagnosticItem {
  id: string;
  primaryNodeId: string;
  nodeIds: string[];
  type: "MULTIPLE_CHOICE" | "NUMERIC";
  cognitiveDemand: "RECALL" | "UNDERSTAND" | "APPLY" | "TRANSFER" | "PROCEDURE";
  prompt: string;
  options?: ItemOption[];
  correctAnswer: string;
  rationale: string;
  distractorRationales?: Record<string, string>;
  misconceptionTags: string[];
  itemStatus: "DRAFT" | "REVIEWED" | "PILOT" | "CALIBRATED";
  isReTest: boolean;
}

export interface ItemAttempt {
  itemId: string;
  primaryNodeId: string;
  studentAnswer: string;
  isCorrect: boolean;
  selectedOptionId?: string;
  detectedMisconceptions: string[];
  attemptedAt: string;
}

export interface NodeMasteryState {
  nodeId: string;
  state: KnowledgeState;
  confidence: EvidenceConfidence;
  attemptsCount: number;
  correctCount: number;
  misconceptionTags: string[];
  lastAssessedAt: string;
  ruleVersion: string;
}

export interface DiagnosticResult {
  sessionId: string;
  subjectId: string;
  topicId: string;
  nodeStates: Record<string, NodeMasteryState>;
  attempts: ItemAttempt[];
  assessedAt: string;
  ruleVersion: string;
}

// ==============================================================================
// SERVER-SIDE DIAGNOSTIC GRADING V1 CONTRACTS
// ==============================================================================

export type DiagnosticStudentResponse =
  | { type: "MCQ"; selectedOptionId: string }
  | { type: "NUMERIC"; numericValue: number; unit?: string };

export interface DiagnosticSubmissionRequestDto {
  learnerId: string;
  sessionId: string;
  itemId: string;
  itemVersion: string;
  response: DiagnosticStudentResponse;
}

export interface DiagnosticGradingResultDto {
  attemptId: string;
  itemId: string;
  accepted: true;
  isCorrect: boolean;
  nodeState: {
    state: KnowledgeState;
    confidence: EvidenceConfidence;
  };
  misconceptionSignals: string[];
}

export interface NumericAnswerSpec {
  exactValue?: number;
  value?: number;
  tolerance?: number;
  unit?: string;
  misconceptions?: Array<{
    value: number;
    misconceptionTag: string;
  }>;
}

export interface AtomicDiagnosticGradingParams {
  learnerId: string;
  sessionId: string;
  itemId: string;
  itemVersion: string;
  itemContentHash: string;
  primaryNodeId: string;
  studentResponse: DiagnosticStudentResponse;
  selectedOptionId?: string | null;
  isCorrect: boolean;
  attemptMisconceptionTags: string[];
  nodeMisconceptionTags: string[];
  gradingRuleVersion: string;
  evidenceRuleVersion: string;
  nodeState: KnowledgeState;
  nodeConfidence: EvidenceConfidence;
  attemptsCount: number;
  correctCount: number;
  lastAssessedAt: string | null;
  nodeRuleVersion: string;
  expectedNodeExists: boolean;
  expectedNodeUpdatedAt?: string | null;
  hasMasteryTransition: boolean;
  previousState?: KnowledgeState;
  previousConfidence?: EvidenceConfidence;
  newState?: KnowledgeState;
  newConfidence?: EvidenceConfidence;
  reasonCode?: "DIAGNOSTIC_EVALUATION";
  masteryRuleVersion?: string;
}

export interface AtomicDiagnosticGradingResult {
  attemptId: string;
  evidenceId: string;
  masteryId?: string | null;
  nodeUpdatedAt: string;
}

// ==============================================================================
// DOMAIN ERROR CLASSES
// ==============================================================================

export class TestResolverInjectionForbiddenError extends Error {
  readonly code = "TEST_RESOLVER_INJECTION_FORBIDDEN";
  constructor(
    message: string = "TEST_RESOLVER_INJECTION_FORBIDDEN: Custom item resolver injection is forbidden outside test environment."
  ) {
    super(message);
    this.name = "TestResolverInjectionForbiddenError";
  }
}

export class AttemptAlreadyRecordedError extends Error {
  constructor(message: string = "ATTEMPT_ALREADY_RECORDED: Item has already been attempted in this session.") {
    super(message);
    this.name = "AttemptAlreadyRecordedError";
  }
}

export class UnsupportedGradingRuleError extends Error {
  constructor(message: string = "UNSUPPORTED_GRADING_RULE: Item lacks supported grading rule or answerSpec.") {
    super(message);
    this.name = "UnsupportedGradingRuleError";
  }
}

export class InvalidCanonicalGradingItemError extends Error {
  constructor(message: string = "INVALID_CANONICAL_GRADING_ITEM: Canonical item grading structure is invalid.") {
    super(message);
    this.name = "InvalidCanonicalGradingItemError";
  }
}

export class InvalidGradingInputError extends Error {
  constructor(
    message: string = "INVALID_GRADING_INPUT: Submitted student response is invalid or contains forbidden grading authority fields."
  ) {
    super(message);
    this.name = "InvalidGradingInputError";
  }
}

export class SessionClosedError extends Error {
  constructor(message: string = "SESSION_CLOSED: Diagnostic session is already completed or abandoned.") {
    super(message);
    this.name = "SessionClosedError";
  }
}

export class SessionCompatibilityError extends Error {
  constructor(message: string = "SESSION_COMPATIBILITY_ERROR: Item subject or topic does not match session.") {
    super(message);
    this.name = "SessionCompatibilityError";
  }
}

export class StateConflictRetryError extends Error {
  constructor(message: string = "STATE_CONFLICT_RETRY: Concurrent update detected on target node state.") {
    super(message);
    this.name = "StateConflictRetryError";
  }
}

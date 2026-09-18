/**
 * AI School Learning Persistence V1 — Domain Contracts & Types
 *
 * Implements Controller Audit Requirements:
 * - A2: Directly reuses EducationStage, KnowledgeState, and EvidenceConfidence.
 * - A3: Nullable lastAssessedAt for NOT_ASSESSED; count constraints.
 * - A8: Structured MCQ / NUMERIC studentResponse payload only.
 * - Child privacy: Zero PII fields.
 */

import { EducationStage } from "../curriculum/types";
import { KnowledgeState, EvidenceConfidence } from "../diagnostic/types";

// Re-export existing enum authorities (A2)
export type { EducationStage, KnowledgeState, EvidenceConfidence };

export type PreschoolAgeBand = "3-4" | "4-5" | "5-6";

export type SessionKind = "DIAGNOSTIC" | "PRACTICE" | "RETEST";

export type SessionStatus = "STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type EvidenceType = "DIAGNOSTIC_ATTEMPT" | "PRACTICE_ATTEMPT" | "RETEST_ATTEMPT";

export type EvidenceOutcome = "CORRECT" | "INCORRECT";

export type MasteryReasonCode =
  | "DIAGNOSTIC_EVALUATION"
  | "PRACTICE_EVALUATION"
  | "RETEST_EVALUATION";

export type GuardianRelationshipType = "PARENT" | "GUARDIAN";

/**
 * A8: Structured student response payload only.
 * No arbitrary client grading truth, correctAnswer, or rationale permitted.
 */
export type StudentResponsePayload =
  | { type: "MCQ"; selectedOptionId: string }
  | { type: "NUMERIC"; numericValue: number; unit?: string };

export interface OwnershipContext {
  visitorToken?: string;
  userId?: string;
}

export interface LearnerProfile {
  id: string;
  visitorOwnerHash: string;
  nickname: string | null;
  educationStage: EducationStage;
  gradeLevel: number | null;
  ageBand: PreschoolAgeBand | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuardianLearnerRelationship {
  learnerId: string;
  guardianUserId: string;
  relationshipType: GuardianRelationshipType;
  createdAt: string;
}

export interface LearningSessionRecord {
  id: string;
  learnerId: string;
  sessionKind: SessionKind;
  subjectId: string;
  topicId: string | null;
  targetNodeId: string | null;
  status: SessionStatus;
  ruleVersion: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluatedAttemptRecord {
  id: string;
  sessionId: string;
  learnerId: string;
  itemId: string;
  itemVersion: string;
  itemContentHash: string;
  primaryNodeId: string;
  studentResponse: StudentResponsePayload;
  selectedOptionId: string | null;
  isCorrect: boolean;
  misconceptionTags: string[];
  gradingRuleVersion: string;
  attemptedAt: string;
}

export interface KnowledgeEvidenceRecord {
  id: string;
  learnerId: string;
  sessionId: string;
  attemptId: string;
  nodeId: string;
  evidenceType: EvidenceType;
  outcome: EvidenceOutcome;
  observedAt: string;
  ruleVersion: string;
}

export interface KnowledgeNodeStateRecord {
  learnerId: string;
  nodeId: string;
  state: KnowledgeState;
  confidence: EvidenceConfidence;
  attemptsCount: number;
  correctCount: number;
  misconceptionTags: string[];
  lastAssessedAt: string | null;
  ruleVersion: string;
  updatedAt: string;
}

export interface MasteryTransitionHistoryRecord {
  id: string;
  learnerId: string;
  nodeId: string;
  triggerSessionId: string;
  previousState: KnowledgeState;
  previousConfidence: EvidenceConfidence;
  newState: KnowledgeState;
  newConfidence: EvidenceConfidence;
  reasonCode: MasteryReasonCode;
  ruleVersion: string;
  occurredAt: string;
}

// Creation / Mutation Params
export interface CreateLearnerParams {
  nickname?: string | null;
  educationStage: EducationStage;
  gradeLevel?: number | null;
  ageBand?: PreschoolAgeBand | null;
}

export interface CreateSessionParams {
  learnerId: string;
  sessionKind: SessionKind;
  subjectId: string;
  topicId?: string | null;
  targetNodeId?: string | null;
  ruleVersion: string;
}

export interface SaveAttemptParams {
  sessionId: string;
  learnerId: string;
  itemId: string;
  itemVersion: string;
  itemContentHash: string;
  primaryNodeId: string;
  studentResponse: StudentResponsePayload;
  selectedOptionId?: string | null;
  isCorrect: boolean;
  misconceptionTags?: string[];
  gradingRuleVersion: string;
  attemptedAt?: string;
}

export interface AppendEvidenceParams {
  learnerId: string;
  sessionId: string;
  attemptId: string;
  nodeId: string;
  evidenceType: EvidenceType;
  outcome: EvidenceOutcome;
  ruleVersion: string;
  observedAt?: string;
}

export interface UpsertNodeStateParams {
  learnerId: string;
  nodeId: string;
  state: KnowledgeState;
  confidence: EvidenceConfidence;
  attemptsCount: number;
  correctCount: number;
  misconceptionTags?: string[];
  lastAssessedAt?: string | null;
  ruleVersion: string;
}

export interface AppendMasteryTransitionParams {
  learnerId: string;
  nodeId: string;
  triggerSessionId: string;
  previousState: KnowledgeState;
  previousConfidence: EvidenceConfidence;
  newState: KnowledgeState;
  newConfidence: EvidenceConfidence;
  reasonCode: MasteryReasonCode;
  ruleVersion: string;
  occurredAt?: string;
}

// Custom Domain / Persistence Errors
export class UnauthorizedLearnerAccessError extends Error {
  constructor(message = "Unauthorized access to learner resources.") {
    super(message);
    this.name = "UnauthorizedLearnerAccessError";
  }
}

export class InvalidItemHashError extends Error {
  constructor(hash: string) {
    super(`Invalid itemContentHash '${hash}'. Must be a 64-character SHA-256 hexadecimal string.`);
    this.name = "InvalidItemHashError";
  }
}

export class InvalidEvidenceTypeError extends Error {
  constructor(type: string) {
    super(`Invalid evidenceType '${type}'. PARENT_AI and COPILOT outputs cannot become evidence.`);
    this.name = "InvalidEvidenceTypeError";
  }
}

export class LearnerStageConstraintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LearnerStageConstraintError";
  }
}

export class InvalidStudentResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStudentResponseError";
  }
}

export class OwnershipChainMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OwnershipChainMismatchError";
  }
}

export class EvidenceSemanticMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceSemanticMismatchError";
  }
}

export class MasterySemanticMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MasterySemanticMismatchError";
  }
}

export class NodeStateConsistencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NodeStateConsistencyError";
  }
}

export class DatabasePersistenceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = "DatabasePersistenceError";
  }
}

// Invariant Validation Helpers
// P1-2: DB accepts lowercase SHA-256 only (^[a-f0-9]{64}$)
const SHA256_REGEX = /^[a-f0-9]{64}$/;

export function validateItemContentHash(hash: string): void {
  if (!hash || typeof hash !== "string" || !SHA256_REGEX.test(hash)) {
    throw new InvalidItemHashError(hash);
  }
}

export function validateEvidenceType(type: string): asserts type is EvidenceType {
  const valid: EvidenceType[] = ["DIAGNOSTIC_ATTEMPT", "PRACTICE_ATTEMPT", "RETEST_ATTEMPT"];
  if (!valid.includes(type as EvidenceType)) {
    throw new InvalidEvidenceTypeError(type);
  }
}

export function validateLearnerStageConstraints(
  stage: EducationStage,
  gradeLevel?: number | null,
  ageBand?: string | null
): void {
  if (stage === "PRESCHOOL") {
    if (gradeLevel != null) {
      throw new LearnerStageConstraintError("Preschool profile cannot carry grade_level.");
    }
    if (!ageBand || !["3-4", "4-5", "5-6"].includes(ageBand)) {
      throw new LearnerStageConstraintError("Preschool profile requires age_band in ('3-4', '4-5', '5-6').");
    }
  } else if (stage === "PRIMARY") {
    if (ageBand != null) {
      throw new LearnerStageConstraintError("Primary profile cannot carry age_band.");
    }
    if (gradeLevel == null || gradeLevel < 1 || gradeLevel > 5) {
      throw new LearnerStageConstraintError("Primary profile requires grade_level between 1 and 5.");
    }
  } else if (stage === "LOWER_SECONDARY") {
    if (ageBand != null) {
      throw new LearnerStageConstraintError("Lower Secondary profile cannot carry age_band.");
    }
    if (gradeLevel == null || gradeLevel < 6 || gradeLevel > 9) {
      throw new LearnerStageConstraintError("Lower Secondary profile requires grade_level between 6 and 9.");
    }
  } else if (stage === "UPPER_SECONDARY") {
    if (ageBand != null) {
      throw new LearnerStageConstraintError("Upper Secondary profile cannot carry age_band.");
    }
    if (gradeLevel == null || gradeLevel < 10 || gradeLevel > 12) {
      throw new LearnerStageConstraintError("Upper Secondary profile requires grade_level between 10 and 12.");
    }
  } else {
    throw new LearnerStageConstraintError(`Invalid educationStage '${stage}'.`);
  }
}

export function validateStudentResponse(response: any): asserts response is StudentResponsePayload {
  if (!response || typeof response !== "object") {
    throw new InvalidStudentResponseError("studentResponse must be an object.");
  }
  // Disallow forbidden client grading fields
  if ("correctAnswer" in response || "rationale" in response || "isCorrect" in response) {
    throw new InvalidStudentResponseError("studentResponse cannot contain client-supplied correctAnswer, rationale, or isCorrect.");
  }
  if (response.type === "MCQ") {
    if (typeof response.selectedOptionId !== "string" || !response.selectedOptionId.trim()) {
      throw new InvalidStudentResponseError("MCQ response must include non-empty selectedOptionId.");
    }
  } else if (response.type === "NUMERIC") {
    if (typeof response.numericValue !== "number" || isNaN(response.numericValue)) {
      throw new InvalidStudentResponseError("NUMERIC response must include valid numericValue.");
    }
  } else {
    throw new InvalidStudentResponseError(`Unsupported studentResponse type '${response.type}'.`);
  }
}

export function validateNodeStateCounts(attemptsCount: number, correctCount: number): void {
  if (attemptsCount < 0 || correctCount < 0) {
    throw new NodeStateConsistencyError("attempts_count and correct_count must be non-negative.");
  }
  if (correctCount > attemptsCount) {
    throw new NodeStateConsistencyError(`correct_count (${correctCount}) cannot exceed attempts_count (${attemptsCount}).`);
  }
}

// P1-3: Strengthen NOT_ASSESSED consistency
export function validateNodeStateConsistency(
  state: KnowledgeState,
  attemptsCount: number,
  correctCount: number,
  lastAssessedAt?: string | null
): void {
  validateNodeStateCounts(attemptsCount, correctCount);

  if (state === "NOT_ASSESSED") {
    if (attemptsCount !== 0 || correctCount !== 0 || (lastAssessedAt != null && lastAssessedAt !== "")) {
      throw new NodeStateConsistencyError(
        "NOT_ASSESSED state requires attempts_count = 0, correct_count = 0, and last_assessed_at IS NULL."
      );
    }
  } else {
    if (!lastAssessedAt) {
      throw new NodeStateConsistencyError(`State '${state}' requires last_assessed_at to be non-null.`);
    }
  }
}

// P1-1: Map session kind to expected evidence type
export function sessionKindToEvidenceType(sessionKind: SessionKind): EvidenceType {
  switch (sessionKind) {
    case "DIAGNOSTIC":
      return "DIAGNOSTIC_ATTEMPT";
    case "PRACTICE":
      return "PRACTICE_ATTEMPT";
    case "RETEST":
      return "RETEST_ATTEMPT";
    default:
      throw new EvidenceSemanticMismatchError(`Unknown session kind '${sessionKind}'.`);
  }
}

// P1-4: Map session kind to expected mastery reason code
export function sessionKindToMasteryReason(sessionKind: SessionKind): MasteryReasonCode {
  switch (sessionKind) {
    case "DIAGNOSTIC":
      return "DIAGNOSTIC_EVALUATION";
    case "PRACTICE":
      return "PRACTICE_EVALUATION";
    case "RETEST":
      return "RETEST_EVALUATION";
    default:
      throw new MasterySemanticMismatchError(`Unknown session kind '${sessionKind}'.`);
  }
}

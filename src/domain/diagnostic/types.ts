/**
 * AI School V3 — Diagnostic & Knowledge State Contracts
 * Based on V3_DIAGNOSTIC_GAP_ENGINE_SPEC.md
 */

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

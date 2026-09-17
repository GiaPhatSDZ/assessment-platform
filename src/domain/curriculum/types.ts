/**
 * AI School V3 — Curriculum Authority & Knowledge Graph Domain Contracts
 * Authority: Thông tư 32/2018/TT-BGDĐT & V3 Architecture Pack
 */

export type CurriculumStatus = "CURRENT_NATIONAL" | "PILOT" | "HISTORICAL" | "DRAFT";

export type SourceTier = "A" | "B" | "C" | "D";

export type EducationStage =
  | "PRESCHOOL"
  | "PRIMARY"
  | "LOWER_SECONDARY"
  | "UPPER_SECONDARY";

export interface SourceReference {
  sourceId: string;
  documentTitle?: string;
  clauseOrSection?: string;
  quote?: string;
  url?: string;
}

export interface CurriculumSource {
  id: string;
  authority: string;
  title: string;
  documentNumber?: string;
  issuedAt?: string;
  effectiveAt?: string;
  url: string;
  sha256?: string;
  sourceTier: SourceTier;
  status: CurriculumStatus;
  notes?: string;
}

export interface CurriculumRelease {
  id: string;
  jurisdiction: "VN";
  authority: "MOET";
  title: string;
  status: CurriculumStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  sourceDocumentIds: string[];
  createdAt: string;
}

export type ReviewStatus = "EXTRACTED" | "REVIEWED" | "APPROVED";

export interface LearningOutcome {
  id: string;
  curriculumReleaseId: string;
  stage: EducationStage;
  grade?: number;
  ageBand?: string;
  subjectId: string;
  strandId?: string;
  topicId?: string;
  officialText: string;
  normalizedSummary: string;
  sourceRef: SourceReference;
  reviewStatus: ReviewStatus;
}

export type KnowledgeNodeKind =
  | "FACT"
  | "CONCEPT"
  | "PROCEDURE"
  | "SKILL"
  | "APPLICATION"
  | "FOUNDATIONAL_DEVELOPMENT";

export interface KnowledgeNode {
  id: string;
  learningOutcomeId: string;
  code: string;
  label: string;
  description: string;
  kind: KnowledgeNodeKind;
  grade?: number;
  subjectId: string;
  topicId?: string;
  status: ReviewStatus;
}

export type PrerequisiteStrength = "REQUIRED" | "HELPFUL";

export type PrerequisiteEvidence =
  | "CURRICULUM_EXPLICIT"
  | "EXPERT_REVIEW"
  | "EMPIRICAL"
  | "DRAFT_INFERENCE";

export interface PrerequisiteEdge {
  fromNodeId: string; // The prerequisite (cần biết trước)
  toNodeId: string;   // The dependent node (phụ thuộc vào)
  strength: PrerequisiteStrength;
  rationale: string;
  evidence: PrerequisiteEvidence;
  sourceRefs: SourceReference[];
  reviewStatus: ReviewStatus;
}

export interface KnowledgeGraph {
  id: string;
  subjectId: string;
  topicId: string;
  version: string;
  nodes: KnowledgeNode[];
  edges: PrerequisiteEdge[];
  updatedAt: string;
}

export interface CoverageRecord {
  stage: EducationStage;
  grade?: number;
  subjectId: string;
  topicId?: string;
  status: "NOT_STARTED" | "PARTIAL_VERTICAL_SLICE" | "FULL_COVERAGE";
  verifiedSourceId: string;
  approvedOutcomesCount: number;
  approvedNodesCount: number;
  notes?: string;
}

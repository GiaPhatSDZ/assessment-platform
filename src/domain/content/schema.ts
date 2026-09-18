/**
 * AI School V3 — Content Database & Curriculum Schema V1
 * Based on CONTENT_DATABASE_SPEC_V1.md and AI_SCHOOL_V3_PRODUCT_STANDARDS_V1.md
 */

export type ReviewState =
  | "AI_DRAFT"
  | "SOURCE_LINKED"
  | "INTERNAL_REVIEWED"
  | "SUBJECT_EXPERT_REVIEWED"
  | "PILOTED";

export type PublicationState =
  | "DRAFT"
  | "READY_FOR_REVIEW"
  | "PUBLISHED_BETA"
  | "PUBLISHED_VERIFIED"
  | "RETIRED";

export type CoverageStatus =
  | "NOT_INGESTED"
  | "SOURCE_INGESTED"
  | "OUTCOMES_EXTRACTED"
  | "CONTENT_IN_REVIEW"
  | "DIAGNOSTIC_READY"
  | "PUBLISHED";

export type SourceTier =
  | "TIER_A_CURRICULUM_AUTHORITY"
  | "TIER_B1_MOET_APPROVED_TEXTBOOK"
  | "TIER_B2_NXBGD_PUBLISHER_RESOURCE"
  | "TIER_B3_PEDAGOGICAL_TRAINING_RESOURCE"
  | "TIER_C_INTERNAL_REVIEWED"
  | "TIER_D_AI_DRAFT"
  // Legacy aliases maintained for backward compatibility
  | "TIER_B_APPROVED_LEARNING_SOURCE"
  | "TIER_B_PEDAGOGICAL_SOURCE";

export type SourceType =
  | "OFFICIAL_CURRICULUM"
  | "OFFICIAL_GUIDANCE"
  | "APPROVED_TEXTBOOK_METADATA"
  | "APPROVED_TEXTBOOK_SOURCE"
  | "PEDAGOGICAL_TRAINING_RESOURCE"
  | "TRUSTED_LEARNING_RESOURCE"
  | "INTERNAL_REVIEWED_RESOURCE";

export type ResourceType =
  | "LEGAL_DOCUMENT"
  | "CURRICULUM_STANDARD"
  | "TEXTBOOK"
  | "TEACHER_GUIDE"
  | "WORKBOOK_SAMPLE"
  | "TRAINING_DOCUMENT"
  | "TRAINING_SLIDE"
  | "INTERNAL_LESSON"
  | "INTERNAL_ITEM";

export type LocatorStatus =
  | "UNVERIFIED"
  | "SOURCE_VIEWER_CONFIRMED"
  | "HUMAN_VERIFIED";

export interface LocatorEvidenceRecord {
  sourceId: string;
  printedPage?: number;
  viewerPage?: number;
  chapterLocator?: string;
  lessonLocator?: string;
  locatorStatus: LocatorStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  evidenceFingerprint?: string;
  notes?: string;
}

export interface RemoteViewerInventory {
  totalPages?: number;
  haveCoverPage?: boolean;
  notes?: string;
}

export interface SourceRights {
  redistribution: boolean;
  commercialReuse: "GRANTED" | "NOT_GRANTED" | "CONDITIONAL";
  notes: string;
}

export type CurriculumLegalStatus =
  | "CURRENT_NATIONAL"
  | "PILOT"
  | "HISTORICAL"
  | "DRAFT";

export interface SourceRef {
  sourceId: string;
  tier?: SourceTier;
  documentNumber?: string;
  bookSeries?: string;
  chapterLocator?: string;
  lessonLocator?: string;
  sectionLocator?: string;
  pageNumber?: number | string;
  printedPage?: number | string;
  viewerPage?: number | string;
  locatorStatus?: LocatorStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  evidenceFingerprint?: string;
  citationText?: string;
}

export type RemoteVerificationStatus =
  | "UNVERIFIED"
  | "OFFLINE_REGISTERED_METADATA"
  | "URL_REACHABLE"
  | "METADATA_VERIFIED"
  | "VIEWER_INVENTORY_VERIFIED"
  | "LOCATOR_HUMAN_VERIFIED"
  | "TLS_VERIFICATION_FAILED"
  | "UNREACHABLE";

export interface ApprovalProvenance {
  approvalSourceId: string;
  approvalDecisionNumber: string;
  approvalDecisionDate: string;
  approvalStatus: "MOET_APPROVED" | "UNVERIFIED" | "DEPRECATED";
  approvalNotes?: string;
}

export interface ReviewAttestation {
  reviewerId: string;
  reviewerName?: string;
  role: "PEDAGOGICAL_CONTROLLER" | "SUBJECT_EXPERT" | "CURRICULUM_AUDITOR";
  attestedAt: string;
  contentHash: string;
  hashAlgorithm: "SHA-256";
  hashSchemaVersion: "content-hash-v1";
  decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  scope: "QUESTION_ITEM" | "LESSON" | "PARENT_GUIDE" | "EXPLANATION";
  auditNotes?: string;
}

/**
 * Shared metadata contract for content types supporting formal review and publication workflow.
 */
export interface ReviewableContentMeta {
  authoringOrigin?: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
  itemMaturity?: "DRAFT" | "REVIEWED" | "PILOT" | "CALIBRATED";
  reviewState: ReviewState;
  publicationState?: PublicationState;
  version?: string;
  reviewAttestation?: ReviewAttestation;
}

export interface SourceDocument {
  id: string;
  authority: string;
  title: string;
  documentNumber?: string;
  sourceType: SourceType;
  sourceTier?: SourceTier;
  resourceType?: ResourceType;
  bookSeries?: string;
  grade?: number | string;
  subject?: string;
  url?: string;
  localChecksum?: string;
  issuedAt?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  sourceVersion?: string;
  retrievedAt: string;
  curriculumStatus?: CurriculumLegalStatus;
  rights?: SourceRights;
  rightsNotes?: string;
  authorityChain?: string[];
  verificationStatus?: RemoteVerificationStatus;
  httpStatus?: number;
  canonicalTitle?: string;
  remoteViewerInventory?: RemoteViewerInventory;
  remoteResponseFingerprint?: string;
  canonicalMetadataFingerprint?: string;
  fingerprint?: string;
  approval?: ApprovalProvenance;
  approvalStatus?: "MOET_APPROVED" | "UNVERIFIED" | "DEPRECATED";
  approvalDecisionNumber?: string;
  approvalDecisionDate?: string;
  approvalSourceId?: string;
  requiredForSlice?: boolean;
  canonicalInternalName?: string;
  sourceDisplayedTitle?: string;
  identityStatus?: "SOURCE_LABEL_CONSISTENT" | "SOURCE_LABEL_INCONSISTENT";
}

export class SelfPromotionForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SelfPromotionForbiddenError";
  }
}

export function assertCannotSelfPromote(record: {
  authoringOrigin?: string;
  reviewState: ReviewState;
  reviewedBy?: string;
  reviewedAt?: string;
}): void {
  if (
    record.authoringOrigin === "AI_ASSISTED" &&
    (record.reviewState === "INTERNAL_REVIEWED" ||
      record.reviewState === "SUBJECT_EXPERT_REVIEWED" ||
      record.reviewState === "PILOTED")
  ) {
    if (
      !record.reviewedBy ||
      record.reviewedBy.trim() === "" ||
      record.reviewedBy.includes("AI_") ||
      !record.reviewedAt
    ) {
      throw new SelfPromotionForbiddenError(
        `Self-promotion violation: AI_ASSISTED content cannot be marked as '${record.reviewState}' without a verified human reviewer signature and reviewedAt timestamp.`
      );
    }
  }
}

export type RichContent =
  | { type: "text"; value: string }
  | { type: "inline_math"; latex: string; spokenText?: string }
  | { type: "block_math"; latex: string; spokenText?: string }
  | { type: "image"; assetId: string; alt: string; caption?: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface LearningOutcome {
  id: string;
  gradeOrAgeBand: string;
  subjectId: string;
  officialText: string;
  normalizedSummary: string;
  sourceRefs: SourceRef[];
  reviewState: ReviewState;
}

export interface KnowledgeNode {
  id: string;
  learningOutcomeIds: string[];
  label: string;
  description: string;
  type: "FACT" | "CONCEPT" | "PROCEDURE" | "SKILL" | "APPLICATION" | "DEVELOPMENT";
  sourceRefs?: SourceRef[];
  reviewState: ReviewState;
}

export interface PrerequisiteEdge {
  prerequisiteNodeId: string;
  targetNodeId: string;
  strength: "REQUIRED" | "HELPFUL";
  rationale: string;
  evidenceType: "CURRICULUM_EXPLICIT" | "EXPERT_REVIEW" | "EMPIRICAL" | "DRAFT_INFERENCE";
  reviewState: ReviewState;
}

export interface Lesson {
  id: string;
  nodeIds: string[];
  title: string;
  learnerText: RichContent[];
  workedExamples: { prompt: RichContent[]; steps: RichContent[]; finalAnswer: string }[];
  approvedSourceRefs: SourceRef[];
  ageOrGradeFit?: string[];
  authoringOrigin?: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
  reviewState: ReviewState;
  publicationState: PublicationState;
  version: string;
  reviewAttestation?: ReviewAttestation;
}

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "NUMERIC"
  | "SHORT_RESPONSE"
  | "MATCHING"
  | "ORDERING"
  | "ACTIVITY"
  | "OBSERVATION";

export type CognitiveDemand = "RECALL" | "UNDERSTAND" | "APPLY" | "TRANSFER";

export interface MultipleChoiceOption {
  id: string;
  content: RichContent[];
  isCorrect: boolean;
  misconceptionTag?: string;
}

export interface QuestionItem {
  id: string;
  primaryNodeId: string;
  supportingNodeIds: string[];
  type: QuestionType;
  cognitiveDemand: CognitiveDemand;
  prompt: RichContent[];
  options?: MultipleChoiceOption[];
  correctAnswer: string;
  answerSpec?: unknown;
  rationale: string;
  distractorRationales?: Record<string, string>;
  misconceptionTags: string[];
  sourceRefs: SourceRef[];
  authoringOrigin: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
  itemMaturity: "DRAFT" | "REVIEWED" | "PILOT" | "CALIBRATED";
  reviewState: ReviewState;
  publicationState: PublicationState;
  version: string;
  reviewAttestation?: ReviewAttestation;
}

export interface Explanation {
  itemId: string;
  shortExplanation: RichContent[];
  stepByStep: RichContent[];
  commonMistakeExplanation?: RichContent[];
  sourceRefs: SourceRef[];
  reviewState: ReviewState;
  publicationState: PublicationState;
}

export interface ParentGuide {
  nodeId: string;
  parentSummary: string;
  whatChildNeedsToUnderstand: string[];
  commonDifficulties: string[];
  questionsToAskChild: string[];
  hintsWithoutGivingAnswer: string[];
  everydayExamples: string[];
  fullParentSolutionGuide?: RichContent[];
  sourceRefs: SourceRef[];
  reviewState: ReviewState;
}

export type PublicationScope = "DRAFT" | "BETA" | "VERIFIED";

export interface PublicationManifest {
  manifestVersion: string;
  subjectId: string;
  gradeOrAgeBand: string;
  manifestCreatedAt?: string;
  reviewStatus?: ReviewState | "PENDING_HUMAN_CONTROLLER_AUDIT";
  publishedAt: string | null;
  publishedBy: string | null;
  publicationScope: PublicationScope;
  sourceDocumentIds: string[];
  learningOutcomeCount: number;
  knowledgeNodeCount: number;
  lessonCount: number;
  questionItemCount: number;
  checksum: string;
}

export interface SubjectCoverageRecord {
  grade: number | string;
  stage?: string;
  subjectId: string;
  subjectNameVi: string;
  kind?: string;
  sourceStatus: CoverageStatus;
  outcomesTotal: number;
  outcomesReviewed: number;
  nodesTotal: number;
  nodesReviewed: number;
  questionsReviewed: number;
  lessonsPublished: number;
  diagnosticReady: boolean;
}

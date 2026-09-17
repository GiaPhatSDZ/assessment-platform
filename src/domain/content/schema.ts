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
  | "TIER_B_APPROVED_LEARNING_SOURCE"
  | "TIER_B_PEDAGOGICAL_SOURCE"
  | "TIER_C_INTERNAL_REVIEWED"
  | "TIER_D_AI_DRAFT";

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
  citationText?: string;
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
  rationale: string;
  distractorRationales?: Record<string, string>;
  misconceptionTags: string[];
  sourceRefs: SourceRef[];
  authoringOrigin: "HUMAN" | "AI_ASSISTED" | "ADAPTED_WITH_PERMISSION";
  itemMaturity: "DRAFT" | "REVIEWED" | "PILOT" | "CALIBRATED";
  reviewState: ReviewState;
  publicationState: PublicationState;
  version: string;
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
  publishedAt: string;
  publishedBy: string;
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

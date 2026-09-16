export type AssessmentStatus = "draft" | "published" | "archived";

export type AssessmentLocale = "vi" | "en";

export interface DimensionDefinition {
  id: string;
  label: string;
  shortDescription: string;
  order: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: number;
}

export interface ScoringContribution {
  dimensionId: string;
  weight: number;
  reverse?: boolean;
}

export interface QuestionDefinition {
  id: string;
  type: "single_choice_scale";
  prompt: string;
  required: boolean;
  options: QuestionOption[];
  scoring: ScoringContribution[];
}

export interface ResultBandDefinition {
  id: string;
  minScore: number;
  maxScore: number;
  label: string;
  description: string;
}

export interface AssessmentDefinition {
  id: string;
  slug: string;
  title: string;
  locale: AssessmentLocale;
  version: number;
  status: AssessmentStatus;
  description: string;
  disclaimer: string;
  dimensions: DimensionDefinition[];
  questions: QuestionDefinition[];
  resultBands: ResultBandDefinition[];
}

export interface Answer {
  questionId: string;
  optionId: string;
  answeredAt?: string;
}

export interface DimensionScore {
  dimensionId: string;
  rawScore: number;
  normalizedScore: number; // 0..100
  evidenceQuestionIds: string[];
}

export interface AssessmentScore {
  assessmentId: string;
  assessmentVersion: number;
  completeness: number; // 0..1
  dimensions: DimensionScore[];
  scoringVersion: string;
}

export interface DimensionInterpretation {
  dimensionId: string;
  label: string;
  score: number;
  band: ResultBandDefinition;
}

export interface DeterministicResult {
  assessmentId: string;
  assessmentVersion: number;
  score: AssessmentScore;
  dimensions: DimensionInterpretation[];
  overallSummary: string;
  strongestSignals: string[];
  growthOpportunities: string[];
  disclaimer: string;
  calculatedAt: string;
}

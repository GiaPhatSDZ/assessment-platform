import { AssessmentDefinition, Answer, AssessmentScore, DimensionScore } from "./types";
import { AssessmentScoringError } from "./errors";

export const SCORING_ENGINE_VERSION = "1.0.0";

interface DimensionTheoreticalBounds {
  min: number;
  max: number;
}

export function calculateTheoreticalBounds(
  definition: AssessmentDefinition
): Map<string, DimensionTheoreticalBounds> {
  const bounds = new Map<string, DimensionTheoreticalBounds>();

  for (const dim of definition.dimensions) {
    bounds.set(dim.id, { min: 0, max: 0 });
  }

  for (const question of definition.questions) {
    if (question.options.length === 0) continue;

    const optionValues = question.options.map((o) => o.value);
    const minVal = Math.min(...optionValues);
    const maxVal = Math.max(...optionValues);

    for (const contrib of question.scoring) {
      const current = bounds.get(contrib.dimensionId);
      if (!current) continue;

      // Note: Whether reversed or not, the min and max values available from the question options remain minVal and maxVal
      const qMin = minVal * contrib.weight;
      const qMax = maxVal * contrib.weight;

      current.min += qMin;
      current.max += qMax;
    }
  }

  return bounds;
}

export function scoreAssessment(
  definition: AssessmentDefinition,
  answers: Answer[]
): AssessmentScore {
  const questionMap = new Map(definition.questions.map((q) => [q.id, q]));
  const answeredQuestionIds = new Set<string>();
  const answerMap = new Map<string, string>();

  for (const ans of answers) {
    if (answeredQuestionIds.has(ans.questionId)) {
      throw new AssessmentScoringError(
        `Duplicate answer detected for question: ${ans.questionId}`
      );
    }
    const question = questionMap.get(ans.questionId);
    if (!question) {
      throw new AssessmentScoringError(
        `Answer refers to unknown question: ${ans.questionId}`
      );
    }
    const optionExists = question.options.some((o) => o.id === ans.optionId);
    if (!optionExists) {
      throw new AssessmentScoringError(
        `Answer refers to unknown option ${ans.optionId} for question ${ans.questionId}`
      );
    }

    answeredQuestionIds.add(ans.questionId);
    answerMap.set(ans.questionId, ans.optionId);
  }

  // Verify all required questions are answered
  for (const question of definition.questions) {
    if (question.required && !answerMap.has(question.id)) {
      throw new AssessmentScoringError(
        `Missing required answer for question: ${question.id}`
      );
    }
  }

  const bounds = calculateTheoreticalBounds(definition);
  const rawScores = new Map<string, number>();
  const evidenceMap = new Map<string, string[]>();

  for (const dim of definition.dimensions) {
    rawScores.set(dim.id, 0);
    evidenceMap.set(dim.id, []);
  }

  for (const question of definition.questions) {
    const selectedOptionId = answerMap.get(question.id);
    if (!selectedOptionId) continue;

    const selectedOption = question.options.find((o) => o.id === selectedOptionId)!;
    const optionValues = question.options.map((o) => o.value);
    const minVal = Math.min(...optionValues);
    const maxVal = Math.max(...optionValues);

    for (const contrib of question.scoring) {
      let effectiveValue = selectedOption.value;
      if (contrib.reverse) {
        effectiveValue = maxVal + minVal - effectiveValue;
      }

      const scoreContribution = effectiveValue * contrib.weight;
      const currentRaw = rawScores.get(contrib.dimensionId) || 0;
      rawScores.set(contrib.dimensionId, currentRaw + scoreContribution);

      const evidence = evidenceMap.get(contrib.dimensionId) || [];
      evidence.push(question.id);
      evidenceMap.set(contrib.dimensionId, evidence);
    }
  }

  const dimensionScores: DimensionScore[] = definition.dimensions.map((dim) => {
    const raw = rawScores.get(dim.id) || 0;
    const bound = bounds.get(dim.id) || { min: 0, max: 100 };
    const range = bound.max - bound.min;

    let normalized = 0;
    if (range > 0) {
      normalized = ((raw - bound.min) / range) * 100;
    } else {
      normalized = 100;
    }

    // Clamp to 0..100 and apply stable mathematical rounding
    normalized = Math.min(100, Math.max(0, Math.round(normalized)));

    const evidence = (evidenceMap.get(dim.id) || []).sort();

    return {
      dimensionId: dim.id,
      rawScore: raw,
      normalizedScore: normalized,
      evidenceQuestionIds: evidence,
    };
  });

  const totalRequired = definition.questions.filter((q) => q.required).length;
  const answeredRequired = definition.questions.filter(
    (q) => q.required && answerMap.has(q.id)
  ).length;

  const completeness = totalRequired > 0 ? answeredRequired / totalRequired : 1;

  return {
    assessmentId: definition.id,
    assessmentVersion: definition.version,
    completeness,
    dimensions: dimensionScores,
    scoringVersion: SCORING_ENGINE_VERSION,
  };
}

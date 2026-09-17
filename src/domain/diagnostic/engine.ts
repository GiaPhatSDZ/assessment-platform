import { DiagnosticItem, ItemAttempt, NodeMasteryState, DiagnosticResult } from "./types";

export const DIAGNOSTIC_RULE_VERSION = "1.0.0";

/**
 * Deterministically evaluates attempts for a specific knowledge node.
 * Strictly avoids fake percentiles or random guessing.
 */
export function evaluateNodeState(
  nodeId: string,
  nodeAttempts: ItemAttempt[]
): NodeMasteryState {
  const attemptsCount = nodeAttempts.length;
  const correctCount = nodeAttempts.filter((a) => a.isCorrect).length;
  const misconceptionTags = Array.from(
    new Set(nodeAttempts.flatMap((a) => a.detectedMisconceptions))
  );
  const lastAssessedAt =
    nodeAttempts.length > 0
      ? nodeAttempts[nodeAttempts.length - 1].attemptedAt
      : new Date().toISOString();

  // 1. No evidence
  if (attemptsCount === 0) {
    return {
      nodeId,
      state: "NOT_ASSESSED",
      confidence: "LOW",
      attemptsCount: 0,
      correctCount: 0,
      misconceptionTags: [],
      lastAssessedAt,
      ruleVersion: DIAGNOSTIC_RULE_VERSION,
    };
  }

  // 2. Single item attempt
  if (attemptsCount === 1) {
    if (correctCount === 1) {
      // One correct is positive signal; marked SECURE with provisional LOW confidence
      return {
        nodeId,
        state: "SECURE",
        confidence: "LOW",
        attemptsCount: 1,
        correctCount: 1,
        misconceptionTags,
        lastAssessedAt,
        ruleVersion: DIAGNOSTIC_RULE_VERSION,
      };
    } else {
      // One incorrect shows clear current struggle
      return {
        nodeId,
        state: "DEVELOPING",
        confidence: "MEDIUM",
        attemptsCount: 1,
        correctCount: 0,
        misconceptionTags,
        lastAssessedAt,
        ruleVersion: DIAGNOSTIC_RULE_VERSION,
      };
    }
  }

  // 3. Multiple attempts
  const successRate = correctCount / attemptsCount;

  if (successRate === 1) {
    return {
      nodeId,
      state: "SECURE",
      confidence: attemptsCount >= 2 ? "HIGH" : "MEDIUM",
      attemptsCount,
      correctCount,
      misconceptionTags,
      lastAssessedAt,
      ruleVersion: DIAGNOSTIC_RULE_VERSION,
    };
  }

  if (successRate >= 0.5) {
    // Mixed / contradictory evidence
    return {
      nodeId,
      state: "UNCERTAIN",
      confidence: "MEDIUM",
      attemptsCount,
      correctCount,
      misconceptionTags,
      lastAssessedAt,
      ruleVersion: DIAGNOSTIC_RULE_VERSION,
    };
  }

  // Consistently failing
  return {
    nodeId,
    state: "DEVELOPING",
    confidence: "HIGH",
    attemptsCount,
    correctCount,
    misconceptionTags,
    lastAssessedAt,
    ruleVersion: DIAGNOSTIC_RULE_VERSION,
  };
}

/**
 * Grades a raw student answer against an item and creates an ItemAttempt.
 */
export function gradeAttempt(
  item: DiagnosticItem,
  studentAnswer: string
): ItemAttempt {
  const isCorrect = item.correctAnswer.trim().toUpperCase() === studentAnswer.trim().toUpperCase();
  const detectedMisconceptions: string[] = [];

  if (!isCorrect) {
    // If the student selected a known distractor option with a misconception tag
    if (item.distractorRationales && item.distractorRationales[studentAnswer.trim().toUpperCase()]) {
      detectedMisconceptions.push(...item.misconceptionTags);
    } else if (item.misconceptionTags.length > 0) {
      detectedMisconceptions.push(item.misconceptionTags[0]);
    }
  }

  return {
    itemId: item.id,
    primaryNodeId: item.primaryNodeId,
    studentAnswer,
    selectedOptionId: studentAnswer.trim().toUpperCase(),
    isCorrect,
    detectedMisconceptions,
    attemptedAt: new Date().toISOString(),
  };
}

/**
 * Aggregates all attempts into a full DiagnosticResult across relevant nodes.
 */
export function evaluateSession(
  sessionId: string,
  subjectId: string,
  topicId: string,
  nodeIds: string[],
  attempts: ItemAttempt[]
): DiagnosticResult {
  const nodeStates: Record<string, NodeMasteryState> = {};

  for (const nodeId of nodeIds) {
    const nodeAttempts = attempts.filter((a) => a.primaryNodeId === nodeId);
    nodeStates[nodeId] = evaluateNodeState(nodeId, nodeAttempts);
  }

  return {
    sessionId,
    subjectId,
    topicId,
    nodeStates,
    attempts,
    assessedAt: new Date().toISOString(),
    ruleVersion: DIAGNOSTIC_RULE_VERSION,
  };
}

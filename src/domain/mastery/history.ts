import { KnowledgeState, EvidenceConfidence, ItemAttempt } from "../diagnostic/types";
import { evaluateNodeState } from "../diagnostic/engine";

export interface MasteryTransitionRecord {
  id: string;
  studentId: string;
  nodeId: string;
  nodeLabel: string;
  previousState: KnowledgeState;
  previousConfidence: EvidenceConfidence;
  newState: KnowledgeState;
  newConfidence: EvidenceConfidence;
  learningPackId?: string;
  reTestAttemptsCount: number;
  reTestCorrectCount: number;
  reason: string;
  timestamp: string;
}

export interface StudentMasteryProfile {
  studentId: string;
  currentStates: Record<string, { state: KnowledgeState; confidence: EvidenceConfidence; lastAssessedAt: string }>;
  history: MasteryTransitionRecord[];
}

/**
 * Evaluates a re-test attempt set for a remediated node and records the state transition.
 */
export function processReTestOutcome(
  studentId: string,
  nodeId: string,
  nodeLabel: string,
  previousState: KnowledgeState,
  previousConfidence: EvidenceConfidence,
  reTestAttempts: ItemAttempt[],
  learningPackId?: string
): MasteryTransitionRecord {
  const evaluated = evaluateNodeState(nodeId, reTestAttempts);
  const correctCount = reTestAttempts.filter((a) => a.isCorrect).length;
  const isRecovered = evaluated.state === "SECURE" || (reTestAttempts.length >= 1 && correctCount === reTestAttempts.length);

  const newState: KnowledgeState = isRecovered ? "SECURE" : evaluated.state;
  const newConfidence: EvidenceConfidence = isRecovered ? "HIGH" : evaluated.confidence;

  const reason = isRecovered
    ? `Học sinh đã vượt qua bài kiểm tra lại (${correctCount}/${reTestAttempts.length} câu đúng) sau khi hoàn thành gói học tập; lỗ hổng kiến thức đã được khắc phục thành công.`
    : `Học sinh vẫn cần luyện tập thêm (${correctCount}/${reTestAttempts.length} câu đúng); tiếp tục duy trì trạng thái bồi dưỡng.`;

  return {
    id: `TRANS-${Date.now()}-${nodeId}`,
    studentId,
    nodeId,
    nodeLabel,
    previousState,
    previousConfidence,
    newState,
    newConfidence,
    learningPackId,
    reTestAttemptsCount: reTestAttempts.length,
    reTestCorrectCount: correctCount,
    reason,
    timestamp: new Date().toISOString(),
  };
}

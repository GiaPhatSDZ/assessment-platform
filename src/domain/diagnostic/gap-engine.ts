import { KnowledgeGraph } from "../curriculum/types";
import { DiagnosticResult, NodeMasteryState } from "./types";

export type GapClassification =
  | "NO_GAP"
  | "LOCAL_GAP_CANDIDATE"
  | "PREREQUISITE_GAP_CANDIDATE"
  | "INSUFFICIENT_EVIDENCE";

export interface GapReport {
  sessionId: string;
  targetNodeId: string;
  targetNodeLabel: string;
  classification: GapClassification;
  primaryFailingNodeId?: string;
  primaryFailingNodeLabel?: string;
  rootPrerequisiteNodeId?: string;
  rootPrerequisiteNodeLabel?: string;
  prerequisiteChainPath: string[]; // Node IDs from root prerequisite to target
  detectedMisconceptions: string[];
  explanation: string;
  actionableNextStep: string;
  generatedAt: string;
  ruleVersion: string;
}

export const GAP_ENGINE_VERSION = "1.0.0";

/**
 * Traces the prerequisite graph backwards to find the root cause of a knowledge gap.
 */
export function detectKnowledgeGap(
  graph: KnowledgeGraph,
  result: DiagnosticResult,
  targetNodeId: string
): GapReport {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const targetNode = nodeMap.get(targetNodeId);

  if (!targetNode) {
    throw new Error(`Target node ${targetNodeId} not found in knowledge graph.`);
  }

  const targetState: NodeMasteryState = result.nodeStates[targetNodeId] || {
    nodeId: targetNodeId,
    state: "NOT_ASSESSED",
    confidence: "LOW",
    attemptsCount: 0,
    correctCount: 0,
    misconceptionTags: [],
    lastAssessedAt: new Date().toISOString(),
    ruleVersion: GAP_ENGINE_VERSION,
  };

  const detectedMisconceptions = Array.from(
    new Set(Object.values(result.nodeStates).flatMap((ns) => ns.misconceptionTags))
  );

  // 1. Target node is already SECURE
  if (targetState.state === "SECURE") {
    return {
      sessionId: result.sessionId,
      targetNodeId,
      targetNodeLabel: targetNode.label,
      classification: "NO_GAP",
      prerequisiteChainPath: [targetNodeId],
      detectedMisconceptions,
      explanation: `Học sinh đã làm chủ vững vàng kiến thức '${targetNode.label}' với độ tin cậy bằng chứng cao.`,
      actionableNextStep: "Có thể chuyển sang các chủ đề nâng cao hoặc bài toán vận dụng thực tế.",
      generatedAt: new Date().toISOString(),
      ruleVersion: GAP_ENGINE_VERSION,
    };
  }

  // 2. Insufficient attempts on target node
  if (targetState.state === "NOT_ASSESSED") {
    return {
      sessionId: result.sessionId,
      targetNodeId,
      targetNodeLabel: targetNode.label,
      classification: "INSUFFICIENT_EVIDENCE",
      prerequisiteChainPath: [targetNodeId],
      detectedMisconceptions: [],
      explanation: `Chưa có đủ dữ liệu chẩn đoán về kiến thức '${targetNode.label}'.`,
      actionableNextStep: "Thực hiện bài kiểm tra chẩn đoán ban đầu.",
      generatedAt: new Date().toISOString(),
      ruleVersion: GAP_ENGINE_VERSION,
    };
  }

  // 3. Target node is failing / developing -> Trace prerequisites backwards
  // Find all incoming edges (prerequisites of this node)
  const incomingEdges = graph.edges.filter((e) => e.toNodeId === targetNodeId);

  // Depth-first search to find the deepest failing prerequisite
  const failingPrereqs: { nodeId: string; distance: number; state: NodeMasteryState }[] = [];

  function tracePrereqs(currentNodeId: string, currentDistance: number) {
    const directPrereqs = graph.edges.filter((e) => e.toNodeId === currentNodeId);
    for (const edge of directPrereqs) {
      const pNodeId = edge.fromNodeId;
      const pState = result.nodeStates[pNodeId];
      if (pState && (pState.state === "DEVELOPING" || pState.state === "UNCERTAIN")) {
        failingPrereqs.push({ nodeId: pNodeId, distance: currentDistance, state: pState });
      }
      tracePrereqs(pNodeId, currentDistance + 1);
    }
  }

  tracePrereqs(targetNodeId, 1);

  // If there are failing prerequisites, find the deepest root one
  if (failingPrereqs.length > 0) {
    // Sort by distance descending (deepest prerequisite first)
    failingPrereqs.sort((a, b) => b.distance - a.distance);
    const rootFailing = failingPrereqs[0];
    const rootNode = nodeMap.get(rootFailing.nodeId);
    const rootLabel = rootNode ? rootNode.label : rootFailing.nodeId;

    // Construct path from root to target
    const chainPath = [rootFailing.nodeId, targetNodeId];

    return {
      sessionId: result.sessionId,
      targetNodeId,
      targetNodeLabel: targetNode.label,
      classification: "PREREQUISITE_GAP_CANDIDATE",
      primaryFailingNodeId: targetNodeId,
      primaryFailingNodeLabel: targetNode.label,
      rootPrerequisiteNodeId: rootFailing.nodeId,
      rootPrerequisiteNodeLabel: rootLabel,
      prerequisiteChainPath: chainPath,
      detectedMisconceptions,
      explanation: `Học sinh gặp trở ngại ở bài '${targetNode.label}' không phải do không hiểu phép tính, mà bắt nguồn từ lỗ hổng kiến thức nền tảng: '${rootLabel}'.`,
      actionableNextStep: `Tập trung ôn tập và củng cố lại bài '${rootLabel}' trước khi quay lại luyện tập '${targetNode.label}'.`,
      generatedAt: new Date().toISOString(),
      ruleVersion: GAP_ENGINE_VERSION,
    };
  }

  // 4. All tested prerequisites are SECURE, but target node is failing
  return {
    sessionId: result.sessionId,
    targetNodeId,
    targetNodeLabel: targetNode.label,
    classification: "LOCAL_GAP_CANDIDATE",
    primaryFailingNodeId: targetNodeId,
    primaryFailingNodeLabel: targetNode.label,
    prerequisiteChainPath: [targetNodeId],
    detectedMisconceptions,
    explanation: `Kiến thức nền tảng của học sinh đều đạt chuẩn. Khó khăn nằm ở kỹ năng tổng hợp và quy tắc riêng của '${targetNode.label}'.`,
    actionableNextStep: `Xem các ví dụ mẫu có hướng dẫn (worked examples) về '${targetNode.label}' và thực hành từng bước.`,
    generatedAt: new Date().toISOString(),
    ruleVersion: GAP_ENGINE_VERSION,
  };
}

import { KnowledgeGraph, LearningOutcome } from "./types";

export interface GraphValidationError {
  code:
    | "SELF_LOOP"
    | "CYCLE_DETECTED"
    | "UNKNOWN_NODE"
    | "MISSING_SOURCE_PROVENANCE"
    | "INVALID_STATUS";
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Validates a knowledge graph for DAG correctness, node existence, and no self-loops.
 */
export function validateKnowledgeGraph(graph: KnowledgeGraph): GraphValidationError[] {
  const errors: GraphValidationError[] = [];
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  // 1. Check unknown nodes and self-loops
  for (const edge of graph.edges) {
    if (!nodeMap.has(edge.fromNodeId)) {
      errors.push({
        code: "UNKNOWN_NODE",
        message: `Edge references unknown prerequisite node: ${edge.fromNodeId}`,
        details: { edge },
      });
    }
    if (!nodeMap.has(edge.toNodeId)) {
      errors.push({
        code: "UNKNOWN_NODE",
        message: `Edge references unknown dependent node: ${edge.toNodeId}`,
        details: { edge },
      });
    }
    if (edge.fromNodeId === edge.toNodeId) {
      errors.push({
        code: "SELF_LOOP",
        message: `Edge is a self-loop on node: ${edge.fromNodeId}`,
        details: { edge },
      });
    }
  }

  // 2. Cycle detection via DFS
  const adj = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of graph.edges) {
    if (nodeMap.has(edge.fromNodeId) && nodeMap.has(edge.toNodeId) && edge.fromNodeId !== edge.toNodeId) {
      adj.get(edge.fromNodeId)?.push(edge.toNodeId);
    }
  }

  const visited = new Map<string, "UNVISITED" | "VISITING" | "VISITED">();
  for (const node of graph.nodes) {
    visited.set(node.id, "UNVISITED");
  }

  function dfs(nodeId: string, path: string[]): boolean {
    visited.set(nodeId, "VISITING");
    path.push(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const state = visited.get(neighbor);
      if (state === "VISITING") {
        errors.push({
          code: "CYCLE_DETECTED",
          message: `Cycle detected in prerequisite graph: ${[...path, neighbor].join(" -> ")}`,
          details: { cyclePath: [...path, neighbor] },
        });
        return true;
      }
      if (state === "UNVISITED") {
        if (dfs(neighbor, path)) return true;
      }
    }

    visited.set(nodeId, "VISITED");
    path.pop();
    return false;
  }

  for (const node of graph.nodes) {
    if (visited.get(node.id) === "UNVISITED") {
      dfs(node.id, []);
    }
  }

  return errors;
}

/**
 * Validates that an APPROVED learning outcome strictly contains official source provenance.
 */
export function validateLearningOutcomeProvenance(outcome: LearningOutcome): GraphValidationError[] {
  const errors: GraphValidationError[] = [];
  if (outcome.reviewStatus === "APPROVED") {
    if (!outcome.sourceRef || !outcome.sourceRef.sourceId || !outcome.sourceRef.quote) {
      errors.push({
        code: "MISSING_SOURCE_PROVENANCE",
        message: `Approved outcome ${outcome.id} must have non-empty sourceId and quote from official document.`,
        details: { outcomeId: outcome.id },
      });
    }
  }
  return errors;
}

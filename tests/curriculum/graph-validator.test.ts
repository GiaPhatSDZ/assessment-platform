import { describe, it, expect } from "vitest";
import { validateKnowledgeGraph, validateLearningOutcomeProvenance } from "@/src/domain/curriculum/graph-validator";
import { KnowledgeGraph, LearningOutcome } from "@/src/domain/curriculum/types";

describe("Curriculum Graph Validator", () => {
  it("rejects self-loops in prerequisite edges", () => {
    const graph: KnowledgeGraph = {
      id: "graph-test",
      subjectId: "math",
      topicId: "fractions",
      version: "1.0.0",
      nodes: [
        {
          id: "node-1",
          learningOutcomeId: "lo-1",
          code: "N1",
          label: "Node 1",
          description: "Test",
          kind: "CONCEPT",
          subjectId: "math",
          status: "APPROVED",
        },
      ],
      edges: [
        {
          fromNodeId: "node-1",
          toNodeId: "node-1",
          strength: "REQUIRED",
          rationale: "Self prerequisite",
          evidence: "DRAFT_INFERENCE",
          sourceRefs: [],
          reviewStatus: "EXTRACTED",
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    const errors = validateKnowledgeGraph(graph);
    expect(errors.some((e) => e.code === "SELF_LOOP")).toBe(true);
  });

  it("detects cycles in prerequisite edges", () => {
    const graph: KnowledgeGraph = {
      id: "graph-cycle",
      subjectId: "math",
      topicId: "fractions",
      version: "1.0.0",
      nodes: [
        {
          id: "node-a",
          learningOutcomeId: "lo-1",
          code: "NA",
          label: "Node A",
          description: "Test",
          kind: "CONCEPT",
          subjectId: "math",
          status: "APPROVED",
        },
        {
          id: "node-b",
          learningOutcomeId: "lo-2",
          code: "NB",
          label: "Node B",
          description: "Test",
          kind: "PROCEDURE",
          subjectId: "math",
          status: "APPROVED",
        },
      ],
      edges: [
        {
          fromNodeId: "node-a",
          toNodeId: "node-b",
          strength: "REQUIRED",
          rationale: "A needed for B",
          evidence: "CURRICULUM_EXPLICIT",
          sourceRefs: [],
          reviewStatus: "APPROVED",
        },
        {
          fromNodeId: "node-b",
          toNodeId: "node-a",
          strength: "REQUIRED",
          rationale: "B needed for A (cycle)",
          evidence: "DRAFT_INFERENCE",
          sourceRefs: [],
          reviewStatus: "EXTRACTED",
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    const errors = validateKnowledgeGraph(graph);
    expect(errors.some((e) => e.code === "CYCLE_DETECTED")).toBe(true);
  });

  it("rejects edges referencing non-existent nodes", () => {
    const graph: KnowledgeGraph = {
      id: "graph-missing",
      subjectId: "math",
      topicId: "fractions",
      version: "1.0.0",
      nodes: [
        {
          id: "node-1",
          learningOutcomeId: "lo-1",
          code: "N1",
          label: "Node 1",
          description: "Test",
          kind: "CONCEPT",
          subjectId: "math",
          status: "APPROVED",
        },
      ],
      edges: [
        {
          fromNodeId: "node-1",
          toNodeId: "node-nonexistent",
          strength: "REQUIRED",
          rationale: "Points nowhere",
          evidence: "DRAFT_INFERENCE",
          sourceRefs: [],
          reviewStatus: "EXTRACTED",
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    const errors = validateKnowledgeGraph(graph);
    expect(errors.some((e) => e.code === "UNKNOWN_NODE")).toBe(true);
  });

  it("enforces official source provenance for APPROVED learning outcomes", () => {
    const outcomeWithoutQuote: LearningOutcome = {
      id: "lo-approved-invalid",
      curriculumReleaseId: "rel-1",
      stage: "LOWER_SECONDARY",
      grade: 6,
      subjectId: "math",
      officialText: "Phép cộng phân số",
      normalizedSummary: "Cộng phân số",
      sourceRef: {
        sourceId: "SRC-VN-MOET-MATH-2018",
        // missing quote
      },
      reviewStatus: "APPROVED",
    };

    const errors = validateLearningOutcomeProvenance(outcomeWithoutQuote);
    expect(errors.some((e) => e.code === "MISSING_SOURCE_PROVENANCE")).toBe(true);
  });
});

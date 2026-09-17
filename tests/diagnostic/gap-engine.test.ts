import { describe, it, expect } from "vitest";
import { evaluateSession, gradeAttempt } from "@/src/domain/diagnostic/engine";
import { detectKnowledgeGap } from "@/src/domain/diagnostic/gap-engine";
import { KnowledgeGraph } from "@/src/domain/curriculum/types";
import { DiagnosticItem } from "@/src/domain/diagnostic/types";

const mockGraph: KnowledgeGraph = {
  id: "graph-fractions",
  subjectId: "math",
  topicId: "fractions",
  version: "1.0.0",
  updatedAt: new Date().toISOString(),
  nodes: [
    {
      id: "NODE-MATH-4-FRAC-01",
      learningOutcomeId: "LO-4-01",
      code: "FRAC.SAME",
      label: "Cộng hai phân số cùng mẫu số",
      description: "Tiểu học",
      kind: "PROCEDURE",
      status: "APPROVED",
      subjectId: "math",
    },
    {
      id: "NODE-MATH-6-INT-01",
      learningOutcomeId: "LO-6-01",
      code: "INT.LCM",
      label: "Tìm Bội chung nhỏ nhất (BCNN)",
      description: "Lớp 6 Số tự nhiên",
      kind: "PROCEDURE",
      status: "APPROVED",
      subjectId: "math",
    },
    {
      id: "NODE-MATH-6-FRAC-02",
      learningOutcomeId: "LO-6-02",
      code: "FRAC.COMMON_DENOM",
      label: "Quy đồng mẫu số các phân số",
      description: "Lớp 6 Phân số",
      kind: "PROCEDURE",
      status: "APPROVED",
      subjectId: "math",
    },
    {
      id: "NODE-MATH-6-FRAC-03",
      learningOutcomeId: "LO-6-03",
      code: "FRAC.ADD_UNLIKE",
      label: "Cộng hai phân số không cùng mẫu số",
      description: "Lớp 6 Mục tiêu",
      kind: "APPLICATION",
      status: "APPROVED",
      subjectId: "math",
    },
  ],
  edges: [
    {
      fromNodeId: "NODE-MATH-6-INT-01",
      toNodeId: "NODE-MATH-6-FRAC-02",
      strength: "REQUIRED",
      rationale: "BCNN cần để quy đồng mẫu",
      evidence: "CURRICULUM_EXPLICIT",
      sourceRefs: [],
      reviewStatus: "APPROVED",
    },
    {
      fromNodeId: "NODE-MATH-6-FRAC-02",
      toNodeId: "NODE-MATH-6-FRAC-03",
      strength: "REQUIRED",
      rationale: "Quy đồng mẫu cần để cộng khác mẫu",
      evidence: "CURRICULUM_EXPLICIT",
      sourceRefs: [],
      reviewStatus: "APPROVED",
    },
    {
      fromNodeId: "NODE-MATH-4-FRAC-01",
      toNodeId: "NODE-MATH-6-FRAC-03",
      strength: "REQUIRED",
      rationale: "Cộng cùng mẫu là bước cuối",
      evidence: "EXPERT_REVIEW",
      sourceRefs: [],
      reviewStatus: "APPROVED",
    },
  ],
};

const itemTarget: DiagnosticItem = {
  id: "ITEM-TARGET",
  primaryNodeId: "NODE-MATH-6-FRAC-03",
  nodeIds: ["NODE-MATH-6-FRAC-03"],
  type: "MULTIPLE_CHOICE",
  cognitiveDemand: "APPLY",
  prompt: "Tính: 3/8 + 5/12",
  correctAnswer: "A",
  rationale: "Đáp án A",
  distractorRationales: { B: "Cộng tử với tử, mẫu với mẫu" },
  misconceptionTags: ["ADD_NUM_AND_DENOM_DIRECTLY"],
  itemStatus: "REVIEWED",
  isReTest: false,
};

const itemCommonDenom: DiagnosticItem = {
  id: "ITEM-DENOM",
  primaryNodeId: "NODE-MATH-6-FRAC-02",
  nodeIds: ["NODE-MATH-6-FRAC-02"],
  type: "MULTIPLE_CHOICE",
  cognitiveDemand: "UNDERSTAND",
  prompt: "Mẫu số chung của 5/6 và 7/9 là:",
  correctAnswer: "A",
  rationale: "18",
  misconceptionTags: ["CONFUSE_LCM_WITH_PRODUCT"],
  itemStatus: "REVIEWED",
  isReTest: false,
};

const itemSameDenom: DiagnosticItem = {
  id: "ITEM-SAME",
  primaryNodeId: "NODE-MATH-4-FRAC-01",
  nodeIds: ["NODE-MATH-4-FRAC-01"],
  type: "MULTIPLE_CHOICE",
  cognitiveDemand: "RECALL",
  prompt: "Tính: 4/15 + 7/15",
  correctAnswer: "A",
  rationale: "11/15",
  misconceptionTags: ["ADD_DENOMINATORS_IN_SAME_DENOM"],
  itemStatus: "REVIEWED",
  isReTest: false,
};

describe("Gap Engine Diagnostic & Tracing", () => {
  it("detects PREREQUISITE_GAP_CANDIDATE when a prerequisite node fails", () => {
    // Student fails target node (selected B: distractor)
    const att1 = gradeAttempt(itemTarget, "B");
    // Student fails prerequisite Common Denominator (selected B)
    const att2 = gradeAttempt(itemCommonDenom, "B");
    // Student succeeds at Same Denominator addition
    const att3 = gradeAttempt(itemSameDenom, "A");

    const session = evaluateSession(
      "sess-1",
      "math",
      "fractions",
      mockGraph.nodes.map((n) => n.id),
      [att1, att2, att3]
    );

    const report = detectKnowledgeGap(mockGraph, session, "NODE-MATH-6-FRAC-03");

    expect(report.classification).toBe("PREREQUISITE_GAP_CANDIDATE");
    expect(report.rootPrerequisiteNodeId).toBe("NODE-MATH-6-FRAC-02");
    expect(report.detectedMisconceptions).toContain("ADD_NUM_AND_DENOM_DIRECTLY");
  });

  it("detects LOCAL_GAP_CANDIDATE when all prerequisites are secure", () => {
    // Student fails target node
    const att1 = gradeAttempt(itemTarget, "B");
    // Student succeeds at prerequisite Common Denominator (2 correct attempts)
    const att2a = gradeAttempt(itemCommonDenom, "A");
    const att2b = gradeAttempt(itemCommonDenom, "A");
    // Student succeeds at Same Denominator (2 correct attempts)
    const att3a = gradeAttempt(itemSameDenom, "A");
    const att3b = gradeAttempt(itemSameDenom, "A");

    const session = evaluateSession(
      "sess-2",
      "math",
      "fractions",
      mockGraph.nodes.map((n) => n.id),
      [att1, att2a, att2b, att3a, att3b]
    );

    const report = detectKnowledgeGap(mockGraph, session, "NODE-MATH-6-FRAC-03");

    expect(report.classification).toBe("LOCAL_GAP_CANDIDATE");
    expect(report.rootPrerequisiteNodeId).toBeUndefined();
  });

  it("reports NO_GAP when target node is SECURE", () => {
    // Student succeeds with 2 correct attempts on target node
    const att1 = gradeAttempt(itemTarget, "A");
    const att2 = gradeAttempt(itemTarget, "A");

    const session = evaluateSession(
      "sess-3",
      "math",
      "fractions",
      mockGraph.nodes.map((n) => n.id),
      [att1, att2]
    );

    const report = detectKnowledgeGap(mockGraph, session, "NODE-MATH-6-FRAC-03");

    expect(report.classification).toBe("NO_GAP");
  });
});

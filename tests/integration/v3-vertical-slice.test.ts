import { describe, it, expect } from "vitest";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";
import { validateKnowledgeGraph } from "@/src/domain/curriculum/graph-validator";
import { evaluateSession, gradeAttempt } from "@/src/domain/diagnostic/engine";
import { detectKnowledgeGap } from "@/src/domain/diagnostic/gap-engine";
import { generateLearningPack } from "@/src/domain/remediation/learning-pack";
import { ManualGeminiNotebookProvider } from "@/src/infrastructure/remediation/gemini-notebook/manual-provider";
import { processReTestOutcome } from "@/src/domain/mastery/history";

describe("V3 Evidence-First Vertical Slice (End-to-End Integration)", () => {
  it("executes the entire evidence-grounded vertical slice lifecycle successfully", () => {
    // 1. Source Registry & Graph Verification
    const registry = CurriculumService.getSourceRegistry();
    expect(registry.sources.length).toBeGreaterThan(0);
    const moetMathSource = registry.sources.find((s) => s.id === "SRC-VN-MOET-MATH-2018");
    expect(moetMathSource).toBeDefined();
    expect(moetMathSource?.status).toBe("CURRENT_NATIONAL");

    const graph = CurriculumService.getFractionsKnowledgeGraph();
    const validationErrors = validateKnowledgeGraph(graph);
    expect(validationErrors).toHaveLength(0);

    // 2. Diagnostic Items Retrieval (R2.2 Publication Gate Verification)
    // Under R2.2 publication enforcement, unreviewed DRAFT canonical items fail closed
    const canonicalInitial = CurriculumService.getInitialDiagnosticItems();
    expect(canonicalInitial).toEqual([]);
    const canonicalReTest = CurriculumService.getReTestItems();
    expect(canonicalReTest).toEqual([]);

    // Sample verified diagnostic items to evaluate the full engine lifecycle
    const diagnosticItems = [
      {
        id: "ITEM-SAMPLE-FRAC-01",
        primaryNodeId: "NODE-MATH-6-FRAC-03",
        nodeIds: ["NODE-MATH-6-FRAC-03"],
        type: "MULTIPLE_CHOICE" as const,
        cognitiveDemand: "APPLY" as const,
        prompt: "Tính 3/8 + 5/12",
        correctAnswer: "A",
        rationale: "MSC = 24",
        misconceptionTags: ["ADD_NUM_AND_DENOM_DIRECTLY"],
        itemStatus: "REVIEWED" as const,
        isReTest: false,
      },
      {
        id: "ITEM-SAMPLE-FRAC-02",
        primaryNodeId: "NODE-MATH-6-FRAC-02",
        nodeIds: ["NODE-MATH-6-FRAC-02"],
        type: "MULTIPLE_CHOICE" as const,
        cognitiveDemand: "APPLY" as const,
        prompt: "Quy đồng 1/6 và 3/8",
        correctAnswer: "A",
        rationale: "BCNN = 24",
        misconceptionTags: ["CONFUSE_LCM_WITH_PRODUCT"],
        itemStatus: "REVIEWED" as const,
        isReTest: false,
      },
      {
        id: "ITEM-SAMPLE-INT-01",
        primaryNodeId: "NODE-MATH-6-INT-01",
        nodeIds: ["NODE-MATH-6-INT-01"],
        type: "MULTIPLE_CHOICE" as const,
        cognitiveDemand: "PROCEDURE" as const,
        prompt: "BCNN của 6 và 8",
        correctAnswer: "24",
        rationale: "BCNN(6, 8) = 24",
        misconceptionTags: [],
        itemStatus: "REVIEWED" as const,
        isReTest: false,
      },
      {
        id: "ITEM-SAMPLE-FRAC-SAME-01",
        primaryNodeId: "NODE-MATH-4-FRAC-01",
        nodeIds: ["NODE-MATH-4-FRAC-01"],
        type: "MULTIPLE_CHOICE" as const,
        cognitiveDemand: "PROCEDURE" as const,
        prompt: "1/5 + 2/5",
        correctAnswer: "3/5",
        rationale: "Cùng mẫu",
        misconceptionTags: [],
        itemStatus: "REVIEWED" as const,
        isReTest: false,
      },
    ];

    // 3. Student Takes Diagnostic Test:
    // Student fails Target item (Grade 6 Unlike Denom) with distractor B ("ADD_NUM_AND_DENOM_DIRECTLY")
    const itemTarget = diagnosticItems.find((i) => i.primaryNodeId === "NODE-MATH-6-FRAC-03")!;
    const attemptTarget = gradeAttempt(itemTarget, "B");
    expect(attemptTarget.isCorrect).toBe(false);
    expect(attemptTarget.detectedMisconceptions).toContain("ADD_NUM_AND_DENOM_DIRECTLY");

    // Student fails Prerequisite item (Common Denominator) with distractor B ("CONFUSE_LCM_WITH_PRODUCT")
    const itemCommonDenom = diagnosticItems.find((i) => i.primaryNodeId === "NODE-MATH-6-FRAC-02")!;
    const attemptCommonDenom = gradeAttempt(itemCommonDenom, "B");
    expect(attemptCommonDenom.isCorrect).toBe(false);
    expect(attemptCommonDenom.detectedMisconceptions).toContain("CONFUSE_LCM_WITH_PRODUCT");

    // Student succeeds at foundational integer LCM
    const itemLcm = diagnosticItems.find((i) => i.primaryNodeId === "NODE-MATH-6-INT-01")!;
    const attemptLcm = gradeAttempt(itemLcm, itemLcm.correctAnswer);
    expect(attemptLcm.isCorrect).toBe(true);

    // Student succeeds at Grade 4 Same Denominator addition
    const itemSameDenom = diagnosticItems.find((i) => i.primaryNodeId === "NODE-MATH-4-FRAC-01")!;
    const attemptSameDenom = gradeAttempt(itemSameDenom, itemSameDenom.correctAnswer);
    expect(attemptSameDenom.isCorrect).toBe(true);

    // 4. Deterministic State Evaluation
    const session = evaluateSession(
      "sess-e2e-v3-001",
      "math",
      "fractions",
      graph.nodes.map((n) => n.id),
      [attemptTarget, attemptCommonDenom, attemptLcm, attemptSameDenom]
    );

    expect(session.nodeStates["NODE-MATH-6-FRAC-03"].state).toBe("DEVELOPING");
    expect(session.nodeStates["NODE-MATH-6-FRAC-02"].state).toBe("DEVELOPING");
    expect(session.nodeStates["NODE-MATH-6-INT-01"].state).toBe("SECURE");
    expect(session.nodeStates["NODE-MATH-4-FRAC-01"].state).toBe("SECURE");

    // 5. Gap Engine Root Prerequisite Detection
    const gapReport = detectKnowledgeGap(graph, session, "NODE-MATH-6-FRAC-03");
    expect(gapReport.classification).toBe("PREREQUISITE_GAP_CANDIDATE");
    expect(gapReport.rootPrerequisiteNodeId).toBe("NODE-MATH-6-FRAC-02");
    expect(gapReport.detectedMisconceptions).toContain("ADD_NUM_AND_DENOM_DIRECTLY");
    expect(gapReport.prerequisiteChainPath).toEqual([
      "NODE-MATH-6-FRAC-02",
      "NODE-MATH-6-FRAC-03",
    ]);

    // 6. Learning Pack Generation (Publication Gate Enforcement)
    const learningPack = generateLearningPack(gapReport);
    expect(learningPack.focusNodeId).toBe("NODE-MATH-6-FRAC-02");
    expect(learningPack.curriculumSourceRefs[0].sourceId).toBe("SRC-VN-MOET-MATH-2018");
    // Under R2.2, unreviewed learning content fails closed to CONTENT_NOT_AVAILABLE
    expect(learningPack.contentStatus).toBe("CONTENT_NOT_AVAILABLE");
    expect(learningPack.workedExamplePlan).toEqual([]);
    expect(learningPack.learningResourceRefs).toEqual([]);
    expect((learningPack as any).geminiNotebookInstructions).toBeUndefined();

    const manualGuide = ManualGeminiNotebookProvider.getRemediationGuide(learningPack);
    expect(manualGuide.notebookUrl).toBe("https://notebooklm.google.com/");
    expect(manualGuide.stepByStepGuide).toHaveLength(5);
    expect(manualGuide.suggestedPrompt).toContain("Bộ GD&ĐT");

    // 7. Student Completes Remediation & Takes Parallel Re-Test
    const sampleReTestItems = [
      {
        id: "ITEM-SAMPLE-RETEST-01",
        primaryNodeId: "NODE-MATH-6-FRAC-03",
        nodeIds: ["NODE-MATH-6-FRAC-03"],
        type: "MULTIPLE_CHOICE" as const,
        cognitiveDemand: "APPLY" as const,
        prompt: "Tính 1/4 + 1/6",
        correctAnswer: "5/12",
        rationale: "MSC = 12",
        misconceptionTags: [],
        itemStatus: "REVIEWED" as const,
        isReTest: true,
      },
    ];

    const targetReTestItems = sampleReTestItems.filter(
      (i) => i.primaryNodeId === "NODE-MATH-6-FRAC-03"
    );
    expect(targetReTestItems.length).toBeGreaterThanOrEqual(1);

    const reTestAttempts = targetReTestItems.map((item) =>
      gradeAttempt(item, item.correctAnswer)
    );
    expect(reTestAttempts.every((a) => a.isCorrect)).toBe(true);

    const masteryTransition = processReTestOutcome(
      "student-v3-e2e",
      "NODE-MATH-6-FRAC-03",
      "Cộng hai phân số khác mẫu số",
      session.nodeStates["NODE-MATH-6-FRAC-03"].state,
      session.nodeStates["NODE-MATH-6-FRAC-03"].confidence,
      reTestAttempts,
      learningPack.id
    );

    // 8. Mastery State Transitions from DEVELOPING to SECURE
    expect(masteryTransition.previousState).toBe("DEVELOPING");
    expect(masteryTransition.newState).toBe("SECURE");
    expect(masteryTransition.newConfidence).toBe("HIGH");
    expect(masteryTransition.learningPackId).toBe(learningPack.id);
    expect(masteryTransition.reason).toContain("đã được khắc phục thành công");
  });
});

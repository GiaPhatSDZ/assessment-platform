import { describe, it, expect } from "vitest";
import { generateLearningPack } from "@/src/domain/remediation/learning-pack";
import { ManualGeminiNotebookProvider } from "@/src/infrastructure/remediation/gemini-notebook/manual-provider";
import { processReTestOutcome } from "@/src/domain/mastery/history";
import { GapReport } from "@/src/domain/diagnostic/gap-engine";
import { ItemAttempt } from "@/src/domain/diagnostic/types";

describe("Learning Pack & Re-test Mastery Cycle", () => {
  const mockGapReport: GapReport = {
    sessionId: "sess-100",
    targetNodeId: "NODE-MATH-6-FRAC-03",
    targetNodeLabel: "Cộng, trừ hai phân số không cùng mẫu số",
    classification: "PREREQUISITE_GAP_CANDIDATE",
    primaryFailingNodeId: "NODE-MATH-6-FRAC-03",
    primaryFailingNodeLabel: "Cộng, trừ hai phân số không cùng mẫu số",
    rootPrerequisiteNodeId: "NODE-MATH-6-FRAC-02",
    rootPrerequisiteNodeLabel: "Quy đồng mẫu số các phân số",
    prerequisiteChainPath: ["NODE-MATH-6-FRAC-02", "NODE-MATH-6-FRAC-03"],
    detectedMisconceptions: ["ADD_NUM_AND_DENOM_DIRECTLY"],
    explanation: "Hổng kiến thức quy đồng mẫu số",
    actionableNextStep: "Học lại quy đồng",
    generatedAt: new Date().toISOString(),
    ruleVersion: "1.0.0",
  };

  it("generates a source-grounded learning pack targeting the root prerequisite gap", () => {
    const pack = generateLearningPack(mockGapReport);

    expect(pack.focusNodeId).toBe("NODE-MATH-6-FRAC-02");
    expect(pack.focusNodeLabel).toBe("Quy đồng mẫu số các phân số");
    expect(pack.curriculumSourceRefs[0].sourceId).toBe("SRC-VN-MOET-MATH-2018");
    expect(pack.geminiNotebookInstructions.copyablePrompt).toContain("Bộ GD&ĐT");
    expect(pack.workedExamplePlan.length).toBeGreaterThan(0);
  });

  it("produces valid Gemini Notebook manual instructions", () => {
    const pack = generateLearningPack(mockGapReport);
    const guide = ManualGeminiNotebookProvider.getRemediationGuide(pack);

    expect(guide.notebookUrl).toBe("https://notebooklm.google.com/");
    expect(guide.stepByStepGuide.length).toBe(5);
    expect(guide.suggestedPrompt).toBe(pack.geminiNotebookInstructions.copyablePrompt);
  });

  it("transitions mastery from DEVELOPING to SECURE when re-test passes", () => {
    const reTestAttempts: ItemAttempt[] = [
      {
        itemId: "ITEM-RETEST-FRAC-01",
        primaryNodeId: "NODE-MATH-6-FRAC-03",
        studentAnswer: "A",
        isCorrect: true,
        detectedMisconceptions: [],
        attemptedAt: new Date().toISOString(),
      },
      {
        itemId: "ITEM-RETEST-FRAC-02",
        primaryNodeId: "NODE-MATH-6-FRAC-03",
        studentAnswer: "A",
        isCorrect: true,
        detectedMisconceptions: [],
        attemptedAt: new Date().toISOString(),
      },
    ];

    const transition = processReTestOutcome(
      "student-1",
      "NODE-MATH-6-FRAC-03",
      "Cộng hai phân số khác mẫu",
      "DEVELOPING",
      "MEDIUM",
      reTestAttempts,
      "LP-123"
    );

    expect(transition.previousState).toBe("DEVELOPING");
    expect(transition.newState).toBe("SECURE");
    expect(transition.newConfidence).toBe("HIGH");
    expect(transition.reTestCorrectCount).toBe(2);
    expect(transition.reason).toContain("đã được khắc phục thành công");
  });
});

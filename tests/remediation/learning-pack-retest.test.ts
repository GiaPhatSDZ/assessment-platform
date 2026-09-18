import { describe, it, expect } from "vitest";
import { generateLearningPack } from "@/src/domain/remediation/learning-pack";
import { ManualGeminiNotebookProvider } from "@/src/infrastructure/remediation/gemini-notebook/manual-provider";
import { processReTestOutcome } from "@/src/domain/mastery/history";
import { GapReport } from "@/src/domain/diagnostic/gap-engine";
import { ItemAttempt } from "@/src/domain/diagnostic/types";
import { canonicalContentHash } from "@/src/domain/content/canonical-content-hash";
import { createTestReviewerAuthority, setTestReviewerAuthority } from "@/src/domain/content/reviewer-registry";

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

  it("generates a source-grounded learning pack failing closed when content is unreviewed", () => {
    const pack = generateLearningPack(mockGapReport);

    expect(pack.focusNodeId).toBe("NODE-MATH-6-FRAC-02");
    expect(pack.focusNodeLabel).toBe("Quy đồng mẫu số các phân số");
    expect(pack.curriculumSourceRefs[0].sourceId).toBe("SRC-VN-MOET-MATH-2018");
    // Student LearningPack is isolated from parent AI prompt fields
    expect((pack as any).geminiNotebookInstructions).toBeUndefined();
    // Under R2.2 publication gate, unreviewed learning content cannot be exposed to students
    expect(pack.contentStatus).toBe("CONTENT_NOT_AVAILABLE");
    expect(pack.workedExamplePlan.length).toBe(0);
    expect(pack.learningResourceRefs.length).toBe(0);
  });

  it("populates worked examples and published status when a reviewed lesson is provided", () => {
    const mockReviewedLesson = {
      id: "LESSON-MOCK-01",
      nodeIds: ["NODE-MATH-6-FRAC-02"],
      title: "Quy đồng mẫu số các phân số",
      publicationState: "PUBLISHED_VERIFIED",
      reviewState: "INTERNAL_REVIEWED",
      itemMaturity: "REVIEWED",
      authoringOrigin: "HUMAN",
      learnerText: [{ type: "text", value: "Quy tắc 3 bước quy đồng mẫu số." }],
      workedExamples: [
        {
          prompt: [{ type: "text", value: "Quy đồng 1/6 và 3/8" }],
          steps: [{ type: "text", value: "BCNN là 24" }],
          finalAnswer: "4/24 và 9/24",
        },
      ],
      reviewAttestation: {
        reviewerId: "REV-HUMAN-01",
        role: "PEDAGOGICAL_CONTROLLER",
        decision: "APPROVE",
        scope: "LESSON",
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        contentHash: "PLACEHOLDER",
        attestedAt: "2026-09-18T00:00:00.000Z",
      },
    };
    setTestReviewerAuthority(createTestReviewerAuthority([{
      reviewerId: "REV-HUMAN-01",
      type: "HUMAN",
      role: "PEDAGOGICAL_CONTROLLER",
      active: true,
      verifiedByController: true,
    }]));

    mockReviewedLesson.reviewAttestation.contentHash = canonicalContentHash(mockReviewedLesson);

    const pack = generateLearningPack(mockGapReport, mockReviewedLesson);
    expect(pack.contentStatus).toBe("PUBLISHED");
    expect(pack.workedExamplePlan.length).toBe(1);
    expect(pack.workedExamplePlan[0]).toContain("Quy đồng 1/6 và 3/8");
    expect(pack.learningResourceRefs.length).toBe(1);

    setTestReviewerAuthority(null);
  });

  it("produces valid Gemini Notebook manual instructions", () => {
    const pack = generateLearningPack(mockGapReport);
    const guide = ManualGeminiNotebookProvider.getRemediationGuide(pack);

    expect(guide.notebookUrl).toBe("https://notebooklm.google.com/");
    expect(guide.stepByStepGuide.length).toBe(5);
    expect(guide.suggestedPrompt).toContain("Bộ GD&ĐT");
    expect((pack as any).copyablePrompt).toBeUndefined();
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

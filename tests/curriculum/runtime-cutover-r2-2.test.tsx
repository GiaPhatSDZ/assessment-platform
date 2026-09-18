/**
 * AI School V3 — R2.2 Student Runtime Cutover Regression Test Suite
 * 
 * Verifies all 7 Controller Audit Regression Requirements:
 * 1. Active Grade 6 route cannot render legacy reviewed JSON
 * 2. DRAFT canonical question items cannot reach student diagnostic
 * 3. Student learning pack cannot render Tier-D/unreviewed learning content
 * 4. Student flow contains no NotebookLM/Gemini handoff
 * 5. False APPROVED UI copy is absent
 * 6. Publication guard remains the sole content authorization path
 * 7. Existing R2.2 stale-attestation tests remain green
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

import { CurriculumService } from "@/src/application/curriculum/curriculum-service";
import { Grade6FractionsDiagnosticFlow } from "@/components/v3/diagnostic/Grade6FractionsDiagnosticFlow";
import { generateLearningPack } from "@/src/domain/remediation/learning-pack";
import { LearningPackView } from "@/components/v3/remediation/LearningPackView";
import { NewDiagnosticWizard } from "@/components/v3/profile/NewDiagnosticWizard";
import { CoverageExplorer } from "@/components/v3/curriculum/CoverageExplorer";
import {
  assertPublishedForStudent,
  filterPublishedForStudent,
  isPublishedForStudent,
  assertNoAiGenerationFallback,
  ContentNotPublishedError,
  StudentRuntimeAiViolationError,
} from "@/src/domain/content/publication-guard";
import {
  ReviewerRecord,
  ReviewerAuthorizationError,
  createTestReviewerAuthority,
  setTestReviewerAuthority,
  getEffectiveReviewerAuthority,
  productionReviewerAuthority,
} from "@/src/domain/content/reviewer-registry";
import { canonicalContentHash } from "@/src/domain/content/canonical-content-hash";
import { GapReport } from "@/src/domain/diagnostic/gap-engine";

const mockGapReport: GapReport = {
  sessionId: "sess-regression-1",
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

describe("R2.2 Student Runtime Cutover Audit Regression Suite", () => {
  beforeEach(() => {
    // Reset test authority override before each test
    setTestReviewerAuthority(null);
  });

  afterEach(() => {
    setTestReviewerAuthority(null);
  });

  // =========================================================================
  // Requirement 1: Active Grade 6 route cannot render legacy reviewed JSON
  // =========================================================================
  describe("Requirement 1: Active Grade 6 route cannot render legacy reviewed JSON", () => {
    it("ensures CurriculumService does not source items from legacy reviewed file", () => {
      const curriculumServiceSource = fs.readFileSync(
        path.join(process.cwd(), "src/application/curriculum/curriculum-service.ts"),
        "utf-8"
      );

      // Must not import or reference the legacy reviewed file
      expect(curriculumServiceSource).not.toContain("assessment-items/reviewed/math-grade6-fractions.json");
      expect(curriculumServiceSource).not.toContain("fractionsItemsData");
    });

    it("ensures legacy reviewed question IDs never leak into initial or re-test diagnostic items", () => {
      const initialItems = CurriculumService.getInitialDiagnosticItems();
      const reTestItems = CurriculumService.getReTestItems();

      const legacyItemIds = [
        "ITEM-DIAG-FRAC-01",
        "ITEM-DIAG-FRAC-02",
        "ITEM-DIAG-INT-01",
        "ITEM-DIAG-FRAC-SAME-01",
        "ITEM-RETEST-FRAC-01",
        "ITEM-RETEST-FRAC-02",
        "ITEM-RETEST-INT-01",
        "ITEM-RETEST-FRAC-SAME-01",
      ];

      for (const legacyId of legacyItemIds) {
        expect(initialItems.some((i) => i.id === legacyId)).toBe(false);
        expect(reTestItems.some((i) => i.id === legacyId)).toBe(false);
      }
    });

    it("ensures active Grade 6 diagnostic component does not render legacy questions in DOM", () => {
      const { container } = render(<Grade6FractionsDiagnosticFlow />);

      expect(container.textContent).not.toContain("ITEM-DIAG-FRAC-01");
      expect(container.textContent).not.toContain("ITEM-DIAG-FRAC-02");
      expect(container.textContent).not.toContain("3/8 + 5/12");
      // Must display the fail-closed notice
      expect(screen.getByTestId("content-not-available")).toBeTruthy();
    });
  });

  // =========================================================================
  // Requirement 2: DRAFT canonical question items cannot reach student diagnostic
  // =========================================================================
  describe("Requirement 2: DRAFT canonical question items cannot reach student diagnostic", () => {
    it("confirms canonical question bank items are strictly DRAFT and fail publication gate", () => {
      const canonicalItemsPath = path.join(
        process.cwd(),
        "curriculum/vietnam/lower-secondary/grade-6/math/question-bank/items.json"
      );
      const canonicalItems = JSON.parse(fs.readFileSync(canonicalItemsPath, "utf-8"));

      expect(canonicalItems.length).toBeGreaterThan(0);

      // All canonical items must be in DRAFT maturity and AI_DRAFT review state
      for (const item of canonicalItems) {
        expect(item.itemMaturity).toBe("DRAFT");
        expect(item.reviewState).toBe("AI_DRAFT");
        expect(item.publicationState).toBe("DRAFT");
        expect(item.reviewAttestation).toBeUndefined();

        // Must throw ContentNotPublishedError when tested against student gate
        expect(() => assertPublishedForStudent(item)).toThrowError(ContentNotPublishedError);
      }
    });

    it("filterPublishedForStudent rejects all canonical items and CurriculumService returns empty array", () => {
      const initialItems = CurriculumService.getInitialDiagnosticItems();
      const reTestItems = CurriculumService.getReTestItems();

      // Zero items pass the publication guard
      expect(initialItems).toEqual([]);
      expect(reTestItems).toEqual([]);
    });

    it("renders authoritative CONTENT_NOT_AVAILABLE view rather than serving unreviewed draft questions", () => {
      render(<Grade6FractionsDiagnosticFlow />);

      expect(screen.getByText(/CONTENT_NOT_AVAILABLE · ĐANG THẨM ĐỊNH \(DRAFT\)/i)).toBeTruthy();
      expect(screen.getByText(/Học liệu chẩn đoán đang trong quá trình thẩm định sư phạm/i)).toBeTruthy();
      expect(screen.getByText(/Không phục vụ câu hỏi chưa kiểm duyệt/i)).toBeTruthy();
      expect(screen.getByText(/Nghiêm cấm AI tạo sinh tùy tiện/i)).toBeTruthy();
    });
  });

  // =========================================================================
  // Requirement 3: Student learning pack cannot render Tier-D/unreviewed learning content
  // =========================================================================
  describe("Requirement 3: Student learning pack cannot render Tier-D/unreviewed learning content", () => {
    it("generateLearningPack sets CONTENT_NOT_AVAILABLE and strips Tier-D resources for draft content", () => {
      const pack = generateLearningPack(mockGapReport);

      expect(pack.contentStatus).toBe("CONTENT_NOT_AVAILABLE");
      expect(pack.learningResourceRefs).toEqual([]);
      expect(pack.workedExamplePlan).toEqual([]);
      expect(pack.practicePlan).toEqual([]);
      expect(pack.learnerGuide).toBe("");
    });

    it("LearningPackView renders CONTENT_NOT_AVAILABLE and hides unreviewed worked examples", () => {
      const pack = generateLearningPack(mockGapReport);
      const { container } = render(
        <LearningPackView pack={pack} onProceedToRetest={() => {}} />
      );

      expect(screen.getByTestId("learning-pack-not-available")).toBeTruthy();
      expect(screen.getByText(/CONTENT_NOT_AVAILABLE · HỌC LIỆU ĐANG THẨM ĐỊNH/i)).toBeTruthy();
      expect(screen.getByText(/Học liệu hướng dẫn đang được thẩm định sư phạm/i)).toBeTruthy();
      // Must not render Tier-D or hardcoded examples
      expect(container.textContent).not.toContain("Ví Dụ Mẫu & Phương Pháp Giải Từng Bước");
      expect(container.textContent).not.toContain("BCNN = 2^3 * 3 = 24");
      expect(container.textContent).not.toContain("RES-MATH-G6-BCNN");
    });
  });

  // =========================================================================
  // Requirement 4: Student flow contains no NotebookLM/Gemini handoff
  // =========================================================================
  describe("Requirement 4: Student flow contains no NotebookLM/Gemini handoff", () => {
    it("ensures LearningPackView source code does not import or use GeminiHandoff", () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), "components/v3/remediation/LearningPackView.tsx"),
        "utf-8"
      );

      expect(source).not.toContain("GeminiHandoff");
      expect(source).not.toContain("copyablePrompt");
    });

    it("ensures student learning pack DOM contains no NotebookLM links or copyable AI prompts", () => {
      const pack = generateLearningPack(mockGapReport);
      const { container } = render(
        <LearningPackView pack={pack} onProceedToRetest={() => {}} />
      );

      expect(container.textContent).not.toContain("NotebookLM");
      expect(container.textContent).not.toContain("copyablePrompt");
      expect(container.textContent).not.toContain("Mở trong Google NotebookLM");
    });
  });

  // =========================================================================
  // Requirement 5: False APPROVED UI copy is absent
  // =========================================================================
  describe("Requirement 5: False APPROVED UI copy is absent", () => {
    it("ensures NewDiagnosticWizard does not display false 'Sẵn sàng' or 'Đã duyệt (APPROVED)' claims across all steps", () => {
      const { container } = render(<NewDiagnosticWizard />);

      // Step 1 -> Step 2
      const nextBtn1 = screen.getByRole("button", { name: /Tiếp tục/i });
      fireEvent.click(nextBtn1);

      // Step 2 assertions:
      expect(container.textContent).not.toContain("Sẵn sàng");
      expect(container.textContent).not.toContain("Hiện tại hệ thống đã hoàn thiện thẩm định đối soát cho Lớp 6");
      expect(container.textContent).toContain("Đang thẩm định (DRAFT)");

      // Step 2 -> Step 3
      const nextBtn2 = screen.getByRole("button", { name: /Tiếp tục/i });
      fireEvent.click(nextBtn2);

      // Step 3 assertions:
      expect(container.textContent).not.toContain("Đã duyệt (APPROVED)");
      expect(container.textContent).toContain("Đang thẩm định (CONTENT_IN_REVIEW)");

      // Step 3 -> Step 4
      const nextBtn3 = screen.getByRole("button", { name: /Tiếp tục/i });
      fireEvent.click(nextBtn3);

      // Step 4 assertions:
      expect(container.textContent).not.toContain("Lát cắt đã hoàn thiện");
      expect(container.textContent).toContain("Đang thẩm định (DRAFT)");
    });

    it("ensures CoverageExplorer does not mark Grade 6 fractions as AVAILABLE (Đã có chẩn đoán)", () => {
      const { container } = render(<CoverageExplorer />);

      // Grade 6 fractions topic must not claim "Đã có chẩn đoán"
      const rows = container.querySelectorAll("tr");
      let foundGrade6Row = false;
      rows.forEach((row) => {
        if (row.textContent?.includes("Cộng, trừ hai phân số không cùng mẫu số")) {
          foundGrade6Row = true;
          expect(row.textContent).not.toContain("Đã có chẩn đoán");
          expect(row.textContent).toContain("Đang biên soạn");
        }
      });
      expect(foundGrade6Row).toBe(true);
    });
  });

  // =========================================================================
  // Requirement 6: Publication guard remains the sole content authorization path
  // =========================================================================
  describe("Requirement 6: Publication guard remains the sole content authorization path", () => {
    it("prohibits generative AI fallback in student runtime", () => {
      expect(() => assertNoAiGenerationFallback("STUDENT")).toThrowError(
        StudentRuntimeAiViolationError
      );
      // Parent audience is allowed for Parent Copilot
      expect(() => assertNoAiGenerationFallback("PARENT")).not.toThrow();
    });

    it("forbids arbitrary runtime authority injection outside test environment", () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        // Simulate production environment
        (process.env as any).NODE_ENV = "production";

        // Calling test mutation helpers in production throws ReviewerAuthorizationError
        expect(() => {
          setTestReviewerAuthority(createTestReviewerAuthority([]));
        }).toThrowError(ReviewerAuthorizationError);

        // Injecting an arbitrary authority argument into publication guard in production throws ReviewerAuthorizationError
        const fakeAuthority = {
          getReviewer: () => undefined,
          isTrustedReviewer: () => true,
          assertTrustedReviewer: () => ({}) as any,
        };

        const mockItem = {
          id: "ITEM-FORGED",
          publicationState: "PUBLISHED_VERIFIED" as const,
          reviewState: "INTERNAL_REVIEWED" as const,
          itemMaturity: "REVIEWED",
          authoringOrigin: "HUMAN" as const,
        };

        expect(() => {
          assertPublishedForStudent(mockItem as any, fakeAuthority as any);
        }).toThrowError(ReviewerAuthorizationError);
      } finally {
        (process.env as any).NODE_ENV = originalNodeEnv;
      }
    });

    it("verifies productionReviewerAuthority is empty by default (fail-closed)", () => {
      expect(productionReviewerAuthority.getReviewer("ANY_ID")).toBeUndefined();
      expect(productionReviewerAuthority.isTrustedReviewer("ANY_ID")).toBe(false);
    });
  });

  // =========================================================================
  // Requirement 7: Existing R2.2 stale-attestation tests remain green
  // =========================================================================
  describe("Requirement 7: Existing R2.2 stale-attestation tests integrity", () => {
    it("detects post-review tampering via cryptographic hash divergence (REVIEW_ATTESTATION_STALE)", () => {
      const trustedReviewer: ReviewerRecord = {
        reviewerId: "REV-HUMAN-01",
        type: "HUMAN",
        role: "PEDAGOGICAL_CONTROLLER",
        active: true,
        verifiedByController: true,
      };

      setTestReviewerAuthority(createTestReviewerAuthority([trustedReviewer]));

      const questionItem = {
        id: "ITEM-TEST-TAMPER-01",
        primaryNodeId: "NODE-MATH-6-FRAC-03",
        type: "MULTIPLE_CHOICE",
        cognitiveDemand: "APPLY",
        prompt: [{ type: "text", value: "Tính giá trị:" }],
        options: [
          { id: "opt-1", content: [{ type: "text", value: "19/24" }], isCorrect: true },
          { id: "opt-2", content: [{ type: "text", value: "8/20" }], isCorrect: false },
        ],
        correctAnswer: "opt-1",
        rationale: "Quy đồng mẫu số với MSC = 24.",
        authoringOrigin: "HUMAN" as const,
        itemMaturity: "REVIEWED",
        reviewState: "INTERNAL_REVIEWED" as const,
        publicationState: "PUBLISHED_VERIFIED" as const,
        reviewAttestation: {
          reviewerId: "REV-HUMAN-01",
          role: "PEDAGOGICAL_CONTROLLER" as const,
          decision: "APPROVE" as const,
          scope: "QUESTION_ITEM" as const,
          hashAlgorithm: "SHA-256" as const,
          hashSchemaVersion: "content-hash-v1" as const,
          contentHash: "PLACEHOLDER",
          attestedAt: "2026-09-18T00:00:00.000Z",
        },
      };

      // Set legitimate hash
      questionItem.reviewAttestation.contentHash = canonicalContentHash(questionItem);

      // Verification succeeds before tampering
      expect(() => assertPublishedForStudent(questionItem)).not.toThrow();

      // Tamper with correctAnswer
      const tamperedItem = { ...questionItem, correctAnswer: "opt-2" };

      // Verification fails closed with REVIEW_ATTESTATION_STALE
      expect(() => assertPublishedForStudent(tamperedItem)).toThrowError(
        /REVIEW_ATTESTATION_STALE/
      );
    });
  });
});

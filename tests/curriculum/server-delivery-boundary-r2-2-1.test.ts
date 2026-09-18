import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { StudentContentDeliveryService } from "@/src/application/curriculum/student-content-delivery-service";
import { CurriculumService } from "@/src/application/curriculum/curriculum-service";
import { generateLearningPack } from "@/src/domain/remediation/learning-pack";
import {
  promoteContent,
  assertPublishedForStudent,
  ContentNotPublishedError,
} from "@/src/domain/content/publication-guard";
import {
  createTestReviewerAuthority,
  ReviewerAuthorizationError,
} from "@/src/domain/content/reviewer-registry";
import { canonicalContentHash } from "@/src/domain/content/canonical-content-hash";
import { ReviewAttestation } from "@/src/domain/content/schema";

describe("R2.2.1 Server Delivery Boundary & Freeze Cleanup Suite", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
  });

  const mockGapReport = {
    sessionId: "SESSION-R2-2-1-TEST",
    targetNodeId: "NODE-MATH-6-FRAC-03",
    targetNodeLabel: "Cộng hai phân số khác mẫu số",
    classification: "PREREQUISITE_GAP_CANDIDATE" as const,
    rootPrerequisiteNodeId: "NODE-MATH-6-FRAC-02",
    rootPrerequisiteNodeLabel: "Quy đồng mẫu số các phân số",
    confidence: "HIGH" as const,
    evidenceAttemptCount: 3,
    prerequisiteChainPath: ["NODE-MATH-6-FRAC-02", "NODE-MATH-6-FRAC-03"],
    detectedMisconceptions: ["ADD_NUM_AND_DENOM_DIRECTLY"],
    explanation: "Hổng kiến thức quy đồng",
    actionableNextStep: "Ôn tập quy đồng",
    generatedAt: new Date().toISOString(),
    ruleVersion: "1.0.0",
  };

  // =========================================================================
  // MANDATORY TEST A & B: Sentinels absent from client source and static chunks
  // =========================================================================
  describe("A & B: DRAFT Sentinels absent from client modules and production chunks", () => {
    it("proves client-side curriculum-service and learning-pack do not import unpublished canonical JSON", () => {
      const currServiceSource = fs.readFileSync(
        path.join(process.cwd(), "src/application/curriculum/curriculum-service.ts"),
        "utf-8"
      );
      expect(currServiceSource).not.toContain("question-bank/items.json");
      expect(currServiceSource).not.toContain("fractions-addition.json");

      const learningPackSource = fs.readFileSync(
        path.join(process.cwd(), "src/domain/remediation/learning-pack.ts"),
        "utf-8"
      );
      expect(learningPackSource).not.toContain("question-bank/items.json");
      expect(learningPackSource).not.toContain("fractions-addition.json");
    });

    it("ensures canonical unpublished JSON is ONLY imported from modules marked with 'server-only'", () => {
      const srcDir = path.join(process.cwd(), "src");
      const componentsDir = path.join(process.cwd(), "components");

      function scanFiles(dir: string): string[] {
        let results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(scanFiles(fullPath));
          } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
            results.push(fullPath);
          }
        }
        return results;
      }

      const allSourceFiles = [...scanFiles(srcDir), ...scanFiles(componentsDir)];

      for (const filePath of allSourceFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        const importsDraftQuestionBank = content.includes("question-bank/items.json");
        const importsDraftLesson = content.includes("fractions-addition.json");

        if (importsDraftQuestionBank || importsDraftLesson) {
          // File MUST declare server-only
          expect(
            content.includes('import "server-only"') || content.includes("import 'server-only'")
          ).toBe(true);
        }
      }
    });

    it("verifies production static chunks (if built) do not contain DRAFT sentinels", () => {
      const staticDir = path.join(process.cwd(), ".next/static");
      if (!fs.existsSync(staticDir)) {
        // Build has not run yet in this test step; skip static file scan
        return;
      }

      function scanChunkFiles(dir: string): string[] {
        let results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(scanChunkFiles(fullPath));
          } else if (entry.isFile() && entry.name.endsWith(".js")) {
            results.push(fullPath);
          }
        }
        return results;
      }

      const chunkFiles = scanChunkFiles(staticDir);
      expect(chunkFiles.length).toBeGreaterThan(0);

      for (const chunkFile of chunkFiles) {
        const chunkContent = fs.readFileSync(chunkFile, "utf-8");
        // Sentinel A: Question item ID
        expect(chunkContent).not.toContain("ITEM-G6-FRAC-01");
        // Sentinel B: Lesson pedagogical text
        expect(chunkContent).not.toContain("LESSON-MATH-6-FRAC-01");
        expect(chunkContent).not.toContain("Để cộng hai phân số có mẫu số khác nhau, ta không thể cộng ngay");
      }
    });
  });

  // =========================================================================
  // MANDATORY TEST C: Server delivery returns zero student items for current DRAFT bank
  // =========================================================================
  describe("C: Server delivery returns zero student items for current DRAFT bank", () => {
    it("returns CONTENT_NOT_AVAILABLE with empty items and reTestItems", () => {
      const delivery = StudentContentDeliveryService.getDiagnosticDelivery("math-grade6-fractions");

      expect(delivery.status).toBe("CONTENT_NOT_AVAILABLE");
      expect(delivery.items).toEqual([]);
      expect(delivery.reTestItems).toEqual([]);
      expect(delivery.topicId).toBe("math-grade6-fractions");
      expect(delivery.reason).toBe("DRAFT_AWAITING_HUMAN_REVIEW");
    });

    it("returns null for unpublished lesson delivery", () => {
      const lesson = StudentContentDeliveryService.getLessonDelivery("NODE-MATH-6-FRAC-02");
      expect(lesson).toBeNull();
    });
  });

  // =========================================================================
  // MANDATORY TEST D: Client receives only CONTENT_NOT_AVAILABLE state
  // =========================================================================
  describe("D: Client receives only CONTENT_NOT_AVAILABLE state", () => {
    it("CurriculumService client helper returns fail-closed zero items", () => {
      expect(CurriculumService.getInitialDiagnosticItems()).toEqual([]);
      expect(CurriculumService.getReTestItems()).toEqual([]);
    });

    it("generateLearningPack without reviewed server lesson returns CONTENT_NOT_AVAILABLE", () => {
      const pack = generateLearningPack(mockGapReport);

      expect(pack.contentStatus).toBe("CONTENT_NOT_AVAILABLE");
      expect(pack.workedExamplePlan).toEqual([]);
      expect(pack.practicePlan).toEqual([]);
      expect(pack.learningResourceRefs).toEqual([]);
      expect(pack.learnerGuide).toBe("");
    });
  });

  // =========================================================================
  // MANDATORY TEST E: Arbitrary production authority injection into promoteContent fails
  // =========================================================================
  describe("E: Arbitrary production authority injection into promoteContent fails", () => {
    it("throws SECURITY_VIOLATION when custom authority is passed in production", () => {
      const dummyItem = {
        id: "ITEM-TEST-PROMO",
        primaryNodeId: "NODE-TEST",
        supportingNodeIds: [],
        type: "MULTIPLE_CHOICE" as const,
        cognitiveDemand: "APPLY" as const,
        prompt: [{ type: "text" as const, value: "Test prompt" }],
        correctAnswer: "opt-1",
        rationale: "Test rationale",
        misconceptionTags: [],
        sourceRefs: [],
        authoringOrigin: "HUMAN" as const,
        itemMaturity: "DRAFT" as const,
        reviewState: "AI_DRAFT" as const,
        publicationState: "DRAFT" as const,
        version: "1.0.0",
      };

      const computedHash = canonicalContentHash(dummyItem);
      const attestation: ReviewAttestation = {
        reviewerId: "REV-HUMAN-CONTROLLER-999",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: new Date().toISOString(),
        contentHash: computedHash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
      };

      const rogueAuthority = new (class {
        assertTrustedReviewer() {}
        isTrustedReviewer() { return true; }
        getReviewer() { return null; }
        getAllReviewers() { return []; }
      })();

      (process.env as any).NODE_ENV = "production";

      expect(() => {
        promoteContent(dummyItem, "INTERNAL_REVIEWED", attestation, rogueAuthority as any);
      }).toThrowError(ReviewerAuthorizationError);

      try {
        promoteContent(dummyItem, "INTERNAL_REVIEWED", attestation, rogueAuthority as any);
      } catch (err: any) {
        expect(err.message).toContain("SECURITY_VIOLATION");
      }
    });
  });

  // =========================================================================
  // MANDATORY TEST F: Student LearningPack contains no parent AI prompt fields
  // =========================================================================
  describe("F: Student LearningPack type/payload contains no parent AI prompt fields", () => {
    it("ensures student learning pack payload has no geminiNotebook or copyablePrompt properties", () => {
      const pack = generateLearningPack(mockGapReport);

      expect((pack as any).geminiNotebookInstructions).toBeUndefined();
      expect((pack as any).copyablePrompt).toBeUndefined();
      expect((pack as any).notebookUrl).toBeUndefined();
      expect((pack as any).suggestedPrompt).toBeUndefined();

      const serialized = JSON.stringify(pack);
      expect(serialized).not.toContain("geminiNotebook");
      expect(serialized).not.toContain("copyablePrompt");
      expect(serialized).not.toContain("NotebookLM");
    });
  });

  // =========================================================================
  // MANDATORY TEST G: Missing itemMaturity fails student publication
  // =========================================================================
  describe("G: Missing itemMaturity fails student publication", () => {
    it("rejects items where itemMaturity is missing, undefined, or empty", () => {
      (process.env as any).NODE_ENV = "test";

      const testAuthority = createTestReviewerAuthority([
        {
          reviewerId: "REV-HUMAN-AUDIT-01",
          type: "HUMAN",
          role: "PEDAGOGICAL_CONTROLLER",
          active: true,
          verifiedByController: true,
        },
      ]);

      const baseItem = {
        id: "ITEM-G-TEST-01",
        primaryNodeId: "NODE-TEST",
        supportingNodeIds: [],
        type: "MULTIPLE_CHOICE" as const,
        cognitiveDemand: "APPLY" as const,
        prompt: [{ type: "text" as const, value: "Prompt text" }],
        correctAnswer: "opt-1",
        rationale: "Rationale",
        misconceptionTags: [],
        sourceRefs: [],
        authoringOrigin: "HUMAN" as const,
        reviewState: "SUBJECT_EXPERT_REVIEWED" as const,
        publicationState: "PUBLISHED_BETA" as const,
        version: "1.0.0",
      };

      const hash = canonicalContentHash(baseItem);
      const attestation: ReviewAttestation = {
        reviewerId: "REV-HUMAN-AUDIT-01",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: new Date().toISOString(),
        contentHash: hash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
      };

      // 1. Missing itemMaturity completely
      const itemMissingMaturity = {
        ...baseItem,
        reviewAttestation: attestation,
      };
      expect(() => assertPublishedForStudent(itemMissingMaturity, testAuthority)).toThrow(
        ContentNotPublishedError
      );

      // 2. DRAFT maturity
      const itemDraftMaturity = {
        ...baseItem,
        itemMaturity: "DRAFT",
        reviewAttestation: attestation,
      };
      expect(() => assertPublishedForStudent(itemDraftMaturity, testAuthority)).toThrow(
        ContentNotPublishedError
      );

      // 3. Valid REVIEWED maturity passes
      const itemReviewedMaturity = {
        ...baseItem,
        itemMaturity: "REVIEWED",
        reviewAttestation: attestation,
      };
      expect(() => assertPublishedForStudent(itemReviewedMaturity, testAuthority)).not.toThrow();
    });
  });

  // =========================================================================
  // MANDATORY TEST I: False "digital signature / committee / unverified page" copy absent
  // =========================================================================
  describe("I: False 'digital signature / committee / unverified page' copy absent", () => {
    it("proves Grade6FractionsDiagnosticFlow contains no false digital signature or committee claims", () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), "components/v3/diagnostic/Grade6FractionsDiagnosticFlow.tsx"),
        "utf-8"
      );

      expect(source).not.toContain("chữ ký số");
      expect(source).not.toContain("hội đồng chuyên môn");
    });

    it("proves NewDiagnosticWizard and CoverageExplorer contain no unverified 'Trang 55' claims", () => {
      const wizardSource = fs.readFileSync(
        path.join(process.cwd(), "components/v3/profile/NewDiagnosticWizard.tsx"),
        "utf-8"
      );
      expect(wizardSource).not.toContain("Trang 55");

      const coverageSource = fs.readFileSync(
        path.join(process.cwd(), "components/v3/curriculum/CoverageExplorer.tsx"),
        "utf-8"
      );
      expect(coverageSource).not.toContain("Trang 55");
    });
  });
});

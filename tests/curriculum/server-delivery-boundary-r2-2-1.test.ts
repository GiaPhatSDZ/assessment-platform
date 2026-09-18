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
    it("proves client-side curriculum-service and learning-pack do not import unpublished canonical JSON or legacy graph", () => {
      const currServiceSource = fs.readFileSync(
        path.join(process.cwd(), "src/application/curriculum/curriculum-service.ts"),
        "utf-8"
      );
      expect(currServiceSource).not.toContain("question-bank/items.json");
      expect(currServiceSource).not.toContain("fractions-addition.json");
      expect(currServiceSource).not.toContain("math-grade6-fractions.json");

      const learningPackSource = fs.readFileSync(
        path.join(process.cwd(), "src/domain/remediation/learning-pack.ts"),
        "utf-8"
      );
      expect(learningPackSource).not.toContain("question-bank/items.json");
      expect(learningPackSource).not.toContain("fractions-addition.json");
      expect(learningPackSource).not.toContain("math-grade6-fractions.json");
    });

    it("ensures canonical unpublished JSON and graphs are ONLY imported from modules marked with 'server-only'", () => {
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
        const importsLegacyGraph = content.includes("math-grade6-fractions.json");
        const importsCanonicalNodes = content.includes("knowledge-nodes.json");
        const importsCanonicalEdges = content.includes("prerequisite-edges.json");

        if (
          importsDraftQuestionBank ||
          importsDraftLesson ||
          importsLegacyGraph ||
          importsCanonicalNodes ||
          importsCanonicalEdges
        ) {
          // File MUST declare server-only
          expect(
            content.includes('import "server-only"') || content.includes("import 'server-only'")
          ).toBe(true);
        }
      }
    });

    it("verifies CurriculumService fails closed and returns empty graph for client runtime", () => {
      const clientGraph = CurriculumService.getFractionsKnowledgeGraph();
      expect(clientGraph.nodes).toHaveLength(0);
      expect(clientGraph.edges).toHaveLength(0);
    });

    it("verifies canonical Grade 6 lesson has explicit itemMaturity: DRAFT and matches schema", () => {
      const lessonRaw = fs.readFileSync(
        path.join(process.cwd(), "curriculum/vietnam/lower-secondary/grade-6/math/lessons/fractions-addition.json"),
        "utf-8"
      );
      const lesson = JSON.parse(lessonRaw);
      expect(lesson.itemMaturity).toBe("DRAFT");
      expect(lesson.reviewState).toBe("AI_DRAFT");
      expect(lesson.publicationState).toBe("DRAFT");
    });

    it("verifies canonical knowledge nodes and prerequisite edges remain SOURCE_LINKED and unapproved", () => {
      const nodesRaw = fs.readFileSync(
        path.join(process.cwd(), "curriculum/vietnam/lower-secondary/grade-6/math/knowledge-nodes.json"),
        "utf-8"
      );
      const nodes = JSON.parse(nodesRaw);
      for (const node of nodes) {
        expect(node.reviewState).toBe("SOURCE_LINKED");
      }

      const edgesRaw = fs.readFileSync(
        path.join(process.cwd(), "curriculum/vietnam/lower-secondary/grade-6/math/prerequisite-edges.json"),
        "utf-8"
      );
      const edges = JSON.parse(edgesRaw);
      for (const edge of edges) {
        expect(edge.reviewState).toBe("SOURCE_LINKED");
      }
    });

    it("verifies production static chunks do not contain DRAFT sentinels or unpublished graph payloads", () => {
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

      const draftSentinels = [
        // Sentinel A: Question item ID
        "ITEM-G6-FRAC-01",
        // Sentinel B: Lesson pedagogical text
        "LESSON-MATH-6-FRAC-01",
        "Để cộng hai phân số có mẫu số khác nhau, ta không thể cộng ngay",
        // Sentinel C: Legacy graph ID and payload
        "GRAPH-MATH-G6-FRACTIONS",
        "Cộng hai phân số có cùng mẫu số bằng cách cộng tử số với nhau",
        "Tìm mẫu chung bằng BCNN của các mẫu số, tìm thừa số phụ",
        "Quy đồng mẫu số hai phân số về cùng một mẫu dương rồi thực hiện phép cộng",
        // Sentinel D: Canonical SOURCE_LINKED graph descriptions
        "Nhận biết phân số biểu diễn số phần bằng nhau của đơn vị",
        "Tìm mẫu số chung (thông qua bội chung nhỏ nhất) và nhân cả tử và mẫu",
        "Cần hiểu khái niệm phân số và phân số bằng nhau trước khi thực hiện quy đồng",
        "Phép cộng phân số khác mẫu số bắt buộc phải quy đồng mẫu số",
      ];

      for (const chunkFile of chunkFiles) {
        const chunkContent = fs.readFileSync(chunkFile, "utf-8");
        for (const sentinel of draftSentinels) {
          expect(chunkContent).not.toContain(sentinel);
        }
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

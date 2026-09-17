import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import {
  assertPublishedForStudent,
  filterPublishedForStudent,
  assertNoAiGenerationFallback,
  ContentNotPublishedError,
  StudentRuntimeAiViolationError,
} from "@/src/domain/content/publication-guard";

import {
  validateThptSubjectSelection,
  assertPreschoolReleaseIsolation,
  THPT_MANDATORY_SUBJECT_IDS,
  THPT_ELECTIVE_SUBJECT_IDS,
} from "@/src/domain/content/catalog-rules";

import {
  buildGroundedParentResponse,
  assertCannotModifyMastery,
  MasteryModificationForbiddenError,
} from "@/src/domain/parent-copilot/boundary";

import {
  QuestionItem,
  Lesson,
  CoverageStatus,
  SubjectCoverageRecord,
  PublicationManifest,
} from "@/src/domain/content/schema";

import { ManualGeminiNotebookProvider } from "@/src/infrastructure/remediation/gemini-notebook/manual-provider";
import { generateLearningPack } from "@/src/domain/remediation/learning-pack";
import { GapReport } from "@/src/domain/diagnostic/gap-engine";

describe("Curriculum Content Database V1 — Authority, Provenance & Boundary Tests", () => {
  const catalogPath = path.resolve("curriculum/vietnam/catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

  // 1. Catalog & Stage/Grade Availability
  describe("Catalog & Grade Hierarchy Structure", () => {
    it("defines 12 school grades with correct stages", () => {
      expect(catalog.grades).toHaveLength(12);

      // Primary: 1-5
      const primary = catalog.grades.filter((g: { grade: number }) => g.grade >= 1 && g.grade <= 5);
      expect(primary).toHaveLength(5);

      // Lower Secondary: 6-9
      const lowerSecondary = catalog.grades.filter((g: { grade: number }) => g.grade >= 6 && g.grade <= 9);
      expect(lowerSecondary).toHaveLength(4);

      // Upper Secondary: 10-12
      const upperSecondary = catalog.grades.filter((g: { grade: number }) => g.grade >= 10 && g.grade <= 12);
      expect(upperSecondary).toHaveLength(3);
    });

    it("enforces preschool release separation (current-national vs pilot)", () => {
      const releaseIds = catalog.preschool.releases.map((r: { id: string }) => r.id);
      expect(releaseIds).toEqual(["current-national", "pilot"]);
      expect(catalog.preschool.scope).toEqual([
        "mau-giao-3-4",
        "mau-giao-4-5",
        "mau-giao-5-6",
      ]);

      // Assert isolation function
      expect(() =>
        assertPreschoolReleaseIsolation("invalid-release-xyz")
      ).toThrowError(/Invalid preschool release/);

      expect(() =>
        assertPreschoolReleaseIsolation("current-national")
      ).not.toThrow();

      expect(() =>
        assertPreschoolReleaseIsolation("pilot")
      ).not.toThrow();
    });

    it("verifies Grade 6 subjects match Circular 32/2018", () => {
      const g6 = catalog.grades.find((g: { grade: number }) => g.grade === 6);
      expect(g6).toBeDefined();

      const mandatoryIds = g6.mandatory.map((s: { id: string }) => s.id);
      expect(mandatoryIds).toContain("math");
      expect(mandatoryIds).toContain("literature");
      expect(mandatoryIds).toContain("foreign_language_1");
      expect(mandatoryIds).toContain("natural_science");
      expect(mandatoryIds).toContain("history_geography");
      expect(mandatoryIds).toContain("civic_education");
      expect(mandatoryIds).toContain("informatics");
      expect(mandatoryIds).toContain("technology");
    });
  });

  // 2. THPT Mandatory & Elective Rules (Circular 32/2018)
  describe("THPT Grade 10–12 Subject Rules", () => {
    it("has exactly 8 mandatory subjects and 9 authorized electives", () => {
      expect(THPT_MANDATORY_SUBJECT_IDS).toHaveLength(8);
      expect(THPT_ELECTIVE_SUBJECT_IDS).toHaveLength(9);
    });

    it("approves valid THPT selection (8 mandatory + exactly 4 valid electives)", () => {
      const validElectives = ["physics", "chemistry", "biology", "informatics"];
      const result = validateThptSubjectSelection({
        studentId: "std-001",
        grade: 10,
        selectedElectiveIds: validElectives,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.allEnrolledSubjectIds).toHaveLength(12); // 8 mandatory + 4 electives
    });

    it("rejects when fewer than 4 electives are chosen", () => {
      const incompleteElectives = ["physics", "chemistry", "biology"];
      const result = validateThptSubjectSelection({
        studentId: "std-002",
        grade: 11,
        selectedElectiveIds: incompleteElectives,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("đúng 4 môn"))).toBe(true);
    });

    it("rejects when more than 4 electives are chosen", () => {
      const excessElectives = [
        "physics",
        "chemistry",
        "biology",
        "geography",
        "music",
      ];
      const result = validateThptSubjectSelection({
        studentId: "std-003",
        grade: 12,
        selectedElectiveIds: excessElectives,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("đúng 4 môn"))).toBe(true);
    });

    it("rejects duplicate electives in the selection", () => {
      const duplicateElectives = ["physics", "physics", "chemistry", "biology"];
      const result = validateThptSubjectSelection({
        studentId: "std-004",
        grade: 10,
        selectedElectiveIds: duplicateElectives,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("trùng lặp"))).toBe(true);
    });

    it("rejects unauthorized/invented elective subjects", () => {
      const invalidElectives = ["physics", "chemistry", "biology", "astrology_101"];
      const result = validateThptSubjectSelection({
        studentId: "std-005",
        grade: 10,
        selectedElectiveIds: invalidElectives,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("không thuộc danh mục"))).toBe(true);
    });
  });

  // 3. Publication Guard & Student Runtime Restrictions
  describe("Publication Guard & Security Barriers", () => {
    const validPublishedItem: QuestionItem = {
      id: "ITEM-TEST-01",
      primaryNodeId: "NODE-01",
      supportingNodeIds: [],
      type: "MULTIPLE_CHOICE",
      cognitiveDemand: "UNDERSTAND",
      prompt: [{ type: "text", value: "Câu hỏi trắc nghiệm kiểm tra" }],
      correctAnswer: "opt-1",
      rationale: "Giải thích chuẩn",
      misconceptionTags: [],
      sourceRefs: [{ sourceId: "SRC-01" }],
      authoringOrigin: "AI_ASSISTED",
      itemMaturity: "REVIEWED",
      reviewState: "INTERNAL_REVIEWED",
      publicationState: "PUBLISHED_BETA",
      version: "1.0.0",
      reviewAttestation: {
        reviewerId: "REV-HUMAN-01",
        reviewerName: "Pham Thi C (Math Controller)",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: "2026-09-17T00:00:00Z",
        contentHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
      },
    };

    it("allows PUBLISHED_BETA items only when reviewState is at least INTERNAL_REVIEWED", () => {
      expect(() => assertPublishedForStudent(validPublishedItem)).not.toThrow();
    });

    it("blocks DRAFT publication state from student runtime", () => {
      const draftItem = { ...validPublishedItem, publicationState: "DRAFT" as const };
      expect(() => assertPublishedForStudent(draftItem)).toThrow(ContentNotPublishedError);
    });

    it("blocks READY_FOR_REVIEW publication state from student runtime", () => {
      const unapprovedItem = {
        ...validPublishedItem,
        publicationState: "READY_FOR_REVIEW" as const,
      };
      expect(() => assertPublishedForStudent(unapprovedItem)).toThrow(ContentNotPublishedError);
    });

    it("blocks items with AI_DRAFT review state even if marked PUBLISHED_BETA", () => {
      const unreviewedItem = {
        ...validPublishedItem,
        reviewState: "AI_DRAFT" as const,
      };
      expect(() => assertPublishedForStudent(unreviewedItem)).toThrow(ContentNotPublishedError);
    });

    it("filters arrays cleanly, omitting unapproved items", () => {
      const items: QuestionItem[] = [
        validPublishedItem,
        { ...validPublishedItem, id: "ITEM-2", publicationState: "DRAFT" },
        { ...validPublishedItem, id: "ITEM-3", reviewState: "AI_DRAFT" },
        {
          ...validPublishedItem,
          id: "ITEM-4",
          publicationState: "PUBLISHED_VERIFIED",
          reviewState: "SUBJECT_EXPERT_REVIEWED",
        },
      ];

      const published = filterPublishedForStudent(items);
      expect(published).toHaveLength(2);
      expect(published.map((i) => i.id)).toEqual(["ITEM-TEST-01", "ITEM-4"]);
    });

    it("prohibits student runtime from calling AI generation fallback", () => {
      expect(() =>
        assertNoAiGenerationFallback("STUDENT")
      ).toThrow(StudentRuntimeAiViolationError);

      expect(() =>
        assertNoAiGenerationFallback("PARENT")
      ).not.toThrow();
    });
  });

  // 4. Parent Copilot Grounding & Immutability of Mastery
  describe("Parent Copilot Boundaries & Grounding Contract", () => {
    it("returns safe fallback without guessing if grounding corpus is empty", () => {
      const response = buildGroundedParentResponse({
        mode: "GUIDE_CHILD",
        parentPrompt: "Giải bài này giúp tôi",
        groundingCorpus: {
          nodeId: "NODE-EMPTY",
          nodeLabel: "Chủ đề chưa có dữ liệu",
          sourceRefs: [],
        },
      });

      expect(response.isGroundedInReviewedSource).toBe(false);
      expect(response.summaryForParent).toBe("Nguồn hiện có chưa đủ để trả lời chắc chắn.");
    });

    it("returns structured pedagogical guide when grounded corpus exists", () => {
      const response = buildGroundedParentResponse({
        mode: "GUIDE_CHILD",
        parentPrompt: "Làm sao để hướng dẫn con không bị nói đáp án?",
        groundingCorpus: {
          nodeId: "NODE-MATH-6-FRAC-03",
          nodeLabel: "Phép cộng phân số khác mẫu",
          sourceRefs: [
            {
              sourceId: "SRC-VN-MOET-MATH-2018",
              citationText: "Chương trình GDPT 2018 môn Toán",
            },
          ],
          parentGuide: {
            nodeId: "NODE-MATH-6-FRAC-03",
            parentSummary: "Cộng hai phân số khác mẫu số cần quy đồng.",
            whatChildNeedsToUnderstand: ["Mẫu số chung"],
            commonDifficulties: ["Cộng thẳng tử với tử, mẫu với mẫu"],
            questionsToAskChild: ["Hai miếng bánh này có bằng nhau không?"],
            hintsWithoutGivingAnswer: ["Vẽ hình trực quan trước khi tính toán"],
            everydayExamples: ["Gộp nửa cốc nước và một phần tư cốc nước"],
            sourceRefs: [],
            reviewState: "AI_DRAFT",
          },
        },
      });

      expect(response.isGroundedInReviewedSource).toBe(true);
      expect(response.childStumblingPoint).toContain("Cộng thẳng tử với tử");
      expect(response.suggestedQuestion).toBe("Hai miếng bánh này có bằng nhau không?");
      expect(response.realWorldExample).toContain("cốc nước");
    });

    it("prohibits AI Copilot from modifying learner mastery state", () => {
      expect(() => assertCannotModifyMastery("update_learner_mastery_state")).toThrow(
        MasteryModificationForbiddenError
      );
      expect(() => assertCannotModifyMastery("recalculate_node_mastery_score")).toThrow(
        MasteryModificationForbiddenError
      );
      expect(() => assertCannotModifyMastery("retrieve_parent_guidance_text")).not.toThrow();
    });

    it("verifies learning pack and notebook instructions are strictly for parents", () => {
      const sampleGap: GapReport = {
        sessionId: "sess-test",
        targetNodeId: "NODE-MATH-6-FRAC-03",
        targetNodeLabel: "Cộng phân số khác mẫu",
        classification: "PREREQUISITE_GAP_CANDIDATE",
        prerequisiteChainPath: ["NODE-MATH-5-FRAC-02", "NODE-MATH-6-FRAC-03"],
        primaryFailingNodeId: "NODE-MATH-5-FRAC-02",
        primaryFailingNodeLabel: "Quy đồng mẫu số hai phân số",
        detectedMisconceptions: ["ADD_NUM_AND_DENOM_DIRECTLY"],
        explanation: "Học sinh vướng ở bước quy đồng mẫu số",
        actionableNextStep: "Ôn tập bước quy đồng mẫu số",
        generatedAt: new Date().toISOString(),
        ruleVersion: "1.0.0",
      };

      const pack = generateLearningPack(sampleGap);
      expect(pack.geminiNotebookInstructions.copyablePrompt).toContain("dành riêng cho phụ huynh");
      expect(pack.parentGuide).toContain("Trợ lý Phụ huynh");
      // Must not instruct child to chat with AI directly
      expect(pack.parentGuide).not.toContain("để con tự đối thoại học tập");

      const guide = ManualGeminiNotebookProvider.getRemediationGuide(pack);
      expect(guide.safetyAndAgeNote).toContain("Học sinh không trực tiếp sử dụng hay trò chuyện với AI");
      expect(guide.stepByStepGuide[0]).toContain("Phụ huynh");
    });
  });

  // 5. Machine-Readable Coverage Registry Verification (Dynamically Derived)
  describe("Coverage Registry Dynamic Derivation & Catalog Parity", () => {
    const registryPath = path.resolve("curriculum/vietnam/coverage-registry.json");
    const registry: SubjectCoverageRecord[] = JSON.parse(
      fs.readFileSync(registryPath, "utf-8")
    );

    it("derives expected subject count dynamically from catalog without hardcoding", () => {
      const expectedTotal =
        catalog.preschool.scope.length +
        catalog.grades.reduce(
          (acc: number, g: { mandatory?: unknown[]; electives?: unknown[]; elective?: unknown[]; optional?: unknown[] }) =>
            acc +
            (g.mandatory?.length || 0) +
            (g.electives?.length || 0) +
            (g.elective?.length || 0) +
            (g.optional?.length || 0),
          0
        );

      expect(registry).toHaveLength(expectedTotal);
    });

    it("includes all 9 electives for THPT grades 10, 11, and 12 (catalog uses electives)", () => {
      for (const grade of [10, 11, 12]) {
        const electives = registry.filter(
          (r) => r.grade === grade && r.kind === "elective"
        );
        expect(electives).toHaveLength(9);
      }
    });

    it("defaults to NOT_INGESTED for subjects without filesystem artifacts", () => {
      const notIngested = registry.filter((r) => r.sourceStatus === "NOT_INGESTED");
      // All subjects without sources must be NOT_INGESTED
      expect(notIngested.length).toBeGreaterThan(150);

      for (const item of notIngested) {
        expect(item.lessonsPublished).toBe(0);
        expect(item.questionsReviewed).toBe(0);
        expect(item.diagnosticReady).toBe(false);
      }
    });

    it("marks Grade 6 Math as CONTENT_IN_REVIEW (not falsely PUBLISHED)", () => {
      const g6Math = registry.find((r) => r.grade === 6 && r.subjectId === "math");
      expect(g6Math).toBeDefined();
      expect(g6Math?.sourceStatus).toBe("CONTENT_IN_REVIEW");
      expect(g6Math?.diagnosticReady).toBe(false);
      expect(g6Math?.lessonsPublished).toBe(0);
      expect(g6Math?.questionsReviewed).toBe(0);
    });

    it("ensures zero subjects are stamped PUBLISHED without human review", () => {
      const published = registry.filter((r) => r.sourceStatus === "PUBLISHED");
      expect(published).toHaveLength(0);
    });
  });

  // 6. Grade 6 Math Vertical Slice Schema, Provenance & Authoring Origin Audit
  describe("Grade 6 Math Vertical Slice Integrity & Provenance Audit", () => {
    const basePath = path.resolve("curriculum/vietnam/lower-secondary/grade-6/math");

    it("verifies source-registry.json has canonical URLs, source versions, and SHA-256 checksums for MOET and NXBGD", () => {
      const sources = JSON.parse(
        fs.readFileSync(path.join(basePath, "source-registry.json"), "utf-8")
      );
      expect(sources.length).toBeGreaterThanOrEqual(8);

      // Verify Tier A MOET curriculum sources
      const moetSources = sources.filter((s: { sourceTier: string }) => s.sourceTier === "TIER_A_CURRICULUM_AUTHORITY");
      expect(moetSources.length).toBeGreaterThanOrEqual(2);
      for (const s of moetSources) {
        expect(s.url).toMatch(/^https?:\/\//);
        expect(s.authority).toContain("Bộ Giáo dục và Đào tạo");
      }

      // Verify Tier B NXBGD approved learning & pedagogical sources
      const nxbgdSources = sources.filter((s: { sourceTier: string }) => s.sourceTier?.startsWith("TIER_B"));
      expect(nxbgdSources.length).toBeGreaterThanOrEqual(6);
      for (const s of nxbgdSources) {
        expect(s.url).toMatch(/^https?:\/\//);
        expect(s.authority).toContain("Nhà xuất bản Giáo dục Việt Nam");
        expect(s.rights.redistribution).toBe(false);
        expect(s.rights.commercialReuse).toBe("NOT_GRANTED");
      }
    });

    it("verifies learning-outcomes.json has verbatim official text and SOURCE_LINKED reviewState", () => {
      const los = JSON.parse(
        fs.readFileSync(path.join(basePath, "learning-outcomes.json"), "utf-8")
      );
      expect(los).toHaveLength(2);
      expect(los.every((lo: { reviewState: string }) => lo.reviewState === "SOURCE_LINKED")).toBe(true);

      for (const lo of los) {
        expect(lo.officialText.length).toBeGreaterThan(25);
        expect(lo.sourceRefs[0].sectionLocator).toBeDefined();
        expect(lo.sourceRefs[0].pageNumber).toBeDefined();
      }
    });

    it("verifies knowledge-nodes.json has SOURCE_LINKED reviewState", () => {
      const nodes = JSON.parse(
        fs.readFileSync(path.join(basePath, "knowledge-nodes.json"), "utf-8")
      );
      expect(nodes).toHaveLength(4);
      expect(nodes.every((n: { reviewState: string }) => n.reviewState === "SOURCE_LINKED")).toBe(true);
    });

    it("verifies prerequisite-edges.json has SOURCE_LINKED reviewState", () => {
      const edges = JSON.parse(
        fs.readFileSync(path.join(basePath, "prerequisite-edges.json"), "utf-8")
      );
      expect(edges).toHaveLength(3);
      expect(edges.every((e: { reviewState: string }) => e.reviewState === "SOURCE_LINKED")).toBe(true);
    });

    it("verifies lesson has AI_ASSISTED authoringOrigin, AI_DRAFT reviewState, and DRAFT publicationState", () => {
      const lesson: Lesson = JSON.parse(
        fs.readFileSync(path.join(basePath, "lessons/fractions-addition.json"), "utf-8")
      );
      expect(lesson.authoringOrigin).toBe("AI_ASSISTED");
      expect(lesson.reviewState).toBe("AI_DRAFT");
      expect(lesson.publicationState).toBe("DRAFT");
      expect(lesson.learnerText.length).toBeGreaterThan(0);
    });

    it("verifies question bank items have AI_ASSISTED authoringOrigin, AI_DRAFT reviewState, and DRAFT publicationState", () => {
      const items: QuestionItem[] = JSON.parse(
        fs.readFileSync(path.join(basePath, "question-bank/items.json"), "utf-8")
      );
      expect(items).toHaveLength(6);
      expect(items.every((i) => i.authoringOrigin === "AI_ASSISTED")).toBe(true);
      expect(items.every((i) => i.itemMaturity === "DRAFT")).toBe(true);
      expect(items.every((i) => i.reviewState === "AI_DRAFT")).toBe(true);
      expect(items.every((i) => i.publicationState === "DRAFT")).toBe(true);

      // Student publication guard must BLOCK these unreviewed draft items
      for (const item of items) {
        expect(() => assertPublishedForStudent(item)).toThrow(ContentNotPublishedError);
      }
      expect(filterPublishedForStudent(items)).toHaveLength(0);
    });

    it("verifies publication manifest has real SHA-256 checksum and no invented board", () => {
      const manifest: PublicationManifest = JSON.parse(
        fs.readFileSync(path.join(basePath, "publication-manifest.json"), "utf-8")
      );
      expect(manifest.reviewStatus).toBe("PENDING_HUMAN_CONTROLLER_AUDIT");
      expect(manifest.publishedBy).toBeNull();
      expect(manifest.publishedAt).toBeNull();
      expect(manifest.publicationScope).toBe("DRAFT");
      expect(manifest.checksum).toMatch(/^[a-f0-9]{64}$/);

      // Verify checksum matches actual SHA-256 computation of content files
      const itemsBuf = fs.readFileSync(path.join(basePath, "question-bank/items.json"));
      const lessonBuf = fs.readFileSync(path.join(basePath, "lessons/fractions-addition.json"));
      const expectedChecksum = crypto
        .createHash("sha256")
        .update(itemsBuf)
        .update(lessonBuf)
        .digest("hex");

      expect(manifest.checksum).toBe(expectedChecksum);
    });
  });
});

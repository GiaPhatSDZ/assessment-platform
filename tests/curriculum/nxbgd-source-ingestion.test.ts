import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import {
  SourceDocument,
  KnowledgeNode,
  Lesson,
  ParentGuide,
  PublicationManifest,
  QuestionItem,
  ReviewAttestation,
  assertCannotSelfPromote,
  SelfPromotionForbiddenError,
} from "@/src/domain/content/schema";
import {
  assertPublishedForStudent,
  promoteContent,
  ContentNotPublishedError,
} from "@/src/domain/content/publication-guard";
import { canonicalContentHash } from "@/src/domain/content/canonical-content-hash";
import {
  registerReviewer,
  clearReviewerRegistry,
} from "@/src/domain/content/reviewer-registry";
// @ts-ignore - ESM script import for unit testing
import { runSourceVerificationV2 } from "../../scripts/curriculum/ingest-nxbgd-sources.mjs";

describe("NXBGD Source Verification Engine V2.1 & Provenance R2.1 Audit", () => {
  beforeEach(() => {
    clearReviewerRegistry();
    registerReviewer({
      reviewerId: "REV-HUMAN-01",
      type: "HUMAN",
      role: "PEDAGOGICAL_CONTROLLER",
      active: true,
      verifiedByController: true,
      displayName: "Tran Van B (Lead Reviewer)",
    });
  });
  const g6MathDir = path.resolve("curriculum/vietnam/lower-secondary/grade-6/math");

  it("verifies distinct Tier B categories and Tier A consolidated chain in source-registry.json", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    // Tier A: MOET Curriculum Authority (7 sources including QĐ 718 and TT 17/2025)
    const tierA = sourceRegistry.filter((s) => s.sourceTier === "TIER_A_CURRICULUM_AUTHORITY");
    expect(tierA.length).toBe(7);
    for (const s of tierA) {
      expect(s.authority).toBe("Bộ Giáo dục và Đào tạo Việt Nam");
      expect(s.rights?.redistribution).toBe(true);
      // Honest status: registered from official legal gazette, strictly no fake httpStatus 200
      expect(s.verificationStatus).toBe("OFFLINE_REGISTERED_METADATA");
      expect(s.httpStatus).toBeUndefined();
    }

    // Tier A: Check verified authority chain and absence of erroneous 08/VBHN-2023
    const gepSource = sourceRegistry.find((s) => s.id === "SRC-VN-MOET-GEP-2018");
    expect(gepSource).toBeDefined();
    expect(gepSource?.authorityChain).toEqual([
      "SRC-VN-MOET-GEP-2018",
      "SRC-VN-MOET-AMEND-20-2021",
      "SRC-VN-MOET-AMEND-13-2022",
      "SRC-VN-MOET-AMEND-17-2025",
      "SRC-VN-MOET-VBHN-10-2022",
    ]);

    const vbhn10 = sourceRegistry.find((s) => s.id === "SRC-VN-MOET-VBHN-10-2022");
    expect(vbhn10).toBeDefined();
    expect(vbhn10?.documentNumber).toBe("10/VBHN-BGDĐT");

    const illegalVbhn08 = sourceRegistry.find((s) => s.id.includes("VBHN-08"));
    expect(illegalVbhn08).toBeUndefined();

    // Tier B1: MOET Approved Textbooks (SGK Toán 6 Tập 1 & Tập 2)
    const tierB1 = sourceRegistry.filter((s) => s.sourceTier === "TIER_B1_MOET_APPROVED_TEXTBOOK");
    expect(tierB1).toHaveLength(2);
    for (const s of tierB1) {
      expect(s.authority).toBe("Nhà xuất bản Giáo dục Việt Nam");
      expect(s.resourceType).toBe("TEXTBOOK");
      expect(s.bookSeries).toBe("Kết nối tri thức với cuộc sống");
      expect(s.url).toMatch(/^https:\/\/taphuan\.nxbgd\.vn\//);
      expect(s.rights?.redistribution).toBe(false);
      expect(s.rights?.commercialReuse).toBe("NOT_GRANTED");
    }

    // Tier B2: NXBGD Publisher Resources (SGV & VBT)
    const tierB2 = sourceRegistry.filter((s) => s.sourceTier === "TIER_B2_NXBGD_PUBLISHER_RESOURCE");
    expect(tierB2).toHaveLength(2);
    const vbtSource = tierB2.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-VBT-T2");
    expect(vbtSource).toBeDefined();
    expect(vbtSource?.title).toContain("VBT Toán 6");
    expect(vbtSource?.resourceType).toBe("WORKBOOK_SAMPLE");

    // Tier B3: Pedagogical Training Resources
    const tierB3 = sourceRegistry.filter((s) => s.sourceTier === "TIER_B3_PEDAGOGICAL_TRAINING_RESOURCE");
    expect(tierB3).toHaveLength(2);
    for (const s of tierB3) {
      expect(s.authority).toBe("Nhà xuất bản Giáo dục Việt Nam");
      expect(s.rights?.commercialReuse).toBe("NOT_GRANTED");
    }
  });

  it("verifies accurate TT20/2021/TT-BGDĐT legal metadata", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    const tt20 = sourceRegistry.find((s) => s.id === "SRC-VN-MOET-AMEND-20-2021");
    expect(tt20).toBeDefined();
    expect(tt20?.documentNumber).toBe("20/2021/TT-BGDĐT");
    expect(tt20?.title).toContain("Điều 3 Thông tư số 32/2018/TT-BGDĐT");
    expect(tt20?.issuedAt).toBe("2021-07-01");
    expect(tt20?.effectiveFrom).toBe("2021-08-16");
    expect(tt20?.sourceType).toBe("OFFICIAL_CURRICULUM");
  });

  it("verifies official approval provenance for TIER_B1_MOET_APPROVED_TEXTBOOK", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    const qd718 = sourceRegistry.find((s) => s.id === "SRC-VN-MOET-QD-718-2021");
    expect(qd718).toBeDefined();
    expect(qd718?.documentNumber).toBe("718/QĐ-BGDĐT");
    expect(qd718?.issuedAt).toBe("2021-02-09");

    const sgk1 = sourceRegistry.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-T1");
    expect(sgk1?.approvalStatus).toBe("MOET_APPROVED");
    expect(sgk1?.approvalDecisionNumber).toBe("718/QĐ-BGDĐT");
    expect(sgk1?.approvalDecisionDate).toBe("2021-02-09");
    expect(sgk1?.approvalSourceId).toBe("SRC-VN-MOET-QD-718-2021");

    const sgk2 = sourceRegistry.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-T2");
    expect(sgk2?.approvalStatus).toBe("MOET_APPROVED");
    expect(sgk2?.approvalDecisionNumber).toBe("718/QĐ-BGDĐT");
    expect(sgk2?.approvalDecisionDate).toBe("2021-02-09");
  });

  it("verifies remote source verification status and viewer inventory without claiming human verification", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    for (const s of sourceRegistry) {
      expect(s.verificationStatus).not.toBe("LOCATOR_HUMAN_VERIFIED");
      expect(["OFFLINE_REGISTERED_METADATA", "METADATA_VERIFIED", "VIEWER_INVENTORY_VERIFIED"]).toContain(
        s.verificationStatus
      );
      expect(s.canonicalMetadataFingerprint).toMatch(/^[a-f0-9]{64}$/);
    }

    const sgk2 = sourceRegistry.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-T2");
    expect(sgk2?.verificationStatus).toBe("VIEWER_INVENTORY_VERIFIED");
    expect(sgk2?.httpStatus).toBe(200);
    expect(sgk2?.remoteViewerInventory?.totalPages).toBe(112);
    expect(sgk2?.remoteViewerInventory?.haveCoverPage).toBe(true);

    const sgv2 = sourceRegistry.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-SGV-T2");
    expect(sgv2?.remoteViewerInventory?.totalPages).toBe(220);

    const vbt2 = sourceRegistry.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-VBT-T2");
    expect(vbt2?.remoteViewerInventory?.totalPages).toBe(7);

    const trainDoc = sourceRegistry.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-TRAIN-DOC");
    expect(trainDoc?.remoteViewerInventory?.totalPages).toBe(56);
  });

  it("verifies requiredForSlice flags exist on foundational sources", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    const requiredIds = [
      "SRC-VN-MOET-MATH-2018",
      "SRC-VN-MOET-VBHN-10-2022",
      "SRC-VN-MOET-QD-718-2021",
      "SRC-NXBGD-KNTT-MATH6-T2",
      "SRC-NXBGD-KNTT-MATH6-SGV-T2",
    ];

    for (const id of requiredIds) {
      const src = sourceRegistry.find((s) => s.id === id);
      expect(src?.requiredForSlice).toBe(true);
    }
  });

  it("enforces copyright boundary: zero pirated textbook PDFs or scans in the curriculum tree", () => {
    function findPiratedFiles(dir: string): string[] {
      const results: string[] = [];
      const list = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of list) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...findPiratedFiles(fullPath));
        } else if (/\.(pdf|epub|mobi|djvu)$/i.test(entry.name)) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const piratedFiles = findPiratedFiles(path.resolve("curriculum/vietnam"));
    expect(piratedFiles).toHaveLength(0);
  });

  it("verifies Knowledge Nodes use distinct Tier B tiers and locatorStatus defaults to UNVERIFIED", () => {
    const nodes: KnowledgeNode[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "knowledge-nodes.json"), "utf-8")
    );

    expect(nodes).toHaveLength(4);

    const quyDongNode = nodes.find((n) => n.id === "NODE-MATH-5-FRAC-02");
    expect(quyDongNode).toBeDefined();

    const moetRef = quyDongNode?.sourceRefs?.find((r) => r.tier === "TIER_A_CURRICULUM_AUTHORITY");
    expect(moetRef).toBeDefined();
    expect(moetRef?.printedPage).toBe(38);
    expect(moetRef?.locatorStatus).toBe("UNVERIFIED");

    const sgkRef = quyDongNode?.sourceRefs?.find((r) => r.tier === "TIER_B1_MOET_APPROVED_TEXTBOOK");
    expect(sgkRef).toBeDefined();
    expect(sgkRef?.printedPage).toBe(16);
    expect(sgkRef?.viewerPage).toBe(17);
    expect(sgkRef?.locatorStatus).toBe("UNVERIFIED");

    const sgvRef = quyDongNode?.sourceRefs?.find((r) => r.tier === "TIER_B2_NXBGD_PUBLISHER_RESOURCE");
    expect(sgvRef).toBeDefined();
    expect(sgvRef?.printedPage).toBe(32);
    expect(sgvRef?.viewerPage).toBe(33);
    expect(sgvRef?.locatorStatus).toBe("UNVERIFIED");

    const trainRef = quyDongNode?.sourceRefs?.find((r) => r.tier === "TIER_B3_PEDAGOGICAL_TRAINING_RESOURCE");
    expect(trainRef).toBeDefined();
    expect(trainRef?.locatorStatus).toBe("UNVERIFIED");
  });

  it("verifies Lesson and Parent Guide have locatorStatus UNVERIFIED with printedPage and viewerPage", () => {
    const lesson: Lesson = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "lessons/fractions-addition.json"), "utf-8")
    );

    expect(lesson.approvedSourceRefs.length).toBeGreaterThanOrEqual(3);
    for (const ref of lesson.approvedSourceRefs) {
      expect(ref.locatorStatus).toBe("UNVERIFIED");
    }

    const guides: ParentGuide[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "parent-guides/fractions-parent-guide.json"), "utf-8")
    );
    expect(guides.length).toBeGreaterThan(0);
    for (const ref of guides[0].sourceRefs) {
      expect(ref.locatorStatus).toBe("UNVERIFIED");
    }
  });

  it("verifies publication manifest does not falsely claim publication in draft scope", () => {
    const manifest: PublicationManifest = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "publication-manifest.json"), "utf-8")
    );

    expect(manifest.publicationScope).toBe("DRAFT");
    expect(manifest.reviewStatus).toBe("PENDING_HUMAN_CONTROLLER_AUDIT");
    expect(manifest.publishedAt).toBeNull();
    expect(manifest.publishedBy).toBeNull();
    expect(manifest.manifestCreatedAt).toBeDefined();
    expect(manifest.sourceDocumentIds).toHaveLength(12);

    // Check exact SHA-256
    const itemsRaw = fs.readFileSync(path.join(g6MathDir, "question-bank/items.json"));
    const lessonRaw = fs.readFileSync(path.join(g6MathDir, "lessons/fractions-addition.json"));
    const expectedChecksum = crypto.createHash("sha256").update(itemsRaw).update(lessonRaw).digest("hex");
    expect(manifest.checksum).toBe(expectedChecksum);
  });

  it("enforces cryptographic promoteContent gate and blocks publication without attestation", () => {
    const sampleItem: QuestionItem = {
      id: "ITEM-TEST-AI-01",
      primaryNodeId: "NODE-MATH-6-FRAC-03",
      supportingNodeIds: [],
      type: "MULTIPLE_CHOICE",
      cognitiveDemand: "UNDERSTAND",
      prompt: [{ type: "text", value: "Tính giá trị" }],
      correctAnswer: "1/2",
      rationale: "Giải thích",
      misconceptionTags: [],
      sourceRefs: [],
      authoringOrigin: "AI_ASSISTED",
      itemMaturity: "REVIEWED",
      reviewState: "AI_DRAFT",
      publicationState: "PUBLISHED_BETA",
      version: "1.0.0",
    };

    // 1. Unattested AI_ASSISTED item must be rejected by publication guard even if marked PUBLISHED_BETA
    expect(() => assertPublishedForStudent(sampleItem)).toThrow(ContentNotPublishedError);

    // 2. Promotion with fake AI reviewer must be blocked
    const contentHash = canonicalContentHash(sampleItem);

    expect(() => {
      promoteContent(
        sampleItem,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "AI_BOT_01",
          reviewerName: "AI Review Bot",
          role: "PEDAGOGICAL_CONTROLLER",
          attestedAt: "2026-09-17T00:00:00Z",
          contentHash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "QUESTION_ITEM",
        }
      );
    }).toThrow(SelfPromotionForbiddenError);

    // 3. Promotion with hash mismatch must be blocked
    expect(() => {
      promoteContent(
        sampleItem,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-01",
          reviewerName: "Tran Van B (Lead Reviewer)",
          role: "PEDAGOGICAL_CONTROLLER",
          attestedAt: "2026-09-17T00:00:00Z",
          contentHash: "mismatched-tampered-hash",
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "QUESTION_ITEM",
        }
      );
    }).toThrow(SelfPromotionForbiddenError);

    // 4. Valid human attestation successfully promotes content and unlocks publication
    const promoted = promoteContent(
      sampleItem,
      "INTERNAL_REVIEWED",
      {
        reviewerId: "REV-HUMAN-01",
        reviewerName: "Tran Van B (Lead Reviewer)",
        role: "PEDAGOGICAL_CONTROLLER",
        attestedAt: "2026-09-17T00:00:00Z",
        contentHash,
        hashAlgorithm: "SHA-256",
        hashSchemaVersion: "content-hash-v1",
        decision: "APPROVE",
        scope: "QUESTION_ITEM",
        auditNotes: "Fully audited against SGK Grade 6 Mathematics Lesson 25.",
      }
    );

    expect(promoted.reviewState).toBe("INTERNAL_REVIEWED");
    expect(promoted.reviewAttestation).toBeDefined();
    expect(() => assertPublishedForStudent(promoted)).not.toThrow();
  });

  it("enforces that MOET status cannot become remote-verified without an actual request", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    const moetSources = sourceRegistry.filter((s) => s.id.startsWith("SRC-VN-MOET-"));
    expect(moetSources.length).toBeGreaterThanOrEqual(5);

    for (const src of moetSources) {
      // Must NOT be stamped as METADATA_VERIFIED or VIEWER_INVENTORY_VERIFIED without an actual successful remote fetch
      expect(src.verificationStatus).toBe("OFFLINE_REGISTERED_METADATA");
      expect(src.verificationStatus).not.toBe("METADATA_VERIFIED");
      expect(src.verificationStatus).not.toBe("VIEWER_INVENTORY_VERIFIED");
      // Strictly no hardcoded fake HTTP status 200
      expect(src.httpStatus).toBeUndefined();
    }
  });

  it("enforces fail-closed: required source failure aborts pipeline and preserves prior registry", async () => {
    const tmpDir = path.resolve("scratch/test-fail-closed");
    fs.mkdirSync(tmpDir, { recursive: true });
    const tmpRegistryPath = path.join(tmpDir, "source-registry.json");
    const initialContent = JSON.stringify([{ id: "PRE_EXISTING_RECORD", note: "preserve me" }]);
    fs.writeFileSync(tmpRegistryPath, initialContent, "utf-8");

    const mockSources = [
      {
        id: "SRC-REQUIRED-TEST",
        authority: "Test Authority",
        title: "Test Required Source",
        sourceType: "OFFICIAL_CURRICULUM",
        url: "https://taphuan.nxbgd.vn/mock-failed",
        requiredForSlice: true,
        retrievedAt: "2026-09-17",
      },
    ];

    // Mock remote verifier to return TLS failure
    const mockTlsFailVerifier = async () => ({
      ok: false,
      httpStatus: 0,
      error: "unable to verify the first certificate",
      errorCode: "TLS_VERIFICATION_FAILED",
    });

    await expect(
      runSourceVerificationV2({
        sources: mockSources as any,
        targetPath: tmpRegistryPath,
        remoteVerifier: mockTlsFailVerifier as any,
      })
    ).rejects.toThrow(/Pipeline gate failed: required source \[SRC-REQUIRED-TEST\] failed verification/);

    // Verify prior registry was NOT overwritten
    const preservedContent = fs.readFileSync(tmpRegistryPath, "utf-8");
    expect(preservedContent).toBe(initialContent);

    // Clean up
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("enforces that publication cannot bypass review attestation", () => {
    // Attempting to bypass review attestation by directly setting PUBLISHED_BETA and INTERNAL_REVIEWED on an AI_ASSISTED item
    const bypassedItem: QuestionItem = {
      id: "ITEM-BYPASS-ATTEMPT",
      primaryNodeId: "NODE-MATH-6-FRAC-03",
      supportingNodeIds: [],
      type: "MULTIPLE_CHOICE",
      cognitiveDemand: "UNDERSTAND",
      prompt: [{ type: "text", value: "Bypass prompt" }],
      correctAnswer: "1/2",
      rationale: "Bypass rationale",
      misconceptionTags: [],
      sourceRefs: [],
      authoringOrigin: "AI_ASSISTED",
      itemMaturity: "DRAFT",
      reviewState: "INTERNAL_REVIEWED",
      publicationState: "PUBLISHED_BETA",
      version: "1.0.0",
      // Notice: NO reviewAttestation attached
    };

    expect(() => assertPublishedForStudent(bypassedItem)).toThrow(ContentNotPublishedError);
  });

  it("enforces that arbitrary reviewer strings do not prove human review", () => {
    // A mere arbitrary string like "Nguyen Van A (Math Reviewer)" attached as reviewedBy is rejected
    const arbitraryReviewerItem: QuestionItem = {
      id: "ITEM-ARBITRARY-STR-01",
      primaryNodeId: "NODE-MATH-6-FRAC-03",
      supportingNodeIds: [],
      type: "MULTIPLE_CHOICE",
      cognitiveDemand: "UNDERSTAND",
      prompt: [{ type: "text", value: "Test prompt" }],
      correctAnswer: "1/2",
      rationale: "Test rationale",
      misconceptionTags: [],
      sourceRefs: [],
      authoringOrigin: "AI_ASSISTED",
      itemMaturity: "DRAFT",
      reviewState: "INTERNAL_REVIEWED",
      publicationState: "PUBLISHED_BETA",
      version: "1.0.0",
      // Attaching arbitrary string does NOT satisfy publication guard
      ...({ reviewedBy: "Nguyen Van A (Math Reviewer)" } as any),
    };

    expect(() => assertPublishedForStudent(arbitraryReviewerItem)).toThrow(ContentNotPublishedError);

    // In promoteContent(), an arbitrary reviewer string or invalid reviewerId prefix is rejected
    const contentHash = canonicalContentHash(arbitraryReviewerItem);

    expect(() => {
      promoteContent(
        arbitraryReviewerItem,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "arbitrary-user-id", // not starting with REV-HUMAN-
          reviewerName: "Nguyen Van A (Math Reviewer)",
          role: "PEDAGOGICAL_CONTROLLER",
          attestedAt: "2026-09-17T00:00:00Z",
          contentHash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "QUESTION_ITEM",
        }
      );
    }).toThrow(SelfPromotionForbiddenError);

    expect(() => {
      promoteContent(
        arbitraryReviewerItem,
        "INTERNAL_REVIEWED",
        {
          reviewerId: "REV-HUMAN-01",
          reviewerName: "Nguyen Van A (Math Reviewer)",
          role: "CONTRIBUTOR" as any, // invalid role
          attestedAt: "2026-09-17T00:00:00Z",
          contentHash,
          hashAlgorithm: "SHA-256",
          hashSchemaVersion: "content-hash-v1",
          decision: "APPROVE",
          scope: "QUESTION_ITEM",
        }
      );
    }).toThrow(SelfPromotionForbiddenError);
  });

  it("enforces that TIER_B1_MOET_APPROVED_TEXTBOOK requires explicit approval provenance", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    const b1Sources = sourceRegistry.filter((s) => s.sourceTier === "TIER_B1_MOET_APPROVED_TEXTBOOK");
    expect(b1Sources.length).toBeGreaterThanOrEqual(2);

    for (const b1 of b1Sources) {
      expect(b1.approvalStatus).toBe("MOET_APPROVED");
      expect(b1.approvalDecisionNumber).toBe("718/QĐ-BGDĐT");
      expect(b1.approvalDecisionDate).toBe("2021-02-09");
      expect(b1.approvalSourceId).toBe("SRC-VN-MOET-QD-718-2021");
      expect(b1.approval?.approvalNotes).toContain("718/QĐ-BGDĐT");
    }
  });

  it("verifies evidence reports honestly declare CONTROLLER REVIEW: PENDING and never self-declare PASS", () => {
    const r2Path = path.resolve("docs/evidence/NXBGD_SOURCE_PROVENANCE_R2_REPORT.md");
    const r21Path = path.resolve("docs/evidence/NXBGD_SOURCE_PROVENANCE_R2_1_REPORT.md");

    const r2Content = fs.readFileSync(r2Path, "utf-8");
    const r21Content = fs.readFileSync(r21Path, "utf-8");

    // Neither report may claim resolved or PASS from controller
    expect(r2Content).not.toContain("CONTROLLER AUDIT R2 RESOLVED");
    expect(r21Content).not.toContain("CONTROLLER AUDIT R2 RESOLVED");
    expect(r2Content).not.toContain("CONTROLLER PASS");
    expect(r21Content).not.toContain("CONTROLLER PASS");

    // Both reports must honestly disclose controller review is pending
    expect(r2Content).toContain("CONTROLLER REVIEW: PENDING");
    expect(r21Content).toContain("CONTROLLER REVIEW: PENDING");

    // Must disclose local executor evidence
    expect(r21Content).toContain("Local Executor Evidence");
  });
});

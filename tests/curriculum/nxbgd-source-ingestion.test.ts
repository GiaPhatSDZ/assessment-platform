import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import {
  SourceDocument,
  KnowledgeNode,
  Lesson,
  ParentGuide,
  PublicationManifest,
  assertCannotSelfPromote,
  SelfPromotionForbiddenError,
} from "@/src/domain/content/schema";

describe("NXBGD Source Verification Engine V2 & Provenance R2 Audit", () => {
  const g6MathDir = path.resolve("curriculum/vietnam/lower-secondary/grade-6/math");

  it("verifies distinct Tier B categories and Tier A consolidated chain in source-registry.json", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    // Tier A: MOET Curriculum Authority (5 sources)
    const tierA = sourceRegistry.filter((s) => s.sourceTier === "TIER_A_CURRICULUM_AUTHORITY");
    expect(tierA.length).toBe(5);
    for (const s of tierA) {
      expect(s.authority).toBe("Bộ Giáo dục và Đào tạo Việt Nam");
      expect(s.rights?.redistribution).toBe(true);
    }

    // Tier A: Check verified authority chain and absence of erroneous 08/VBHN-2023
    const gepSource = sourceRegistry.find((s) => s.id === "SRC-VN-MOET-GEP-2018");
    expect(gepSource).toBeDefined();
    expect(gepSource?.authorityChain).toEqual([
      "SRC-VN-MOET-GEP-2018",
      "SRC-VN-MOET-AMEND-20-2021",
      "SRC-VN-MOET-AMEND-13-2022",
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

  it("verifies VBT identity consistency and eliminates phantom SBT", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    const sbtSource = sourceRegistry.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-SBT-T2");
    expect(sbtSource).toBeUndefined();

    const vbtSource = sourceRegistry.find((s) => s.id === "SRC-NXBGD-KNTT-MATH6-VBT-T2");
    expect(vbtSource).toBeDefined();
    expect(vbtSource?.url).toBe("https://taphuan.nxbgd.vn/tap-huan/doc-sach/vbt-toan-6-tap-hai-bai-mau.4733221119");
  });

  it("verifies remote source verification status is explicit and records reader inventory", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    // No source can be claimed as LOCATOR_HUMAN_VERIFIED by network probe
    for (const s of sourceRegistry) {
      expect(s.verificationStatus).not.toBe("LOCATOR_HUMAN_VERIFIED");
      expect(["METADATA_VERIFIED", "VIEWER_INVENTORY_VERIFIED"]).toContain(s.verificationStatus);
      expect(s.canonicalMetadataFingerprint).toMatch(/^[a-f0-9]{64}$/);
    }

    // Reader sources on taphuan.nxbgd.vn must have viewer inventory verified
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
    expect(manifest.sourceDocumentIds).toHaveLength(11);

    // Check exact SHA-256
    const itemsRaw = fs.readFileSync(path.join(g6MathDir, "question-bank/items.json"));
    const lessonRaw = fs.readFileSync(path.join(g6MathDir, "lessons/fractions-addition.json"));
    const expectedChecksum = crypto.createHash("sha256").update(itemsRaw).update(lessonRaw).digest("hex");
    expect(manifest.checksum).toBe(expectedChecksum);
  });

  it("enforces anti-self-promotion guard: AI_ASSISTED content cannot self-promote to INTERNAL_REVIEWED", () => {
    // Attempting self-promotion without human reviewer metadata must throw
    expect(() => {
      assertCannotSelfPromote({
        authoringOrigin: "AI_ASSISTED",
        reviewState: "INTERNAL_REVIEWED",
      });
    }).toThrow(SelfPromotionForbiddenError);

    // AI-labeled reviewer must still throw
    expect(() => {
      assertCannotSelfPromote({
        authoringOrigin: "AI_ASSISTED",
        reviewState: "INTERNAL_REVIEWED",
        reviewedBy: "AI_AGENT_BOT",
        reviewedAt: "2026-09-17",
      });
    }).toThrow(SelfPromotionForbiddenError);

    // Human reviewer with valid metadata succeeds
    expect(() => {
      assertCannotSelfPromote({
        authoringOrigin: "AI_ASSISTED",
        reviewState: "INTERNAL_REVIEWED",
        reviewedBy: "Nguyen Van A (Math Reviewer)",
        reviewedAt: "2026-09-17T00:00:00Z",
      });
    }).not.toThrow();
  });

  it("enforces repository copyright boundary declaration across all sources", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    for (const s of sourceRegistry) {
      expect(s.rightsNotes).toBe(
        "Repository copyright boundary enforced: no full textbook files stored; commercial reuse rights are not granted; legal review is required before commercial deployment using NXBGD-derived resources."
      );
    }
  });
});

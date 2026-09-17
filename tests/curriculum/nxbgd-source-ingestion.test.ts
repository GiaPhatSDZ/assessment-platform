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
} from "@/src/domain/content/schema";

describe("NXBGD Source Ingestion Engine V1 & Multi-Tier Authority Verification", () => {
  const g6MathDir = path.resolve("curriculum/vietnam/lower-secondary/grade-6/math");

  it("verifies 5-tier authority hierarchy in source-registry.json", () => {
    const sourceRegistry: SourceDocument[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "source-registry.json"), "utf-8")
    );

    // Tier A: MOET Curriculum Authority
    const tierA = sourceRegistry.filter((s) => s.sourceTier === "TIER_A_CURRICULUM_AUTHORITY");
    expect(tierA.length).toBeGreaterThanOrEqual(2);
    for (const s of tierA) {
      expect(s.authority).toBe("Bộ Giáo dục và Đào tạo Việt Nam");
      expect(s.sourceType).toBe("OFFICIAL_CURRICULUM");
      expect(s.rights?.redistribution).toBe(true);
    }

    // Tier B1: Approved Learning Sources (SGK, SGV, SBT)
    const tierB1 = sourceRegistry.filter((s) => s.sourceTier === "TIER_B_APPROVED_LEARNING_SOURCE");
    expect(tierB1.length).toBeGreaterThanOrEqual(4);
    for (const s of tierB1) {
      expect(s.authority).toBe("Nhà xuất bản Giáo dục Việt Nam");
      expect(s.sourceType).toBe("APPROVED_TEXTBOOK_SOURCE");
      expect(s.bookSeries).toBe("Kết nối tri thức với cuộc sống");
      expect(s.url).toMatch(/^https:\/\/taphuan\.nxbgd\.vn\//);
      expect(s.rights?.redistribution).toBe(false);
      expect(s.rights?.commercialReuse).toBe("NOT_GRANTED");
    }

    // Tier B2: Pedagogical Training Resources
    const tierB2 = sourceRegistry.filter((s) => s.sourceTier === "TIER_B_PEDAGOGICAL_SOURCE");
    expect(tierB2.length).toBeGreaterThanOrEqual(2);
    for (const s of tierB2) {
      expect(s.authority).toBe("Nhà xuất bản Giáo dục Việt Nam");
      expect(s.sourceType).toBe("PEDAGOGICAL_TRAINING_RESOURCE");
      expect(s.rights?.redistribution).toBe(false);
      expect(s.rights?.commercialReuse).toBe("NOT_GRANTED");
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
        } else if (/\.(pdf|epub|mobi)$/i.test(entry.name)) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const piratedFiles = findPiratedFiles(path.resolve("curriculum/vietnam"));
    expect(piratedFiles).toHaveLength(0);
  });

  it("verifies Knowledge Nodes link both Tier A MOET and Tier B NXBGD citations with exact page locators", () => {
    const nodes: KnowledgeNode[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "knowledge-nodes.json"), "utf-8")
    );

    expect(nodes).toHaveLength(4);

    // Node: Quy đồng mẫu số (NODE-MATH-5-FRAC-02)
    const quyDongNode = nodes.find((n) => n.id === "NODE-MATH-5-FRAC-02");
    expect(quyDongNode).toBeDefined();
    expect(quyDongNode?.sourceRefs).toBeDefined();

    const moetRef = quyDongNode?.sourceRefs?.find((r) => r.tier === "TIER_A_CURRICULUM_AUTHORITY");
    expect(moetRef).toBeDefined();
    expect(moetRef?.pageNumber).toBe(38);

    const nxbgdRef = quyDongNode?.sourceRefs?.find((r) => r.tier === "TIER_B_APPROVED_LEARNING_SOURCE");
    expect(nxbgdRef).toBeDefined();
    expect(nxbgdRef?.bookSeries).toBe("Kết nối tri thức với cuộc sống");
    expect(nxbgdRef?.chapterLocator).toBe("Chương VI: Phân số");
    expect(nxbgdRef?.pageNumber).toBe(16);

    const trainRef = quyDongNode?.sourceRefs?.find((r) => r.tier === "TIER_B_PEDAGOGICAL_SOURCE");
    expect(trainRef).toBeDefined();
    expect(trainRef?.sourceId).toBe("SRC-NXBGD-KNTT-MATH6-TRAIN-SLIDES-ARITHMETIC");
  });

  it("verifies Lesson fractions-addition references both MOET and NXBGD SGK & SGV", () => {
    const lesson: Lesson = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "lessons/fractions-addition.json"), "utf-8")
    );

    expect(lesson.approvedSourceRefs.length).toBeGreaterThanOrEqual(3);

    const moetRef = lesson.approvedSourceRefs.find((r) => r.tier === "TIER_A_CURRICULUM_AUTHORITY");
    expect(moetRef).toBeDefined();

    const sgkRef = lesson.approvedSourceRefs.find((r) => r.sourceId === "SRC-NXBGD-KNTT-MATH6-T2");
    expect(sgkRef).toBeDefined();
    expect(sgkRef?.pageNumber).toBe("15-18");

    const sgvRef = lesson.approvedSourceRefs.find((r) => r.sourceId === "SRC-NXBGD-KNTT-MATH6-SGV-T2");
    expect(sgvRef).toBeDefined();
    expect(sgvRef?.pageNumber).toBe("32-34");
  });

  it("verifies Parent Guide contains NXBGD pedagogical training insights", () => {
    const guides: ParentGuide[] = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "parent-guides/fractions-parent-guide.json"), "utf-8")
    );

    expect(guides.length).toBeGreaterThan(0);
    const guide = guides[0];

    const sgvRef = guide.sourceRefs.find((r) => r.sourceId === "SRC-NXBGD-KNTT-MATH6-SGV-T2");
    expect(sgvRef).toBeDefined();

    const trainDocRef = guide.sourceRefs.find((r) => r.sourceId === "SRC-NXBGD-KNTT-MATH6-TRAIN-DOC");
    expect(trainDocRef).toBeDefined();

    const slideRef = guide.sourceRefs.find((r) => r.sourceId === "SRC-NXBGD-KNTT-MATH6-TRAIN-SLIDES-ARITHMETIC");
    expect(slideRef).toBeDefined();
  });

  it("verifies publication manifest accounts for all 8 Tier A & Tier B sources with exact content SHA-256", () => {
    const manifest: PublicationManifest = JSON.parse(
      fs.readFileSync(path.join(g6MathDir, "publication-manifest.json"), "utf-8")
    );

    expect(manifest.sourceDocumentIds).toHaveLength(8);
    expect(manifest.sourceDocumentIds).toContain("SRC-VN-MOET-GEP-2018");
    expect(manifest.sourceDocumentIds).toContain("SRC-VN-MOET-MATH-2018");
    expect(manifest.sourceDocumentIds).toContain("SRC-NXBGD-KNTT-MATH6-T1");
    expect(manifest.sourceDocumentIds).toContain("SRC-NXBGD-KNTT-MATH6-T2");
    expect(manifest.sourceDocumentIds).toContain("SRC-NXBGD-KNTT-MATH6-SGV-T2");
    expect(manifest.sourceDocumentIds).toContain("SRC-NXBGD-KNTT-MATH6-SBT-T2");
    expect(manifest.sourceDocumentIds).toContain("SRC-NXBGD-KNTT-MATH6-TRAIN-DOC");
    expect(manifest.sourceDocumentIds).toContain("SRC-NXBGD-KNTT-MATH6-TRAIN-SLIDES-ARITHMETIC");

    // Exact checksum match
    const itemsBuf = fs.readFileSync(path.join(g6MathDir, "question-bank/items.json"));
    const lessonBuf = fs.readFileSync(path.join(g6MathDir, "lessons/fractions-addition.json"));
    const expectedChecksum = crypto
      .createHash("sha256")
      .update(itemsBuf)
      .update(lessonBuf)
      .digest("hex");

    expect(manifest.checksum).toBe(expectedChecksum);
  });
});

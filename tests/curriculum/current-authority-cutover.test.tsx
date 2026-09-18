/**
 * AI School Current Authority & Legacy Cutover Test Suite
 * 
 * Verifies all Task 8 requirements and Controller Audit Truth Patches:
 * 1. Current authority document defines full product scope (Preschool 3–6 AND Grade 1–12)
 * 2. Authority separates Preschool (not under GDPT 2018, not "small Grade 1") from Grade 1–12
 * 3. Authority uses AI_ASSISTED (not AI_GENERATED) and defines the 4-tier prerequisite evidence model
 * 4. Historical specs are marked as superseded baseline
 * 5. README and ARCHITECTURE feature AI School scope and contain NO "chữ ký số"
 * 6. Stale global source registry cannot be mistaken for current authority
 * 7. KnowledgeGapRunner legacy path is not active in production routes
 * 8. LearnerHome contains no fake learner mastery/evidence claims
 * 9. ParentView does not advertise unavailable live Grade 6 diagnostic
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import React from "react";
import { render, screen } from "@testing-library/react";
import { LearnerHome } from "@/components/v3/profile/LearnerHome";
import { ParentView } from "@/components/v3/profile/ParentView";

describe("AI School Current Authority & Legacy Cutover", () => {
  const rootDir = path.resolve(".");

  describe("1. Current Authority Document (docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md)", () => {
    const authorityDocPath = path.join(rootDir, "docs", "authority", "AI_SCHOOL_CURRENT_AUTHORITY.md");

    it("exists at docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md", () => {
      expect(fs.existsSync(authorityDocPath)).toBe(true);
    });

    it("restores full product scope: Preschool ages 3–6 through Grade 12", () => {
      const content = fs.readFileSync(authorityDocPath, "utf-8");
      expect(content).toContain("Preschool (ages 3–6) through Grade 12");
      expect(content).toMatch(/PRESCHOOL/);
      expect(content).toMatch(/GRADE 1–12/);
      expect(content).toContain("3–4, 4–5, 5–6");
    });

    it("defines stage-specific authority and does not place preschool under GDPT 2018", () => {
      const content = fs.readFileSync(authorityDocPath, "utf-8");
      // Explicitly specifies preschool is NOT small Grade 1 and NOT under TT32/GDPT 2018
      expect(content).toContain("NOT \"small Grade 1\"");
      expect(content).toMatch(/NOT governed by TT 32\/2018\/TT-BGDĐT \(GDPT 2018\)/);
      expect(content).toMatch(/Chương trình Giáo dục Mầm non/);
      expect(content).toMatch(/developmental, play-based, observational, and parent-guided/i);
    });

    it("defines STUDENT truth (no runtime generative AI, only reviewed content, DAG gap, no fake scores)", () => {
      const content = fs.readFileSync(authorityDocPath, "utf-8");
      expect(content).toMatch(/no runtime generative AI/i);
      expect(content).toMatch(/reviewed.*published/i);
      expect(content).toMatch(/diagnostic.*evidence.*prerequisite.*learning.*retest/i);
      expect(content).toMatch(/no fake global score/i);
    });

    it("defines PARENT truth (Parent Copilot isolated, read-only, cannot alter evidence)", () => {
      const content = fs.readFileSync(authorityDocPath, "utf-8");
      expect(content).toContain("Parent Copilot");
      expect(content).toMatch(/parent-facing only/i);
      expect(content).toMatch(/cannot change mastery\/evidence state/i);
    });

    it("defines CONTENT AUTHORITY truth with valid authoringOrigin enum (AI_ASSISTED, not AI_GENERATED)", () => {
      const content = fs.readFileSync(authorityDocPath, "utf-8");
      expect(content).toContain("FROZEN");
      expect(content).toMatch(/server-only/i);
      expect(content).toMatch(/human review attestation/i);
      expect(content).toMatch(/fail-closed/i);
      // Terminology check: Must use AI_ASSISTED, not AI_GENERATED
      expect(content).toContain("AI_ASSISTED");
      expect(content).not.toContain("AI_GENERATED");
      expect(content).toContain("HUMAN");
      expect(content).toContain("ADAPTED_WITH_PERMISSION");
    });

    it("defines formal 4-tier prerequisite evidence model rather than claiming verbatim textbook text", () => {
      const content = fs.readFileSync(authorityDocPath, "utf-8");
      expect(content).toContain("CURRICULUM_EXPLICIT");
      expect(content).toContain("EXPERT_REVIEW");
      expect(content).toContain("EMPIRICAL");
      expect(content).toContain("DRAFT_INFERENCE");
    });

    it("defines CURRENT GRADE 6 STATUS (SOURCE_LINKED / AI_DRAFT / DRAFT, zero reviewer, zero published)", () => {
      const content = fs.readFileSync(authorityDocPath, "utf-8");
      expect(content).toMatch(/SOURCE_LINKED/i);
      expect(content).toMatch(/DRAFT/i);
      expect(content).toMatch(/zero production reviewer/i);
      expect(content).toMatch(/zero student-published diagnostic content/i);
    });
  });

  describe("2. Historical Specs Labelling", () => {
    const historicalDocs = [
      "2026-09-17-assessment-platform-design.md",
      "2026-09-17-assessment-platform-implementation.md",
      "2026-09-17-child-ai-school-migration-plan-v2.md",
      "2026-09-17-child-ai-school-product-correction-v2.md",
      "GEMINI_3_8_FLASH_MASTER_EXECUTION_PROMPT.md",
      "GEMINI_CHILD_AI_SCHOOL_V2_EXECUTION_PROMPT.md",
      "docs/design/DESIGN_SYSTEM.md",
      "docs/adr/ADR-001-deterministic-scoring-authority.md",
    ];

    for (const docRelPath of historicalDocs) {
      it(`labels ${docRelPath} as historical baseline superseded for public product direction`, () => {
        const fullPath = path.join(rootDir, docRelPath);
        expect(fs.existsSync(fullPath)).toBe(true);
        const content = fs.readFileSync(fullPath, "utf-8");
        expect(content).toContain("HISTORICAL BASELINE");
        expect(content).toContain("SUPERSEDED FOR CURRENT PUBLIC PRODUCT DIRECTION");
        expect(content).toContain("RETAINED AS REUSABLE PLATFORM-CORE REFERENCE");
      });
    }
  });

  describe("3. README and ARCHITECTURE Alignment & Digital Signature Removal", () => {
    it("README.md features full scope (Preschool 3–6 and Grade 1–12) and contains NO 'chữ ký số'", () => {
      const readme = fs.readFileSync(path.join(rootDir, "README.md"), "utf-8");
      expect(readme).toContain("AI School");
      expect(readme).toContain("Mầm non (3–6 tuổi)");
      expect(readme).toContain("Lớp 1–12");
      expect(readme).toContain("REUSABLE PLATFORM-CORE REFERENCE");
      // MUST NOT contain 'chữ ký số'
      expect(readme).not.toContain("chữ ký số");
      expect(readme).toContain("human review attestation");
    });

    it("ARCHITECTURE.md features AI School architecture and contains NO 'chữ ký số'", () => {
      const arch = fs.readFileSync(path.join(rootDir, "ARCHITECTURE.md"), "utf-8");
      expect(arch).toContain("AI School");
      expect(arch).toContain("R2 Content Authority Layer");
      expect(arch).toContain("FROZEN");
      expect(arch).not.toContain("chữ ký số");
    });
  });

  describe("4. Legacy Source Registry Cleanup", () => {
    it("curriculum/sources/registry.json is explicitly marked non-authoritative", () => {
      const regPath = path.join(rootDir, "curriculum", "sources", "registry.json");
      const reg = JSON.parse(fs.readFileSync(regPath, "utf-8"));
      expect(reg.isAuthoritative).toBe(false);
      expect(reg.registryStatus).toBe("LEGACY_NON_AUTHORITATIVE");
      expect(reg.notice).toContain("HISTORICAL BASELINE");
      expect(reg.notice).toContain("NON-AUTHORITATIVE");
    });

    it("canonical subject source registry exists and adheres to R2.1 SourceDocument provenance", () => {
      const canonicalPath = path.join(
        rootDir,
        "curriculum",
        "vietnam",
        "lower-secondary",
        "grade-6",
        "math",
        "source-registry.json"
      );
      expect(fs.existsSync(canonicalPath)).toBe(true);
      const canonicalSources = JSON.parse(fs.readFileSync(canonicalPath, "utf-8"));
      expect(Array.isArray(canonicalSources)).toBe(true);
      expect(canonicalSources.length).toBeGreaterThan(0);
      expect(canonicalSources[0]).toHaveProperty("sourceTier");
      expect(canonicalSources[0]).toHaveProperty("verificationStatus");
    });
  });

  describe("5. KnowledgeGapRunner Legacy Component Isolation", () => {
    it("KnowledgeGapRunner is marked with @deprecated HISTORICAL_BASELINE_PROTOTYPE", () => {
      const runnerPath = path.join(rootDir, "components", "diagnostic", "KnowledgeGapRunner.tsx");
      const content = fs.readFileSync(runnerPath, "utf-8");
      expect(content).toContain("@deprecated HISTORICAL_BASELINE_PROTOTYPE");
      expect(content).toContain("HISTORICAL BASELINE");
      expect(content).toContain("SUPERSEDED FOR CURRENT PUBLIC PRODUCT DIRECTION");
      expect(content).toContain("DO NOT IMPORT THIS COMPONENT INTO ACTIVE STUDENT ROUTES");
    });

    it("is not imported by any route in the app/ directory", () => {
      const appDir = path.join(rootDir, "app");
      const checkDir = (dir: string): string[] => {
        let files: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            files = files.concat(checkDir(fullPath));
          } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }
        return files;
      };

      const appFiles = checkDir(appDir);
      for (const file of appFiles) {
        const text = fs.readFileSync(file, "utf-8");
        expect(text).not.toContain("KnowledgeGapRunner");
      }
    });
  });

  describe("6. LearnerHome Fake Evidence Cleanup", () => {
    it("does not contain unbadged fake evidence claims in source code", () => {
      const learnerHomePath = path.join(rootDir, "components", "v3", "profile", "LearnerHome.tsx");
      const content = fs.readFileSync(learnerHomePath, "utf-8");
      // Must not claim unbadged solid mastery or high confidence for current user
      expect(content).not.toContain("Đã có bằng chứng vững");
      // Must explicitly badge illustrative demo
      expect(content).toContain("Ví dụ minh họa");
      expect(content).toContain("Không phải kết quả thực tế");
    });

    it("renders truthful empty state for learner and explicitly disclaims illustrative data", () => {
      render(<LearnerHome user={{ displayName: "Nguyễn Văn A" }} />);

      // Truthful empty state is rendered
      expect(screen.getByText(/Chưa có dữ liệu khảo sát được ghi nhận/i)).toBeInTheDocument();
      expect(screen.getByText(/Học sinh chưa hoàn thành bài khảo sát chẩn đoán nào/i)).toBeInTheDocument();

      // CTA points to diagnostic selection
      const ctas = screen.getAllByRole("link", { name: /Bắt đầu chẩn đoán kiến thức|Chọn bài kiểm tra mới/i });
      expect(ctas.length).toBeGreaterThan(0);
      expect(ctas[0]).toHaveAttribute("href", "/learn/new");

      // Illustrative demo cards are explicitly badged
      const demoBadges = screen.getAllByText(/Ví dụ minh họa/i);
      expect(demoBadges.length).toBeGreaterThan(0);
      expect(screen.getByText(/Không phải kết quả thực tế/i)).toBeInTheDocument();

      // No fake mastery claims
      expect(screen.queryByText(/Đã có bằng chứng vững/i)).toBeNull();
      expect(screen.queryByText(/Điểm trung bình năng lực/i)).toBeNull();
    });
  });

  describe("7. ParentView Truth & Grade 6 Diagnostic Non-Availability", () => {
    it("does not advertise unavailable live Grade 6 diagnostic or unsupported live claims", () => {
      const parentViewPath = path.join(rootDir, "components", "v3", "profile", "ParentView.tsx");
      const content = fs.readFileSync(parentViewPath, "utf-8");

      // Unsupported live-product claims must not exist as live instructions
      expect(content).not.toContain("1. Khảo sát nhanh 5 phút:");
      expect(content).not.toContain("Cùng con làm 4 câu hỏi nhận thức môn Toán 6");
      expect(content).not.toContain("Bắt đầu khảo sát cùng con");

      // Must explicitly badge illustrative guide and state DRAFT/CONTENT_NOT_AVAILABLE
      expect(content).toContain("Ví dụ minh họa");
      expect(content).toContain("CONTENT_NOT_AVAILABLE");
      expect(content).toContain("DRAFT");
    });

    it("renders ParentView with explicit illustrative disclaimer and links to curriculum catalog", () => {
      render(<ParentView />);

      expect(screen.getAllByText(/Ví dụ minh họa/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/CONTENT_NOT_AVAILABLE/i).length).toBeGreaterThan(0);

      const catalogLink = screen.getByRole("link", { name: /Xem danh mục chương trình/i });
      expect(catalogLink).toHaveAttribute("href", "/curriculum");
    });
  });

  describe("8. Legal Authority Freshness Refresh (2026-09-18)", () => {
    const canonicalRegistryPath = path.join(
      rootDir,
      "curriculum",
      "vietnam",
      "lower-secondary",
      "grade-6",
      "math",
      "source-registry.json"
    );
    const authorityDocPath = path.join(rootDir, "docs", "authority", "AI_SCHOOL_CURRENT_AUTHORITY.md");

    it("GEP TT32 and Math TT32 effectiveFrom is 2019-02-15 and agrees with authority document", () => {
      const sources = JSON.parse(fs.readFileSync(canonicalRegistryPath, "utf-8"));
      const gepSource = sources.find((s: any) => s.id === "SRC-VN-MOET-GEP-2018");
      expect(gepSource).toBeDefined();
      expect(gepSource.effectiveFrom).toBe("2019-02-15");
      expect(gepSource.issuedAt).toBe("2018-12-26");

      const mathSource = sources.find((s: any) => s.id === "SRC-VN-MOET-MATH-2018");
      expect(mathSource).toBeDefined();
      expect(mathSource.effectiveFrom).toBe("2019-02-15");
      expect(mathSource.issuedAt).toBe("2018-12-26");

      // Verify authority doc agreement
      const authorityDoc = fs.readFileSync(authorityDocPath, "utf-8");
      expect(authorityDoc).toContain("32/2018/TT-BGDĐT");
      expect(authorityDoc).toContain("15/02/2019");
    });

    it("general authority chain contains TT20, TT13, TT17 and orders VBHN10 before TT17", () => {
      const sources = JSON.parse(fs.readFileSync(canonicalRegistryPath, "utf-8"));
      const gepSource = sources.find((s: any) => s.id === "SRC-VN-MOET-GEP-2018");
      expect(gepSource).toBeDefined();
      expect(gepSource.authorityChain).toContain("SRC-VN-MOET-AMEND-20-2021");
      expect(gepSource.authorityChain).toContain("SRC-VN-MOET-AMEND-13-2022");
      expect(gepSource.authorityChain).toContain("SRC-VN-MOET-VBHN-10-2022");
      expect(gepSource.authorityChain).toContain("SRC-VN-MOET-AMEND-17-2025");

      // Chronological order check: VBHN10 (2022-12-30) predates TT17 (2025-09-12)
      const vbhnIndex = gepSource.authorityChain.indexOf("SRC-VN-MOET-VBHN-10-2022");
      const tt17Index = gepSource.authorityChain.indexOf("SRC-VN-MOET-AMEND-17-2025");
      expect(vbhnIndex).toBeLessThan(tt17Index);
    });

    it("TT13 effectiveFrom is 2022-08-03", () => {
      const sources = JSON.parse(fs.readFileSync(canonicalRegistryPath, "utf-8"));
      const tt13 = sources.find((s: any) => s.id === "SRC-VN-MOET-AMEND-13-2022");
      expect(tt13).toBeDefined();
      expect(tt13.documentNumber).toBe("13/2022/TT-BGDĐT");
      expect(tt13.issuedAt).toBe("2022-08-03");
      expect(tt13.effectiveFrom).toBe("2022-08-03");
    });

    it("TT17/2025 source exists and is Tier A with official metadata and honest verification", () => {
      const sources = JSON.parse(fs.readFileSync(canonicalRegistryPath, "utf-8"));
      const tt17 = sources.find((s: any) => s.id === "SRC-VN-MOET-AMEND-17-2025");
      expect(tt17).toBeDefined();
      expect(tt17.documentNumber).toBe("17/2025/TT-BGDĐT");
      expect(tt17.issuedAt).toBe("2025-09-12");
      expect(tt17.effectiveFrom).toBe("2025-09-12");
      expect(tt17.sourceType).toBe("OFFICIAL_CURRICULUM");
      expect(tt17.sourceTier).toBe("TIER_A_CURRICULUM_AUTHORITY");
      expect(tt17.requiredForSlice).toBe(false);
      // Honest offline status, no fabricated remote fetch
      expect(tt17.verificationStatus).toBe("OFFLINE_REGISTERED_METADATA");
      expect(tt17.httpStatus).toBeUndefined();
    });

    it("TT17 is NOT falsely claimed to amend Math 6", () => {
      const sources = JSON.parse(fs.readFileSync(canonicalRegistryPath, "utf-8"));
      const mathSource = sources.find((s: any) => s.id === "SRC-VN-MOET-MATH-2018");
      expect(mathSource).toBeDefined();
      expect(mathSource.authorityChain).not.toContain("SRC-VN-MOET-AMEND-17-2025");
      expect(mathSource.authorityChain).toEqual([
        "SRC-VN-MOET-MATH-2018",
        "SRC-VN-MOET-VBHN-10-2022",
      ]);
    });

    it("VBHN10/2022 is not called complete current-2026 consolidation and predates TT17/2025", () => {
      const sources = JSON.parse(fs.readFileSync(canonicalRegistryPath, "utf-8"));
      const vbhn10 = sources.find((s: any) => s.id === "SRC-VN-MOET-VBHN-10-2022");
      expect(vbhn10).toBeDefined();
      expect(vbhn10.consolidationScope).toContain("Predates TT17/2025");
      expect(vbhn10.rights?.notes).toContain("không cấu thành bản hợp nhất toàn diện năm 2026");

      const authorityDoc = fs.readFileSync(authorityDocPath, "utf-8");
      expect(authorityDoc).toContain("Official consolidated snapshot through `TT32/2018 + TT20/2021 + TT13/2022`");
      expect(authorityDoc).toContain("Predates `TT17/2025/TT-BGDĐT`");
      expect(authorityDoc).toMatch(/Must NOT be described as a complete 2026 consolidation/i);
    });

    it("legalAuthorityAsOf = 2026-09-18 and preferred wording is present", () => {
      const sources = JSON.parse(fs.readFileSync(canonicalRegistryPath, "utf-8"));
      const gepSource = sources.find((s: any) => s.id === "SRC-VN-MOET-GEP-2018");
      expect(gepSource.legalAuthorityAsOf).toBe("2026-09-18");

      const tt17 = sources.find((s: any) => s.id === "SRC-VN-MOET-AMEND-17-2025");
      expect(tt17.legalAuthorityAsOf).toBe("2026-09-18");

      const authorityDoc = fs.readFileSync(authorityDocPath, "utf-8");
      expect(authorityDoc).toContain("legalAuthorityAsOf: 2026-09-18");
      expect(authorityDoc).toContain(
        "TT32/2018 and effective amendments tracked by the source authority registry, with subject-specific applicability."
      );
    });

    it("preserves preschool truth: separate national authority, 2026-2027 pilot separate, not under GDPT 2018", () => {
      const authorityDoc = fs.readFileSync(authorityDocPath, "utf-8");
      expect(authorityDoc).toContain("NOT governed by TT 32/2018/TT-BGDĐT (GDPT 2018)");
      expect(authorityDoc).toContain("Đề án thí điểm GDMN mới 2026-2027");
      expect(authorityDoc).toContain("classified under Tier B and separated from current national standards");
    });

    it("does NOT add un-enacted August 2026 draft amendment to current legal authority", () => {
      const sources = JSON.parse(fs.readFileSync(canonicalRegistryPath, "utf-8"));
      for (const s of sources) {
        expect(s.id).not.toContain("2026-DRAFT");
        expect(s.documentNumber || "").not.toMatch(/dự thảo|draft/i);
      }
      const authorityDoc = fs.readFileSync(authorityDocPath, "utf-8");
      expect(authorityDoc).not.toMatch(/dự thảo sửa đổi.*2026/i);
      expect(authorityDoc).toContain("Draft Amendments Excluded");
    });
  });
});


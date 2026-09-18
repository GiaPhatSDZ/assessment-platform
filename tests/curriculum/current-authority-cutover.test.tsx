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
});

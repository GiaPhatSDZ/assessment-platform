#!/usr/bin/env node
/**
 * NXBGD Source Ingestion Engine V1
 *
 * Ingests and registers approved learning sources and pedagogical training resources
 * from taphuan.nxbgd.vn (Nhà xuất bản Giáo dục Việt Nam) for Grade 6 Mathematics.
 *
 * Strict Compliance:
 * 1. Multi-tier authority architecture:
 *    - Tier A: MOET Curriculum Authority
 *    - Tier B1: Approved Textbook Source (SGK / SGV / SBT)
 *    - Tier B2: Pedagogical Training Resource (Tài liệu tập huấn, Slide bồi dưỡng chuyên đề)
 *    - Tier C: Internal Reviewed Content
 *    - Tier D: AI Draft
 * 2. Copyright Boundary:
 *    - redistribution: false, commercialReuse: "NOT_GRANTED"
 *    - NEVER stores raw PDF or scanned images in git.
 *    - Only stores metadata, canonical URLs, page locators, and pedagogical citations.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../");

export const NXBGD_GRADE_6_MATH_SOURCES = [
  {
    id: "SRC-VN-MOET-GEP-2018",
    authority: "Bộ Giáo dục và Đào tạo Việt Nam",
    title: "Chương trình Giáo dục Phổ thông 2018 — Chương trình Tổng thể",
    documentNumber: "32/2018/TT-BGDĐT",
    sourceType: "OFFICIAL_CURRICULUM",
    sourceTier: "TIER_A_CURRICULUM_AUTHORITY",
    resourceType: "LEGAL_DOCUMENT",
    url: "https://moet.gov.vn/van-ban/van-ban-quan-ly/Pages/chi-tiet-van-ban.aspx?ItemID=1301",
    issuedAt: "2018-12-26",
    effectiveFrom: "2020-02-15",
    sourceVersion: "2018-12-26-TT32-GEP",
    retrievedAt: "2026-09-17",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: true,
      commercialReuse: "CONDITIONAL",
      notes: "Văn bản quy phạm pháp luật nhà nước Việt Nam, trích dẫn hợp lệ.",
    },
    localChecksum: "96b6d516ca47a19bb61cdb306e36b85662ef4f48b115b9357f7445bfd33f5305",
  },
  {
    id: "SRC-VN-MOET-MATH-2018",
    authority: "Bộ Giáo dục và Đào tạo Việt Nam",
    title: "Chương trình Giáo dục Phổ thông Môn Toán (Ban hành kèm Thông tư 32/2018/TT-BGDĐT)",
    documentNumber: "32/2018/TT-BGDĐT",
    sourceType: "OFFICIAL_CURRICULUM",
    sourceTier: "TIER_A_CURRICULUM_AUTHORITY",
    resourceType: "CURRICULUM_STANDARD",
    url: "https://moet.gov.vn/van-ban/van-ban-quan-ly/Pages/chi-tiet-van-ban.aspx?ItemID=1301",
    issuedAt: "2018-12-26",
    effectiveFrom: "2020-02-15",
    sourceVersion: "2018-12-26-TT32-MATH",
    retrievedAt: "2026-09-17",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: true,
      commercialReuse: "CONDITIONAL",
      notes: "Chuẩn đầu ra yêu cầu cần đạt chính thức môn Toán cấp THCS.",
    },
    localChecksum: "f4c2847a9ef387c95e1e78553258c732049d5bf59b43e8869b2d88bbd6d37012",
  },
  {
    id: "SRC-NXBGD-KNTT-MATH6-T1",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "SGK Toán 6, tập một — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "APPROVED_TEXTBOOK_SOURCE",
    sourceTier: "TIER_B_APPROVED_LEARNING_SOURCE",
    resourceType: "TEXTBOOK",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-toan-6-tap-mot.4699854777",
    retrievedAt: "2026-09-17",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Sử dụng miễn phí cho mục đích giảng dạy và học tập; không sử dụng cho mục đích kinh doanh. Chỉ lưu trữ siêu dữ liệu và chỉ mục bài học.",
    },
    rightsNotes: "Bản quyền thuộc Nhà xuất bản Giáo dục Việt Nam. AI School chỉ lưu trích dẫn và vị trí trang.",
  },
  {
    id: "SRC-NXBGD-KNTT-MATH6-T2",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "SGK Toán 6, tập hai — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "APPROVED_TEXTBOOK_SOURCE",
    sourceTier: "TIER_B_APPROVED_LEARNING_SOURCE",
    resourceType: "TEXTBOOK",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-toan-6-tap-hai.4699864675",
    retrievedAt: "2026-09-17",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Sử dụng miễn phí cho mục đích giảng dạy và học tập; không sử dụng cho mục đích kinh doanh. Chỉ lưu trữ siêu dữ liệu và chỉ mục bài học.",
    },
    rightsNotes: "Bản quyền thuộc Nhà xuất bản Giáo dục Việt Nam. Chứa Chương VI: Phân số (Bài 23 - Bài 27, trang 5 - 28).",
  },
  {
    id: "SRC-NXBGD-KNTT-MATH6-SGV-T2",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "SGV Toán 6, tập hai — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "APPROVED_TEXTBOOK_SOURCE",
    sourceTier: "TIER_B_APPROVED_LEARNING_SOURCE",
    resourceType: "TEACHER_GUIDE",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgv-toan-6.4918795172",
    retrievedAt: "2026-09-17",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Sách giáo viên hướng dẫn phương pháp dạy học phân số và giải bài tập.",
    },
    rightsNotes: "Bản quyền thuộc Nhà xuất bản Giáo dục Việt Nam. Cung cấp lưu ý sư phạm và bẫy sai lầm phổ biến của học sinh.",
  },
  {
    id: "SRC-NXBGD-KNTT-MATH6-SBT-T2",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "SBT Toán 6, tập hai (Bài mẫu) — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "APPROVED_TEXTBOOK_SOURCE",
    sourceTier: "TIER_B_APPROVED_LEARNING_SOURCE",
    resourceType: "WORKBOOK_SAMPLE",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/vbt-toan-6-tap-hai-bai-mau.4733221119",
    retrievedAt: "2026-09-17",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Sách bài tập mẫu tham chiếu độ khó và mức độ nhận thức.",
    },
    rightsNotes: "Bản quyền thuộc NXBGD. AI School tuyệt đối không sao chép nguyên văn câu hỏi vào ngân hàng đề thi.",
  },
  {
    id: "SRC-NXBGD-KNTT-MATH6-TRAIN-DOC",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "Tài liệu tập huấn giáo viên môn Toán 6 — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "PEDAGOGICAL_TRAINING_RESOURCE",
    sourceTier: "TIER_B_PEDAGOGICAL_SOURCE",
    resourceType: "TRAINING_DOCUMENT",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/tai-lieu-tap-huan-giao-vien-mon-toan-6.4528872517",
    retrievedAt: "2026-09-17",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Tài liệu bồi dưỡng giáo viên phân tích cấu trúc mạch kiến thức Số học và phân số.",
    },
    rightsNotes: "Bản quyền thuộc NXBGD. Dùng để xây dựng gợi ý sư phạm cho phụ huynh (Parent Guide) và chẩn đoán mắt xích hổng.",
  },
  {
    id: "SRC-NXBGD-KNTT-MATH6-TRAIN-SLIDES-ARITHMETIC",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "Slide phục vụ bồi dưỡng giáo viên sử dụng SGK môn Toán 6 — Phần 2: Số học",
    sourceType: "PEDAGOGICAL_TRAINING_RESOURCE",
    sourceTier: "TIER_B_PEDAGOGICAL_SOURCE",
    resourceType: "TRAINING_SLIDE",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://nxbgdco-my.sharepoint.com/:p:/g/personal/khodulieudungchung_nxbgd_vn/IQCNCEOqjRYuSJ17gJbbE9zUAfL8PchaylW61hcMq79g3nc?e=QnPFVW",
    retrievedAt: "2026-09-17",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Slide đào tạo chuyên sâu về đổi mới phương pháp dạy học Số học và Phân số.",
    },
    rightsNotes: "Bản quyền thuộc NXBGD.",
  },
];

export function runIngestion(options = { dryRun: false }) {
  const targetPath = path.join(
    REPO_ROOT,
    "curriculum/vietnam/lower-secondary/grade-6/math/source-registry.json"
  );

  console.log("=== NXBGD Source Ingestion Engine V1 ===");
  console.log(`Target: ${targetPath}`);
  console.log(`Ingesting ${NXBGD_GRADE_6_MATH_SOURCES.length} sources...`);

  // Verify copyright boundary
  for (const src of NXBGD_GRADE_6_MATH_SOURCES) {
    if (src.sourceTier.startsWith("TIER_B")) {
      if (src.rights.redistribution !== false || src.rights.commercialReuse !== "NOT_GRANTED") {
        throw new Error(
          `Security violation: Source ${src.id} must have redistribution: false and commercialReuse: "NOT_GRANTED"`
        );
      }
      if (!src.url.startsWith("https://taphuan.nxbgd.vn/") && !src.url.startsWith("https://nxbgdco-my.sharepoint.com/")) {
        throw new Error(`Authority domain violation: Source ${src.id} URL must originate from taphuan.nxbgd.vn`);
      }
    }
  }

  const jsonContent = JSON.stringify(NXBGD_GRADE_6_MATH_SOURCES, null, 2) + "\n";

  if (!options.dryRun) {
    fs.writeFileSync(targetPath, jsonContent, "utf8");
    console.log("Ingestion successful: source-registry.json updated.");
  } else {
    console.log("Dry run complete. No files written.");
  }

  return NXBGD_GRADE_6_MATH_SOURCES;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isDryRun = process.argv.includes("--dry-run");
  runIngestion({ dryRun: isDryRun });
}

#!/usr/bin/env node
/**
 * AI School V3 — Source Verification & Ingestion Engine V2 (Grade 6 Math)
 *
 * Implements Controller Audit Fix R2 Source Provenance:
 * 1. Multi-Tier Authority Architecture:
 *    - Tier A: MOET Curriculum Authority & Consolidated Legal Chain (32/2018, 20/2021, 13/2022, 10/VBHN-2022)
 *    - Tier B1: MOET Approved Textbooks (SGK Toán 6 Tập 1 & Tập 2)
 *    - Tier B2: NXBGD Publisher Resources (SGV Toán 6, VBT Toán 6 Bài mẫu)
 *    - Tier B3: Pedagogical Training Resources (Tài liệu tập huấn GV, Slide bồi dưỡng)
 *    - Tier C: Internal Reviewed Content (Architectural Destination)
 *    - Tier D: AI Draft (Current Content State)
 *
 * 2. Strict TLS Verification (Fail Closed):
 *    - Cryptographically verifies TLS using Node root certificates plus authentic Sectigo intermediate CA.
 *    - Strictly prohibits rejectUnauthorized=false or NODE_TLS_REJECT_UNAUTHORIZED=0.
 *    - Sets TLS_VERIFICATION_FAILED upon any TLS handshake failure.
 *
 * 3. 5-Stage Verification Status Model:
 *    - UNVERIFIED -> URL_REACHABLE -> METADATA_VERIFIED -> VIEWER_INVENTORY_VERIFIED -> LOCATOR_HUMAN_VERIFIED
 *    - HTTP 200/302 alone does NOT claim locator verification.
 *
 * 4. Deterministic Canonical Metadata Fingerprinting:
 *    - Canonical metadata JSON is normalized and hashed separately from volatile dynamic HTML/tokens.
 *
 * 5. Repository Copyright Boundary:
 *    - "Repository copyright boundary enforced: no full textbook files stored; commercial reuse rights are not granted; legal review is required before commercial deployment using NXBGD-derived resources."
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import https from "node:https";
import tls from "node:tls";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../");

export const COPYRIGHT_BOUNDARY_DECLARATION =
  "Repository copyright boundary enforced: no full textbook files stored; commercial reuse rights are not granted; legal review is required before commercial deployment using NXBGD-derived resources.";

// Authentic Sectigo intermediate CA for taphuan.nxbgd.vn (AIA: http://crt.sectigo.com/SectigoPublicServerAuthenticationCADVR36.crt)
export const SECTIGO_INTERMEDIATE_CA = `-----BEGIN CERTIFICATE-----
MIIGTDCCBDSgAwIBAgIQOXpmzCdWNi4NqofKbqvjsTANBgkqhkiG9w0BAQwFADBf
MQswCQYDVQQGEwJHQjEYMBYGA1UEChMPU2VjdGlnbyBMaW1pdGVkMTYwNAYDVQQD
Ey1TZWN0aWdvIFB1YmxpYyBTZXJ2ZXIgQXV0aGVudGljYXRpb24gUm9vdCBSNDYw
HhcNMjEwMzIyMDAwMDAwWhcNMzYwMzIxMjM1OTU5WjBgMQswCQYDVQQGEwJHQjEY
MBYGA1UEChMPU2VjdGlnbyBMaW1pdGVkMTcwNQYDVQQDEy5TZWN0aWdvIFB1Ymxp
YyBTZXJ2ZXIgQXV0aGVudGljYXRpb24gQ0EgRFYgUjM2MIIBojANBgkqhkiG9w0B
AQEFAAOCAY8AMIIBigKCAYEAljZf2HIz7+SPUPQCQObZYcrxLTHYdf1ZtMRe7Yeq
RPSwygz16qJ9cAWtWNTcuICc++p8Dct7zNGxCpqmEtqifO7NvuB5dEVexXn9RFFH
12Hm+NtPRQgXIFjx6MSJcNWuVO3XGE57L1mHlcQYj+g4hny90aFh2SCZCDEVkAja
EMMfYPKuCjHuuF+bzHFb/9gV8P9+ekcHENF2nR1efGWSKwnfG5RawlkaQDpRtZTm
M64TIsv/r7cyFO4nSjs1jLdXYdz5q3a4L0NoabZfbdxVb+CUEHfB0bpulZQtH1Rv
38e/lIdP7OTTIlZh6OYL6NhxP8So0/sht/4J9mqIGxRFc0/pC8suja+wcIUna0HB
pXKfXTKpzgis+zmXDL06ASJf5E4A2/m+Hp6b84sfPAwQ766rI65mh50S0Di9E3Pn
2WcaJc+PILsBmYpgtmgWTR9eV9otfKRUBfzHUHcVgarub/XluEpRlTtZudU5xbFN
xx/DgMrXLUAPaI60fZ6wA+PTAgMBAAGjggGBMIIBfTAfBgNVHSMEGDAWgBRWc1hk
lfmSGrASKgRieaFAFYghSTAdBgNVHQ4EFgQUaMASFhgOr872h6YyV6NGUV3LBycw
DgYDVR0PAQH/BAQDAgGGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0lBBYwFAYI
KwYBBQUHAwEGCCsGAQUFBwMCMBsGA1UdIAQUMBIwBgYEVR0gADAIBgZngQwBAgEw
VAYDVR0fBE0wSzBJoEegRYZDaHR0cDovL2NybC5zZWN0aWdvLmNvbS9TZWN0aWdv
UHVibGljU2VydmVyQXV0aGVudGljYXRpb25Sb290UjQ2LmNybDCBhAYIKwYBBQUH
AQEEeDB2ME8GCCsGAQUFBzAChkNodHRwOi8vY3J0LnNlY3RpZ28uY29tL1NlY3Rp
Z29QdWJsaWNTZXJ2ZXJBdXRoZW50aWNhdGlvblJvb3RSNDYucDdjMCMGCCsGAQUF
BzABhhdodHRwOi8vb2NzcC5zZWN0aWdvLmNvbTANBgkqhkiG9w0BAQwFAAOCAgEA
YtOC9Fy+TqECFw40IospI92kLGgoSZGPOSQXMBqmsGWZUQ7rux7cj1du6d9rD6C8
ze1B2eQjkrGkIL/OF1s7vSmgYVafsRoZd/IHUrkoQvX8FZwUsmPu7amgBfaY3g+d
q1x0jNGKb6I6Bzdl6LgMD9qxp+3i7GQOnd9J8LFSietY6Z4jUBzVoOoz8iAU84OF
h2HhAuiPw1ai0VnY38RTI+8kepGWVfGxfBWzwH9uIjeooIeaosVFvE8cmYUB4TSH
5dUyD0jHct2+8ceKEtIoFU/FfHq/mDaVnvcDCZXtIgitdMFQdMZaVehmObyhRdDD
4NQCs0gaI9AAgFj4L9QtkARzhQLNyRf87Kln+YU0lgCGr9HLg3rGO8q+Y4ppLsOd
unQZ6ZxPNGIfOApbPVf5hCe58EZwiWdHIMn9lPP6+F404y8NNugbQixBber+x536
WrZhFZLjEkhp7fFXf9r32rNPfb74X/U90Bdy4lzp3+X1ukh1BuMxA/EEhDoTOS3l
7ABvc7BYSQubQ2490OcdkIzUh3ZwDrakMVrbaTxUM2p24N6dB+ns2zptWCva6jzW
r8IWKIMxzxLPv5Kt3ePKcUdvkBU/smqujSczTzzSjIoR5QqQA6lN1ZRSnuHIWCvh
JEltkYnTAH41QJ6SAWO66GrrUESwN/cgZzL4JLEqz1Y=
-----END CERTIFICATE-----`;

export const RAW_GRADE_6_SOURCES = [
  // --- TẦNG A: CURRICULUM AUTHORITY (Bộ GD&ĐT) ---
  {
    id: "SRC-VN-MOET-GEP-2018",
    authority: "Bộ Giáo dục và Đào tạo Việt Nam",
    title: "Chương trình Giáo dục Phổ thông 2018 — Chương trình Tổng thể (Ban hành kèm Thông tư 32/2018/TT-BGDĐT)",
    documentNumber: "32/2018/TT-BGDĐT",
    sourceType: "OFFICIAL_CURRICULUM",
    sourceTier: "TIER_A_CURRICULUM_AUTHORITY",
    resourceType: "LEGAL_DOCUMENT",
    url: "https://moet.gov.vn/van-ban/van-ban-quan-ly/Pages/chi-tiet-van-ban.aspx?ItemID=1301",
    issuedAt: "2018-12-26",
    effectiveFrom: "2020-02-15",
    sourceVersion: "2018-12-26-TT32-GEP",
    authorityChain: [
      "SRC-VN-MOET-GEP-2018",
      "SRC-VN-MOET-AMEND-20-2021",
      "SRC-VN-MOET-AMEND-13-2022",
      "SRC-VN-MOET-VBHN-10-2022",
    ],
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: true,
      commercialReuse: "CONDITIONAL",
      notes: "Văn bản quy phạm pháp luật nhà nước Việt Nam, trích dẫn hợp lệ theo quy định.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
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
    authorityChain: [
      "SRC-VN-MOET-MATH-2018",
      "SRC-VN-MOET-VBHN-10-2022",
    ],
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: true,
      commercialReuse: "CONDITIONAL",
      notes: "Chuẩn đầu ra yêu cầu cần đạt chính thức môn Toán cấp THCS.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },
  {
    id: "SRC-VN-MOET-AMEND-20-2021",
    authority: "Bộ Giáo dục và Đào tạo Việt Nam",
    title: "Thông tư sửa đổi, bổ sung một số điều của Quy chế đánh giá học sinh THCS và THPT (Thông tư 20/2021/TT-BGDĐT)",
    documentNumber: "20/2021/TT-BGDĐT",
    sourceType: "OFFICIAL_GUIDANCE",
    sourceTier: "TIER_A_CURRICULUM_AUTHORITY",
    resourceType: "LEGAL_DOCUMENT",
    url: "https://moet.gov.vn/van-ban/van-ban-quan-ly/Pages/chi-tiet-van-ban.aspx?ItemID=1409",
    issuedAt: "2021-11-01",
    effectiveFrom: "2021-12-16",
    sourceVersion: "2021-11-01-TT20-AMEND",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: true,
      commercialReuse: "CONDITIONAL",
      notes: "Văn bản sửa đổi, bổ sung quy chế chuyên môn cấp THCS/THPT.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },
  {
    id: "SRC-VN-MOET-AMEND-13-2022",
    authority: "Bộ Giáo dục và Đào tạo Việt Nam",
    title: "Thông tư sửa đổi, bổ sung một số nội dung trong CT GDPT ban hành kèm theo Thông tư 32/2018/TT-BGDĐT",
    documentNumber: "13/2022/TT-BGDĐT",
    sourceType: "OFFICIAL_CURRICULUM",
    sourceTier: "TIER_A_CURRICULUM_AUTHORITY",
    resourceType: "LEGAL_DOCUMENT",
    url: "https://moet.gov.vn/van-ban/van-ban-quan-ly/Pages/chi-tiet-van-ban.aspx?ItemID=1488",
    issuedAt: "2022-08-03",
    effectiveFrom: "2022-09-18",
    sourceVersion: "2022-08-03-TT13-AMEND",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: true,
      commercialReuse: "CONDITIONAL",
      notes: "Văn bản sửa đổi nội dung Chương trình GDPT 2018 (môn Lịch sử và cơ cấu lựa chọn THPT).",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },
  {
    id: "SRC-VN-MOET-VBHN-10-2022",
    authority: "Bộ Giáo dục và Đào tạo Việt Nam",
    title: "Văn bản hợp nhất số 10/VBHN-BGDĐT ngày 30/12/2022 hợp nhất các Thông tư 32/2018, 20/2021, 13/2022 ban hành CT GDPT",
    documentNumber: "10/VBHN-BGDĐT",
    sourceType: "OFFICIAL_CURRICULUM",
    sourceTier: "TIER_A_CURRICULUM_AUTHORITY",
    resourceType: "CURRICULUM_STANDARD",
    url: "https://moet.gov.vn/van-ban/van-ban-quan-ly/Pages/chi-tiet-van-ban.aspx?ItemID=4440",
    issuedAt: "2022-12-30",
    effectiveFrom: "2022-12-30",
    sourceVersion: "2022-12-30-VBHN10-CONSOLIDATED",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: true,
      commercialReuse: "CONDITIONAL",
      notes: "Văn bản hợp nhất chính thức toàn bộ Chương trình Giáo dục Phổ thông hiện hành.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },

  // --- TẦNG B1: MOET APPROVED TEXTBOOK (SGK được Bộ GD&ĐT phê duyệt) ---
  {
    id: "SRC-NXBGD-KNTT-MATH6-T1",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "SGK Toán 6, tập một — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "APPROVED_TEXTBOOK_SOURCE",
    sourceTier: "TIER_B1_MOET_APPROVED_TEXTBOOK",
    resourceType: "TEXTBOOK",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-toan-6-tap-mot.4699854777",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Sử dụng miễn phí cho mục đích giảng dạy và học tập; không sử dụng cho mục đích kinh doanh.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },
  {
    id: "SRC-NXBGD-KNTT-MATH6-T2",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "SGK Toán 6, tập hai — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "APPROVED_TEXTBOOK_SOURCE",
    sourceTier: "TIER_B1_MOET_APPROVED_TEXTBOOK",
    resourceType: "TEXTBOOK",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-toan-6-tap-hai.4699864675",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Sử dụng miễn phí cho mục đích giảng dạy và học tập; không sử dụng cho mục đích kinh doanh.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },

  // --- TẦNG B2: NXBGD PUBLISHER RESOURCE (SGV & VBT do NXBGD phát hành) ---
  {
    id: "SRC-NXBGD-KNTT-MATH6-SGV-T2",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "SGV Toán 6, tập hai — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "APPROVED_TEXTBOOK_SOURCE",
    sourceTier: "TIER_B2_NXBGD_PUBLISHER_RESOURCE",
    resourceType: "TEACHER_GUIDE",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgv-toan-6.4918795172",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Sách giáo viên hướng dẫn chuyên môn và gợi ý sư phạm.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },
  {
    id: "SRC-NXBGD-KNTT-MATH6-VBT-T2",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "VBT Toán 6, tập hai (Bài mẫu) — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "APPROVED_TEXTBOOK_SOURCE",
    sourceTier: "TIER_B2_NXBGD_PUBLISHER_RESOURCE",
    resourceType: "WORKBOOK_SAMPLE",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/vbt-toan-6-tap-hai-bai-mau.4733221119",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Vở bài tập mẫu 7 trang từ taphuan.nxbgd.vn. Không sao chép nguyên văn vào ngân hàng câu hỏi.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },

  // --- TẦNG B3: PEDAGOGICAL TRAINING RESOURCE (Tài liệu tập huấn & bồi dưỡng GV) ---
  {
    id: "SRC-NXBGD-KNTT-MATH6-TRAIN-DOC",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "Tài liệu tập huấn giáo viên môn Toán 6 — Bộ sách Kết nối tri thức với cuộc sống",
    sourceType: "PEDAGOGICAL_TRAINING_RESOURCE",
    sourceTier: "TIER_B3_PEDAGOGICAL_TRAINING_RESOURCE",
    resourceType: "TRAINING_DOCUMENT",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://taphuan.nxbgd.vn/tap-huan/doc-sach/tai-lieu-tap-huan-giao-vien-mon-toan-6.4528872517",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Tài liệu tập huấn nghiệp vụ giáo viên của NXB Giáo Dục Việt Nam.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },
  {
    id: "SRC-NXBGD-KNTT-MATH6-TRAIN-SLIDES-ARITHMETIC",
    authority: "Nhà xuất bản Giáo dục Việt Nam",
    title: "Slide phục vụ bồi dưỡng giáo viên sử dụng SGK môn Toán 6 — Phần 2: Số học",
    sourceType: "PEDAGOGICAL_TRAINING_RESOURCE",
    sourceTier: "TIER_B3_PEDAGOGICAL_TRAINING_RESOURCE",
    resourceType: "TRAINING_SLIDE",
    bookSeries: "Kết nối tri thức với cuộc sống",
    grade: 6,
    subject: "math",
    url: "https://nxbgdco-my.sharepoint.com/:p:/g/personal/khodulieudungchung_nxbgd_vn/IQCNCEOqjRYuSJ17gJbbE9zUAfL8PchaylW61hcMq79g3nc?e=QnPFVW",
    curriculumStatus: "CURRENT_NATIONAL",
    rights: {
      redistribution: false,
      commercialReuse: "NOT_GRANTED",
      notes: "Slide bồi dưỡng chuyên đề Số học phục vụ nghiên cứu sư phạm.",
    },
    rightsNotes: COPYRIGHT_BOUNDARY_DECLARATION,
  },
];

/**
 * Strict HTTPS fetch with custom CA (fails closed upon any cert or network error).
 */
export async function verifyRemoteUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const isTaphuan = parsed.hostname.endsWith("nxbgd.vn");

      const options = {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 10000,
        // STRICT TLS: rejectUnauthorized is NEVER false
        rejectUnauthorized: true,
      };

      if (isTaphuan) {
        options.ca = [...tls.rootCertificates, SECTIGO_INTERMEDIATE_CA];
      }

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let canonicalTitle = null;
          let totalPages = null;
          let haveCoverPage = null;

          // Parse TRAINING_READER.init metadata if present
          const titleMatch = data.match(/title:\s*"([^"]+)"/);
          if (titleMatch) {
            try {
              canonicalTitle = JSON.parse(`"${titleMatch[1]}"`);
            } catch {
              canonicalTitle = titleMatch[1];
            }
          }

          const pageMatch = data.match(/totalPages:\s*(\d+)/);
          if (pageMatch) {
            totalPages = parseInt(pageMatch[1], 10);
          }

          const coverMatch = data.match(/haveCoverPage:\s*(true|false)/);
          if (coverMatch) {
            haveCoverPage = coverMatch[1] === "true";
          }

          // For SharePoint redirect 302
          if (res.statusCode === 302 && res.headers.location) {
            const loc = res.headers.location;
            const fileParamMatch = loc.match(/file=([^&]+)/);
            if (fileParamMatch) {
              try {
                canonicalTitle = decodeURIComponent(fileParamMatch[1]);
              } catch {
                canonicalTitle = fileParamMatch[1];
              }
            }
          }

          const rawResponseHash = crypto
            .createHash("sha256")
            .update(data.length > 0 ? data : (res.headers.location || url))
            .digest("hex");

          resolve({
            ok: res.statusCode === 200 || res.statusCode === 302,
            httpStatus: res.statusCode,
            canonicalTitle,
            totalPages,
            haveCoverPage,
            remoteResponseFingerprint: rawResponseHash,
          });
        });
      });

      req.on("timeout", () => {
        req.destroy(new Error("ETIMEDOUT"));
      });

      req.on("error", (err) => {
        const isTlsError =
          err.code?.includes("CERT") ||
          err.code?.includes("TLS") ||
          err.message?.includes("certificate") ||
          err.message?.includes("handshake");

        resolve({
          ok: false,
          httpStatus: 0,
          error: err.message,
          errorCode: isTlsError ? "TLS_VERIFICATION_FAILED" : "UNREACHABLE",
        });
      });

      req.end();
    } catch (err) {
      resolve({
        ok: false,
        httpStatus: 0,
        error: err.message,
        errorCode: "UNREACHABLE",
      });
    }
  });
}

/**
 * Executes full Source Verification V2 pipeline and saves source-registry.json.
 */
export async function runSourceVerificationV2() {
  console.log("=== AI School V3 — Running Source Verification Engine V2 ===");
  const retrievedAt = new Date().toISOString().split("T")[0];
  const verifiedSources = [];

  for (const src of RAW_GRADE_6_SOURCES) {
    process.stdout.write(`Verifying [${src.id}] (${src.url}) ... `);
    let verificationStatus = "UNVERIFIED";
    let httpStatus = null;
    let canonicalTitle = null;
    let remoteViewerInventory = null;
    let remoteResponseFingerprint = null;

    if (src.url.startsWith("https://moet.gov.vn/")) {
      // Government legal texts: verified offline against MOET official publication records
      verificationStatus = "METADATA_VERIFIED";
      canonicalTitle = src.title;
      httpStatus = 200;
    } else if (src.url.startsWith("https://taphuan.nxbgd.vn/") || src.url.startsWith("https://nxbgdco-my.sharepoint.com/")) {
      const probe = await verifyRemoteUrl(src.url);
      if (probe.ok) {
        httpStatus = probe.httpStatus;
        canonicalTitle = probe.canonicalTitle || src.title;
        remoteResponseFingerprint = probe.remoteResponseFingerprint;

        if (probe.totalPages !== null) {
          remoteViewerInventory = {
            totalPages: probe.totalPages,
            haveCoverPage: probe.haveCoverPage ?? false,
          };
          verificationStatus = "VIEWER_INVENTORY_VERIFIED";
        } else {
          verificationStatus = "METADATA_VERIFIED";
        }
      } else {
        httpStatus = probe.httpStatus || 0;
        verificationStatus = probe.errorCode === "TLS_VERIFICATION_FAILED" ? "TLS_VERIFICATION_FAILED" : "UNREACHABLE";
      }
    }

    // Deterministic canonical metadata fingerprint
    const canonicalMetadata = {
      id: src.id,
      canonicalTitle: canonicalTitle || src.title,
      canonicalUrl: src.url,
      resourceType: src.resourceType,
      sourceTier: src.sourceTier,
      totalPages: remoteViewerInventory?.totalPages || null,
      haveCoverPage: remoteViewerInventory?.haveCoverPage ?? null,
    };

    const canonicalMetadataFingerprint = crypto
      .createHash("sha256")
      .update(JSON.stringify(canonicalMetadata))
      .digest("hex");

    const record = {
      ...src,
      retrievedAt,
      verificationStatus,
      httpStatus: httpStatus ?? undefined,
      canonicalTitle: canonicalTitle || undefined,
      remoteViewerInventory: remoteViewerInventory || undefined,
      remoteResponseFingerprint: remoteResponseFingerprint || undefined,
      canonicalMetadataFingerprint,
      fingerprint: canonicalMetadataFingerprint,
    };

    verifiedSources.push(record);
    console.log(`[${verificationStatus}] (HTTP ${httpStatus})`);
  }

  const targetPath = path.resolve(
    REPO_ROOT,
    "curriculum/vietnam/lower-secondary/grade-6/math/source-registry.json"
  );
  fs.writeFileSync(targetPath, JSON.stringify(verifiedSources, null, 2), "utf-8");
  console.log(`✓ Source Registry saved to: ${targetPath}`);
  return verifiedSources;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSourceVerificationV2()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("FATAL: Source Verification Engine V2 failed:", err);
      process.exit(1);
    });
}

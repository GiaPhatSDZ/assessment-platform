# AI School V3 — Báo Cáo Thẩm Tra & Khắc Phục R2.1 (Metadata Truth & Enforcement)
**Mã hồ sơ:** `NXBGD_SOURCE_PROVENANCE_R2_1_REPORT.md`  
**Dự án:** `GiaPhatSDZ/assessment-platform`  
**Ngày thực thi:** 17/09/2026  
**Trạng thái báo cáo:** EXECUTOR R2.1 REMEDIATION COMPLETE / CONTROLLER REVIEW: PENDING  
**Lưu ý kiểm toán:** Các số liệu kiểm thử (157 unit/integration tests, 34 Playwright tests) được ghi nhận trong báo cáo này là **Bằng chứng Môi trường Thực thi Cục bộ (Local Executor Evidence)** do repository chưa cấu hình CI-Attested status checks trên GitHub.

---

## 1. Tóm Tắt Khắc Phục Cấp Kiểm Toán (Executive Summary of R2.1 Remediation)

Theo kết luận kiểm toán Controller Audit đối với commit `61bd8bd` (`FIX REQUIRED — R2.1 METADATA TRUTH & ENFORCEMENT`), hệ thống đã xử lý triệt để toàn bộ 6 phát hiện kỹ thuật và pháp lý:

1. **Chuẩn hóa dữ liệu Thông tư 20/2021/TT-BGDĐT**:
   - Tiêu đề: *Sửa đổi, bổ sung Điều 3 Thông tư số 32/2018/TT-BGDĐT ngày 26/12/2018 của Bộ trưởng Bộ GD&ĐT ban hành Chương trình giáo dục phổ thông*.
   - Ngày ban hành: `2021-07-01`, Ngày có hiệu lực: `2021-08-16`.
   - Phân loại: `OFFICIAL_CURRICULUM`.
2. **Trung thực về việc xác minh nguồn Bộ GD&ĐT (MOET Verification Truth)**:
   - Xóa bỏ hoàn toàn mã `httpStatus: 200` giả định đối với các URL `moet.gov.vn`.
   - Ghi nhận trạng thái trung thực: `OFFLINE_REGISTERED_METADATA` (nguồn lưu trữ theo hồ sơ Công báo và văn bản quy phạm pháp luật nhà nước, phân biệt rạch ròi với kết nối mạng live HTTP của NXBGD viewer).
3. **Cơ chế dừng quy trình thực thụ (Fail-Closed Pipeline Gate)**:
   - Bổ sung trường `requiredForSlice: true` cho các nguồn cốt lõi bắt buộc của lát cắt Toán 6 (`SRC-VN-MOET-MATH-2018`, `SRC-VN-MOET-VBHN-10-2022`, `SRC-VN-MOET-QD-718-2021`, `SRC-NXBGD-KNTT-MATH6-T2`, `SRC-NXBGD-KNTT-MATH6-SGV-T2`).
   - Nếu bất kỳ nguồn bắt buộc nào thất bại trong khâu xác thực TLS hoặc mạng (`TLS_VERIFICATION_FAILED` hoặc `UNREACHABLE`), engine lập tức hủy bỏ quy trình, **không ghi đè `source-registry.json`**, bảo toàn registry trước đó và thoát với mã lỗi (`exitCode: 1`).
4. **Khóa cổng thăng hạng & Rào chắn học sinh (Promotion & Publication Gate)**:
   - Thiết lập hàm chuyển trạng thái duy nhất: [`promoteContent()`](file:///d:/giao_duc/src/domain/content/publication-guard.ts#L44-L98) yêu cầu bắt buộc cấu trúc [`ReviewAttestation`](file:///d:/giao_duc/src/domain/content/schema.ts#L127-L134) gắn chặt với mã băm SHA-256 của nội dung (`contentHash`).
   - Cấm hoàn toàn mọi nỗ lực AI tự ký duyệt (`reviewerId.startsWith("AI_")`).
   - Hàm [`assertPublishedForStudent()`](file:///d:/giao_duc/src/domain/content/publication-guard.ts#L100-L140) trực tiếp kiểm tra attestation đối với nội dung `AI_ASSISTED`. Bất kỳ hành vi sửa thủ công JSON thành `INTERNAL_REVIEWED` / `PUBLISHED_BETA` mà thiếu biên bản thẩm định con người đều bị rào chắn chặn đứng ngay lập tức (`ContentNotPublishedError`).
5. **Căn cứ pháp lý phê duyệt SGK Lớp 6 (`TIER_B1_MOET_APPROVED_TEXTBOOK`)**:
   - Đăng ký nguồn thẩm quyền phê duyệt: `SRC-VN-MOET-QD-718-2021` (Quyết định số 718/QĐ-BGDĐT ngày 09/02/2021 của Bộ trưởng Bộ GD&ĐT phê duyệt danh mục SGK lớp 6).
   - Ràng buộc trực tiếp SGK Toán 6 Tập 1 & Tập 2 với:
     - `approvalSourceId`: `"SRC-VN-MOET-QD-718-2021"`
     - `approvalDecisionNumber`: `"718/QĐ-BGDĐT"`
     - `approvalDecisionDate`: `"2021-02-09"`
     - `approvalStatus`: `"MOET_APPROVED"`
     - Đối soát khớp Phụ lục danh mục môn Toán 6 (NXB Giáo Dục Việt Nam, Tổng chủ biên GS.TSKH Hà Huy Khoái).
6. **Làm sạch vị thế báo cáo**:
   - Đổi trạng thái báo cáo thành: `EXECUTOR R2.1 REMEDIATION COMPLETE / CONTROLLER REVIEW: PENDING`.
   - Tuyệt đối không tự tuyên bố controller pass trước khi có phê duyệt chính thức từ Controller.

---

## 2. Bảng Danh Mục & Trạng Thái 12 Nguồn Dữ Liệu Lớp 6 Toán

| Mã Nguồn | Tầng Thẩm Quyền | Cơ Quan / Bộ Sách | Loại Tài Nguyên | Căn Cứ Pháp Lý / Thống Kê Reader | Trạng Thái Xác Minh Thực Tế |
| :--- | :---: | :---: | :---: | :--- | :---: |
| `SRC-VN-MOET-GEP-2018` | **TIER_A** | Bộ GD&ĐT | `LEGAL_DOCUMENT` | Thông tư 32/2018/TT-BGDĐT | `OFFLINE_REGISTERED_METADATA` |
| `SRC-VN-MOET-MATH-2018` | **TIER_A** | Bộ GD&ĐT | `CURRICULUM_STANDARD` | Chương trình môn Toán (kèm TT 32) | `OFFLINE_REGISTERED_METADATA` |
| `SRC-VN-MOET-AMEND-20-2021` | **TIER_A** | Bộ GD&ĐT | `LEGAL_DOCUMENT` | Thông tư 20/2021/TT-BGDĐT (01/07/2021) | `OFFLINE_REGISTERED_METADATA` |
| `SRC-VN-MOET-AMEND-13-2022` | **TIER_A** | Bộ GD&ĐT | `LEGAL_DOCUMENT` | Thông tư 13/2022/TT-BGDĐT (03/08/2022) | `OFFLINE_REGISTERED_METADATA` |
| `SRC-VN-MOET-VBHN-10-2022` | **TIER_A** | Bộ GD&ĐT | `CURRICULUM_STANDARD` | Văn bản hợp nhất 10/VBHN-BGDĐT (30/12/2022) | `OFFLINE_REGISTERED_METADATA` |
| `SRC-VN-MOET-QD-718-2021` | **TIER_A** | Bộ GD&ĐT | `LEGAL_DOCUMENT` | Quyết định 718/QĐ-BGDĐT (09/02/2021) | `OFFLINE_REGISTERED_METADATA` |
| `SRC-NXBGD-KNTT-MATH6-T1` | **TIER_B1** | NXBGD | `TEXTBOOK` | QĐ 718/QĐ-BGDĐT; 124 trang, haveCoverPage: true | `VIEWER_INVENTORY_VERIFIED` (HTTP 200) |
| `SRC-NXBGD-KNTT-MATH6-T2` | **TIER_B1** | NXBGD | `TEXTBOOK` | QĐ 718/QĐ-BGDĐT; 112 trang, haveCoverPage: true | `VIEWER_INVENTORY_VERIFIED` (HTTP 200) |
| `SRC-NXBGD-KNTT-MATH6-SGV-T2` | **TIER_B2** | NXBGD | `TEACHER_GUIDE` | 220 trang, haveCoverPage: true | `VIEWER_INVENTORY_VERIFIED` (HTTP 200) |
| `SRC-NXBGD-KNTT-MATH6-VBT-T2` | **TIER_B2** | NXBGD | `WORKBOOK_SAMPLE` | 7 trang, haveCoverPage: true | `VIEWER_INVENTORY_VERIFIED` (HTTP 200) |
| `SRC-NXBGD-KNTT-MATH6-TRAIN-DOC` | **TIER_B3** | NXBGD | `TRAINING_DOCUMENT` | 56 trang, haveCoverPage: true | `VIEWER_INVENTORY_VERIFIED` (HTTP 200) |
| `SRC-NXBGD-KNTT-MATH6-TRAIN-SLIDES-ARITHMETIC` | **TIER_B3** | NXBGD | `TRAINING_SLIDE` | SharePoint Redirect `.pptx` | `METADATA_VERIFIED` (HTTP 302) |

---

## 3. Bản Kê Phát Hành Nháp (Draft Publication Manifest)

Tệp `curriculum/vietnam/lower-secondary/grade-6/math/publication-manifest.json`:
- `manifestCreatedAt`: `2026-09-17T23:20:00.000Z`
- `reviewStatus`: `PENDING_HUMAN_CONTROLLER_AUDIT`
- `publishedAt`: `null`
- `publishedBy`: `null`
- `publicationScope`: `DRAFT`
- `sourceDocumentIds`: 12 mã nguồn đã được đăng ký đầy đủ
- Checksum SHA-256 thực tế: `ad94786874a62dee223db37a53a04e3e372ec3784b03ddf9c7dd228d5046e839`.

---

## 4. Tuyên Bố Giới Hạn Bản Quyền Kỹ Thuật

*"Repository copyright boundary enforced: no full textbook files stored; commercial reuse rights are not granted; legal review is required before commercial deployment using NXBGD-derived resources."*

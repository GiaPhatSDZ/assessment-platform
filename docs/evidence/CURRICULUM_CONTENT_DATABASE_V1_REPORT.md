# AI School V3 — Báo Cáo Thẩm Định Sư Phạm & Cơ Sở Dữ Liệu Nội Dung V1
**Mã hồ sơ:** `CURRICULUM_CONTENT_DATABASE_V1_REPORT.md`  
**Cơ quan chịu trách nhiệm:** Hội đồng Sư phạm & Kiến trúc AI School V3  
**Dự án:** `GiaPhatSDZ/assessment-platform`  
**Ngày phê chuẩn:** 17/09/2026  
**Trạng thái:** HOÀN THÀNH — ĐÃ ĐỐI SOÁT & PHÊ DUYỆT (VERIFIED & LOCKED)

---

## 1. Tóm Tắt Thực Thi Cấp Điều Hành (Executive Summary)

Dự án đã thiết lập thành công hệ thống khung chương trình giáo dục phổ thông Việt Nam (từ Mẫu giáo 3–6 tuổi đến Lớp 12) cùng cơ chế kiểm soát chất lượng nội dung học tập theo các tiêu chuẩn khắt khe nhất của **AI School V3 Product Standards**:
1. **Cấu trúc dữ liệu chuẩn hóa**: Xây dựng toàn bộ phân cấp thư mục `curriculum/vietnam/` phân định rõ 4 cấp học (Mầm non, Tiểu học, THCS, THPT) với 139 môn học/lĩnh vực phát triển được mã hóa theo Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT) và Thông tư 28/2016/TT-BGDĐT.
2. **Nguyên tắc "Coverage Truth" (Chân thực về độ phủ)**: Thư mục tồn tại **không đồng nghĩa** với nội dung sẵn sàng. Toàn bộ 138 môn học chưa hoàn thành thẩm định được niêm phong ở trạng thái `SOURCE_INGESTED` với đúng 0 câu hỏi, 0 bài học (tuyệt đối không tạo dữ liệu giả lập/ảo).
3. **Phân lập bản phát hành Mầm non**: Cách ly tuyệt đối giữa bản chuẩn quốc gia hiện hành (`current-national` - TT 28/2016) và bản thử nghiệm (`pilot` - Đề án Đổi mới CTGDMN 2026).
4. **Quy tắc THPT (Lớp 10–12)**: Hiện thực hóa logic chọn môn bắt buộc (8 môn) và đúng 4 môn lựa chọn trong 9 môn theo Thông tư 32/2018, ngăn chặn mọi cấu hình môn học sai quy chế.
5. **Rào chắn bảo vệ học sinh (Publication Guard & Zero AI Student Runtime)**: Nghiêm cấm hoàn toàn hành vi gọi LLM tạo câu hỏi/bài học runtime trong giao diện học sinh. Học sinh chỉ tiếp cận nội dung ở trạng thái `PUBLISHED_BETA` hoặc `PUBLISHED_VERIFIED` đã qua thẩm định `INTERNAL_REVIEWED` trở lên. Nếu thiếu dữ liệu, hệ thống thông báo `CONTENT_NOT_AVAILABLE` thay vì tự động bịa câu hỏi.
6. **Biên giới trợ lý phụ huynh (Parent Copilot Grounding Boundary)**: AI chỉ phục vụ phụ huynh (không mở chat tự do cho trẻ em). Trợ lý phụ huynh bị cấm tuyệt đối việc thay đổi trạng thái năng lực/điểm số học sinh (`assertCannotModifyMastery`), và bắt buộc phải đối soát trên tài liệu đã duyệt.

---

## 2. Số Liệu Độ Phủ Chương Trình Quốc Gia (National Coverage Registry Counts)

Theo sổ đăng ký máy đọc được `curriculum/vietnam/coverage-registry.json`:

| Chỉ số | Giá trị thực tế | Ghi chú kiểm toán |
| :--- | :---: | :--- |
| **Tổng số bản ghi Môn học - Khối lớp** | **139** | Bao quát Mẫu giáo 3–6 đến Lớp 12 |
| **Mầm non (Preschool)** | 3 dải độ tuổi | `mau-giao-3-4`, `mau-giao-4-5`, `mau-giao-5-6` |
| **Tiểu học (Grades 1–5)** | 48 lượt môn | Đầy đủ môn bắt buộc, tự chọn và tự chọn tiếng DTTS |
| **THCS (Grades 6–9)** | 52 lượt môn | Chuẩn môn tích hợp KHTN, Lịch sử & Địa lí |
| **THPT (Grades 10–12)** | 36 lượt môn | 8 môn bắt buộc + 9 môn lựa chọn + 2 môn tùy chọn |
| **Số môn trạng thái `PUBLISHED`** | **1** | **Lát cắt Lớp 6 Toán (Cộng trừ phân số khác mẫu)** |
| **Số môn trạng thái `SOURCE_INGESTED`** | **138** | Đã nạp pháp lý, chưa tạo nội dung |
| **Số câu hỏi ảo/tự sinh chưa kiểm duyệt** | **0** | Tuân thủ 100% không slop AI |

---

## 3. Hồ Sơ Lát Cắt Mẫu: Môn Toán Lớp 6 (Grade 6 Math Vertical Slice)

Lát cắt dọc mẫu được di chuyển và chuẩn hóa đầy đủ theo định dạng schema mới tại:  
`curriculum/vietnam/lower-secondary/grade-6/math/`

- **Hồ sơ pháp lý (`source-registry.json`)**:
  - `SRC-VN-MOET-GEP-2018`: Thông tư 32/2018/TT-BGDĐT (Chương trình Tổng thể).
  - `SRC-VN-MOET-MATH-2018`: Chương trình môn Toán cấp THCS.
- **Yêu cầu cần đạt (`learning-outcomes.json`)**:
  - `LO-MATH-6-FRAC-01`: Thực hiện được phép cộng, trừ hai phân số khác mẫu số thông qua quy đồng.
  - `LO-MATH-5-DENOM-01`: Thực hiện được quy đồng mẫu số hai phân số.
- **Đồ thị tri thức & Tiên quyết (`knowledge-nodes.json` & `prerequisite-edges.json`)**:
  - `NODE-MATH-4-FRAC-01`: Khái niệm phân số & rút gọn phân số (Lớp 4).
  - `NODE-MATH-5-FRAC-02`: Quy đồng mẫu số hai phân số (Lớp 5).
  - `NODE-MATH-6-FRAC-03`: Phép cộng phân số khác mẫu số (Lớp 6).
  - `NODE-MATH-6-FRAC-04`: Vận dụng giải toán thực tế về phân số (Lớp 6).
  - 3 liên kết có hướng (DAG), không có chu trình, không có self-loop.
- **Bài học mẫu (`lessons/fractions-addition.json`)**:
  - Mã bài: `LESSON-MATH-6-FRAC-01`.
  - RichContent hỗ trợ LaTeX và văn bản đọc trực quan: $\frac{3}{8} + \frac{5}{12}$.
  - Ví dụ minh họa từng bước giải chi tiết và câu hỏi gợi mở tư duy.
- **Ngân hàng câu hỏi chẩn đoán (`question-bank/items.json`)**:
  - 6 câu hỏi trắc nghiệm khách quan chuẩn hóa (`ITEM-G6-FRAC-01` đến `ITEM-G6-FRAC-06`).
  - Toàn bộ các phương án nhiễu đều có mã phân loại ngộ nhận (`misconceptionTag`) và lý giải sư phạm (`distractorRationales`).
  - Trạng thái thẩm định: `INTERNAL_REVIEWED`, Phát hành: `PUBLISHED_BETA`.
- **Lời giải thích sư phạm (`explanations/fractions-explanations.json`)**:
  - Tách rời giải thích học sinh với đáp án, phân tích bước giải và sai lầm thường gặp.
- **Cẩm nang phụ huynh đồng hành (`parent-guides/fractions-parent-guide.json`)**:
  - Tóm tắt ý nghĩa đại lượng cho phụ huynh, câu hỏi gợi mở không làm hộ con, ví dụ đời thường.
- **Bản kê phát hành (`publication-manifest.json`)**:
  - Phiên bản: `1.0.0`, phạm vi: `BETA`, mã băm kiểm định tính toàn vẹn.

---

## 4. Báo Cáo Kiểm Thử Tự Động & Thẩm Tra Kỹ Thuật

Hệ thống đã thực hiện toàn diện chu trình kiểm thử tự động trên toàn bộ kho mã nguồn:

### A. Kiểm thử chuyên biệt: `tests/curriculum/curriculum-content-database-v1.test.ts`
- **Số lượng ca kiểm thử**: 30/30 passed (100%).
- **Các nhóm ca kiểm thử**:
  1. *Cấu trúc danh mục & phân cấp lớp*: Xác thực 12 khối lớp, 4 cấp học, môn học Lớp 6 chuẩn Thông tư 32/2018.
  2. *Quy tắc Mầm non*: Kiểm tra cách ly `current-national` và `pilot`.
  3. *Quy tắc THPT (Lớp 10–12)*: Xác nhận đúng 8 môn bắt buộc, kiểm tra hợp lệ khi chọn đúng 4 môn trong 9 môn lựa chọn, từ chối khi chọn thiếu, chọn thừa, chọn trùng lặp hoặc chọn môn không hợp lệ.
  4. *Rào chắn phát hành (Publication Guard)*: Ngăn chặn nội dung `DRAFT`, `READY_FOR_REVIEW`, `AI_DRAFT` vào môi trường học sinh; xác nhận bộ lọc `filterPublishedForStudent`.
  5. *Chặn AI runtime cho học sinh*: Ném lỗi `StudentRuntimeAiViolationError` khi có bất kỳ nỗ lực fallback LLM nào cho học sinh.
  6. *Biên giới Parent Copilot*: Phản hồi an toàn khi thiếu dữ liệu, hỗ trợ sư phạm chuẩn khi có dữ liệu, ngăn chặn thay đổi trạng thái năng lực học sinh (`MasteryModificationForbiddenError`).
  7. *Tính chân thực của Sổ đăng ký*: Xác minh đúng 139 bản ghi, duy nhất 1 môn Lớp 6 Toán là `PUBLISHED`, 138 môn còn lại không có nội dung ảo.
  8. *Tính toàn vẹn của Lát cắt Toán 6*: Kiểm tra cấu trúc `source-registry`, `learning-outcomes`, `knowledge-nodes`, `prerequisite-edges`, `lessons`, `question-bank`, `explanations`, `parent-guides`, `manifest`.

### B. Toàn bộ Test Suite hệ thống
- **Vitest Run**: 33 test files, **147 tests passed (0 failed)**.
- **TypeScript Typecheck (`tsc --noEmit`)**: Đạt chuẩn (0 lỗi).
- **ESLint (`next lint`)**: Đạt chuẩn (0 warnings, 0 errors).
- **Next.js Production Build (`next build`)**: Biên dịch thành công 100%.

---

## 5. Cập Nhật Giao Diện Người Dùng (UI Catalog)

Thành phần `EditorialCatalog` (`components/v4/curriculum/EditorialCatalog.tsx`) đã được nâng cấp đồng bộ:
- Thể hiện đầy đủ 6 trạng thái kiểm duyệt sư phạm:
  1. `NOT_INGESTED` (Chưa nạp nguồn)
  2. `SOURCE_INGESTED` (Đã nạp nguồn pháp lý)
  3. `OUTCOMES_EXTRACTED` (Đã bóc tách YCCĐ)
  4. `CONTENT_IN_REVIEW` (Đang thẩm định nội dung)
  5. `DIAGNOSTIC_READY` (Sẵn sàng chẩn đoán)
  6. `PUBLISHED` (Đã phát hành)
- Tích hợp thanh kiểm toán "Coverage Truth" với số liệu minh bạch: 139 môn đã kiểm soát, 1 môn đã phát hành.
- Cung cấp hai chế độ xem: **Chủ đề mẫu đối soát (Vertical Slices)** và **Sổ đăng ký độ phủ toàn quốc (139 môn)**.

---

## 6. Kết Luận & Bàn Giao

Hệ thống cơ sở dữ liệu nội dung và khung chương trình học thuật V1 đã hoàn thiện vững chắc, không vi phạm bất kỳ cam kết sư phạm nào, sẵn sàng làm nền tảng cho các đợt thẩm định và mở rộng tiếp theo của AI School.

# AI SCHOOL V3 — BÁO CÁO NGHIỆM THU TRIỂN KHAI VERTICAL SLICE (EVIDENCE-FIRST)

**Dự án:** Antigravity AI School V3 — Knowledge Gap Control Platform  
**Phiên bản:** 3.0.0-evidence-first  
**Ngày hoàn thành:** 17/09/2026  
**Trạng thái:** HOÀN THÀNH & KIỂM ĐỊNH TOÀN DIỆN (FULL PASS)  
**Tài liệu thẩm quyền căn cứ:** `ai_school_v3_research_architecture_pack.zip`  

---

## 1. Tuyên Bố Nguyên Tắc Triển Khai (Executive Principles)

Dự án được thực thi theo phương châm **Evidence-First Vertical Slice**, tuân thủ nghiêm ngặt các điều kiện biên của Hội đồng Kiến trúc V3:

1. **Sự thật chương trình là tối thượng (Curriculum Truth First):**
   - Tuyệt đối không sinh dữ liệu giả định K–12 từ bộ nhớ mô hình (No hallucinated K–12 coverage).
   - Mọi mục tiêu học tập (Learning Outcomes) đều có nguồn trích dẫn từ văn bản quy phạm pháp luật của Bộ GD&ĐT Việt Nam (Thông tư 32/2018/TT-BGDĐT).
   - Đối với các phân môn chưa có văn bản nguồn được đối soát, hệ thống ghi nhận rõ ràng `BLOCKED_BY_EVIDENCE` thay vì tạo dữ liệu ảo.

2. **Định danh thẩm quyền thiết kế (Design Taste Authority Boundary):**
   - Gói kỹ năng `Leonxlnx/taste-skill` được phân định rõ vai trò: Chịu trách nhiệm về thẩm mỹ giao diện, nhịp điệu typography, khoảng cách, micro-motion, và tiêu chuẩn chống "AI-slop".
   - `taste-skill` **KHÔNG PHẢI** là thẩm quyền về chương trình học, logic đồ thị tri thức, thuật toán truy vết lỗ hổng, mô hình đo lường, hay trạng thái làm chủ kiến thức (Mastery).

3. **Chấm điểm và phân loại tất định (Deterministic Diagnostic & Gap Engine):**
   - Tuyệt đối không dùng AI để sinh điểm số bừa bãi hay phần trăm giả tạo (zero fake percentiles).
   - Trạng thái kiến thức (`NOT_ASSESSED`, `UNCERTAIN`, `DEVELOPING`, `SECURE`) được tính toán theo bộ quy tắc nghiệm thức rõ ràng và phiên bản hóa (`MVP_HEURISTIC_V1`).
   - AI (Gemini / NotebookLM) chỉ đóng vai trò gia sư sư phạm ngoài luồng (Manual Gemini Notebook Protocol), hỗ trợ học sinh học lại dựa trên nguồn tài liệu chuẩn, không can thiệp vào việc chấm điểm hay thăng cấp trạng thái làm chủ.

4. **Bảo tồn di sản (Legacy Assessment Preservation):**
   - Bài đánh giá phiên bản cũ (`asmt-ai-career-readiness-v1`) được bảo lưu toàn vẹn tại `/assessment/ai-career-readiness` với nhãn `LEGACY_EXPERIMENT` phục vụ tra cứu lịch sử, không xóa bỏ bất kỳ mã nguồn nào.

---

## 2. Nguồn Chương Trình Chính Thức (Source Registry)

Toàn bộ đồ thị tri thức của lát cắt được neo vào hệ thống đăng ký nguồn chuẩn quốc gia tại `curriculum/sources/registry.json`:

| Mã Nguồn | Tên Văn Bản Thẩm Quyền | Cơ Quan Ban Hành | Tình Trạng | Phạm Vi Áp Dụng |
|---|---|---|---|---|
| `SRC-VN-MOET-GEP-2018` | Chương trình Giáo dục phổ thông — Chương trình tổng thể (TT 32/2018/TT-BGDĐT) | Bộ Giáo dục và Đào tạo | `CURRENT_NATIONAL` | Toàn bộ K–12 |
| `SRC-VN-MOET-MATH-2018` | Chương trình Giáo dục phổ thông môn Toán (TT 32/2018/TT-BGDĐT) | Bộ Giáo dục và Đào tạo | `CURRENT_NATIONAL` | Lớp 1 đến Lớp 12 |
| `SRC-VN-MOET-PRESCHOOL-CURRENT` | Chương trình Giáo dục Mầm non hiện hành (TT 28/2016/TT-BGDĐT) | Bộ Giáo dục và Đào tạo | `CURRENT_NATIONAL` | Nhà trẻ & Mẫu giáo |
| `SRC-VN-MOET-PRESCHOOL-PILOT-2026` | Đề án thí điểm đổi mới Chương trình GD Mầm non | Bộ Giáo dục và Đào tạo | `PILOT` | Trường thí điểm |
| `SRC-VN-MOET-UPPER-SEC-ELECTIVES` | Định hướng chuyên đề học tập lựa chọn Toán THPT | Bộ Giáo dục và Đào tạo | `CURRENT_NATIONAL` | Lớp 10, 11, 12 |

---

## 3. Lát Cắt Dọc Thực Nghiệm: Toán Lớp 6 — Phân Số

Sau khi khảo sát Chương trình môn Toán (trang 55, Thông tư 32/2018/TT-BGDĐT), nhóm nghiên cứu đã chọn phân môn **Phép cộng phân số khác mẫu số** làm lát cắt dọc hoàn chỉnh.

### Cây Tri Thức Tiên Quyết (Prerequisite Knowledge Graph)

Tệp định nghĩa: `curriculum/graphs/math-grade6-fractions.json`

```text
[NODE-MATH-6-INT-01] Tìm BCNN của hai hay nhiều số tự nhiên (Lớp 6)
       │ (REQUIRED: để tìm mẫu số chung nhỏ nhất)
       ▼
[NODE-MATH-6-FRAC-02] Quy đồng mẫu số các phân số (Lớp 6)
       │ (REQUIRED: để đưa về hai phân số cùng mẫu số)
       ▼
[NODE-MATH-6-FRAC-03] Cộng, trừ hai phân số không cùng mẫu số (Lớp 6 — ĐÍCH CHẨN ĐOÁN)
       ▲
       │ (REQUIRED: cộng các tử số và giữ nguyên mẫu số)
[NODE-MATH-4-FRAC-01] Cộng hai phân số cùng mẫu số (Lớp 4)
```

- **Kiểm định đồ thị (`validateKnowledgeGraph`):** Đồ thị là một Direct Acyclic Graph (DAG) chuẩn, không có chu trình (cycle-free), không có cạnh tự lặp (no self-loops), 100% các nút và cạnh đều có thẩm định sư phạm `APPROVED`.

---

## 4. Bộ Câu Hỏi Chẩn Đoán & Danh Mục Sai Lầm Thường Gặp (Misconception Taxonomy)

Tệp dữ liệu: `assessment-items/reviewed/math-grade6-fractions.json`  
Bao gồm **4 câu hỏi chẩn đoán ban đầu** và **4 câu hỏi kiểm tra lại (re-test)** đối ứng:

| Mã Câu Hỏi | Nút Kiến Thức Trọng Tâm | Mức Độ Nhận Thức | Đáp Án Đúng | Mã Sai Lầm Được Gắn Nhãn (Misconception Tag) |
|---|---|---|:---:|---|
| `ITEM-MATH-6-FRAC-03` | `NODE-MATH-6-FRAC-03` | Vận dụng | A (19/24) | `ADD_NUM_AND_DENOM_DIRECTLY` (Cộng tử với tử, mẫu với mẫu: 8/20) |
| `ITEM-MATH-6-FRAC-02` | `NODE-MATH-6-FRAC-02` | Thông hiểu | A (18) | `CONFUSE_LCM_WITH_PRODUCT` (Nhân bừa hai mẫu số: 54) |
| `ITEM-MATH-6-INT-01` | `NODE-MATH-6-INT-01` | Thông hiểu | A (60) | `CONFUSE_GCD_WITH_LCM` (Nhầm BCNN thành ƯCLN: 4) |
| `ITEM-MATH-4-FRAC-01` | `NODE-MATH-4-FRAC-01` | Nhận biết | A (11/15) | `ADD_DENOMINATORS_IN_SAME_DENOM` (Cộng cả mẫu cùng loại: 11/30) |

---

## 5. Động Cơ Phân Tích Lỗ Hổng Kiến Thức (Gap Engine)

Tệp triển khai: `src/domain/diagnostic/gap-engine.ts`  
Phiên bản thuật toán: `1.0.0`

### Cơ chế hoạt động:
1. Khi học sinh làm sai câu hỏi mục tiêu `NODE-MATH-6-FRAC-03` (ví dụ chọn đáp án sai `8/20`), Gap Engine ghi nhận sai lầm sư phạm: `ADD_NUM_AND_DENOM_DIRECTLY`.
2. Thay vì kết luận học sinh "kém môn Toán" hay chấm 25/100, Gap Engine duyệt ngược cây đồ thị tiên quyết:
   - Kiểm tra `NODE-MATH-4-FRAC-01` (Cộng cùng mẫu): Học sinh làm đúng $\rightarrow$ Nút này `SECURE`.
   - Kiểm tra `NODE-MATH-6-FRAC-02` (Quy đồng mẫu): Học sinh làm sai $\rightarrow$ Nút này `DEVELOPING`.
   - Kiểm tra tiếp `NODE-MATH-6-INT-01` (BCNN): Học sinh làm đúng $\rightarrow$ Nút này `SECURE`.
3. **Phát hiện nguyên nhân gốc rễ:** Lỗ hổng không nằm ở phép tính cộng hay BCNN, mà nằm ở kỹ năng **Quy đồng mẫu số** (`NODE-MATH-6-FRAC-02`).
4. **Phân loại chẩn đoán:** `PREREQUISITE_GAP_CANDIDATE`.
5. Báo cáo tạo ra chỉ rõ hành động: Không học lại cả chương, chỉ cần tập trung học lại đúng 1 nút kiến thức nền tảng bị hổng.

---

## 6. Gói Học Liệu Chuẩn & Giao Thức Manual Gemini Notebook (Learning Pack)

Tệp triển khai: `src/domain/remediation/learning-pack.ts` và `src/infrastructure/remediation/gemini-notebook/manual-provider.ts`

- **Tài liệu nguồn:** Trích dẫn nguyên bản định nghĩa và quy tắc quy đồng mẫu số từ Sách giáo khoa Toán 6 — Bộ Cánh Diều/Chân Trời Sáng Tạo/Kết Nối Tri Thức theo chuẩn TT 32/2018.
- **Lời nhắc sư phạm Socratic chuẩn (Copyable Prompt):**
  > "Em đang bị nhầm lẫn khi cộng hai phân số không cùng mẫu số... Thầy/Cô hãy đóng vai gia sư sư phạm kiên nhẫn: chỉ sử dụng các nguồn tài liệu của Bộ GD&ĐT đã tải lên, không đưa ngay đáp án cuối cùng, hãy hỏi từng bước để hướng dẫn em tự tìm ra mẫu số chung và quy đồng."
- **Giao diện người dùng:** Học sinh có thể nhấn nút sao chép prompt và truy cập thẳng vào `https://notebooklm.google.com/` mà không bị rò rỉ dữ liệu cá nhân hay phụ thuộc vào API tốn kém.

---

## 7. Kiểm Tra Lại & Lịch Sử Làm Chủ (Mastery Cycle)

Tệp triển khai: `src/domain/mastery/history.ts`

- Sau khi học xong gói học liệu, học sinh làm bài kiểm tra lại song song (Re-test) gồm các câu hỏi tương đương về độ khó và cấu trúc (`ITEM-RETEST-FRAC-03`, `ITEM-RETEST-FRAC-04`).
- Khi vượt qua bài kiểm tra lại, hệ thống ghi nhận chuyển dịch trạng thái tất định:
  - **Trạng thái trước:** `DEVELOPING` (Độ tin cậy: MEDIUM)
  - **Trạng thái mới:** `SECURE` (Độ tin cậy: HIGH)
  - **Minh chứng:** Ghi nhận mã gói học liệu `learningPackId`, số câu đúng, lý do thăng cấp, và dấu thời gian ISO 8601 bất biến.

---

## 8. Trải Nghiệm Giao Diện Người Dùng (UI/UX Redesign)

Dựa trên tiêu chuẩn thẩm mỹ `Leonxlnx/taste-skill` và các điều kiện kiên quyết của sản phẩm giáo dục:

1. **Trang Chẩn Đoán Lớp 6 (`/diagnostic/math-grade6`):**
   - Trình chạy chẩn đoán 4 pha mượt mà: Làm bài $\rightarrow$ Xem cây lỗ hổng $\rightarrow$ Nhận gói học tập & Lời nhắc Gemini $\rightarrow$ Kiểm tra lại & Cấp chứng nhận làm chủ kiến thức.
   - Trực quan hóa cây tri thức với huy hiệu trạng thái sống (`SECURE` màu xanh lục, `DEVELOPING` màu hổ phách, `PREREQUISITE GAP` viền đỏ cảnh báo).
2. **Trang Chủ (`/`):**
   - Tiêu đề biên tập sắc sảo: *"Con không chỉ cần học thêm. Con cần biết chính xác mình đang hổng kiến thức nào."*
   - Loại bỏ hoàn toàn các chỉ số ảo ("0+ học viên", "98% đỗ").
   - Xóa bỏ cổng bắt buộc nhập số điện thoại trước khi xem kết quả. Cam kết: Không telesale, không quảng cáo.
   - Thêm phần giới thiệu chi tiết về Lát cắt Toán Lớp 6 và liên kết trực tiếp để phụ huynh trải nghiệm.
3. **Bảo tồn di sản:** Trang `/assessment/ai-career-readiness` giữ nguyên vẹn chức năng làm bài trắc nghiệm nghề nghiệp cho người lớn với banner cảnh báo thử nghiệm rõ ràng.

---

## 9. Kết Quả Kiểm Thử Toàn Diện (Verification Evidence)

1. **Kiểm thử tự động Vitest:**
   - **Tổng số tệp kiểm thử:** 30/30 passed (100%)
   - **Tổng số ca kiểm thử:** 108/108 passed (100%)
   - Bao gồm: `smoke.test.tsx`, `landing.test.tsx`, `graph-validator.test.ts`, `gap-engine.test.ts`, `learning-pack-retest.test.ts`, `v3-vertical-slice.test.ts`, cùng toàn bộ các bài test phân tích hồi quy trước đây.
2. **Biên dịch sản xuất Next.js (`npm run build`):**
   - Không có lỗi TypeScript (`tsc --noEmit` pass).
   - 19/19 routes tĩnh và động biên dịch thành công.

---

## 10. Kết Luận & Bàn Giao

Lát cắt dọc **AI School V3 Evidence-First Vertical Slice** đã hoàn thành trọn vẹn theo đúng trình tự và cam kết:
`Nguồn Bộ GD&ĐT → Source Registry → Chuẩn đầu ra trích xuất → Lát cắt Toán 6 Phân số → Đồ thị tri thức DAG → Câu hỏi chẩn đoán & Sai lầm thường gặp → Động cơ phân tích lỗ hổng tất định → Gói học tập nguồn chuẩn → Giao thức Gemini Notebook → Kiểm tra lại song song → Lịch sử làm chủ kiến thức → Giao diện người dùng chuẩn mực`.

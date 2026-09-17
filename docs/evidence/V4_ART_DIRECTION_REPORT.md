# AI School V4 — Báo Cáo Kiến Trúc Nghệ Thuật & Tái Thiết Kế Giao Diện
## (Art Direction & Visual Architecture Execution Report)

- **Repository:** `GiaPhatSDZ/assessment-platform`
- **Phiên bản:** AI School V4.0.0 (Frank-Inspired Warm Editorial + Product UI)
- **Ngày hoàn thành:** 2026-09-17
- **Tình trạng:** HOÀN TẤT & ĐÃ KIỂM THỬ TOÀN DIỆN (100% Green)

---

## 1. Tổng Quan Tái Thiết Kế & So Sánh Trước / Sau

| Tiêu Chí | Thiết Kế Cũ (V3) | Kiến Trúc Nghệ Thuật Mới (V4) |
| :--- | :--- | :--- |
| **Thẩm mỹ chủ đạo** | Giao diện SaaS Tailwind generic, màu nền lạnh, thẻ bo tròn lặp đi lặp lại. | **Warm Editorial Education + Product UI**: Nền canvas ấm áp (`#F5F1E8`), mực đen mềm (`#1D211D`), thanh lịch và tin cậy. |
| **Kiểu chữ (Typography)** | Chỉ dùng sans-serif thông thường hoặc font mặc định. | Kết hợp 2 bộ font cao cấp: **Lora Display Serif** (tiêu đề, thông điệp thương hiệu) & **Be Vietnam Pro** (dữ liệu UI, bài tập, phím bấm). |
| **Cấu trúc Trang chủ** | 9 section đều đặn dạng thẻ, thiếu nhịp điệu thị giác. | **5 Hồi (Acts) Kể Chuyện**: Tách 12 cột (5/7), Hero mang khung sản phẩm thật `KnowledgePathPreview`, sticky phân tích lỗ hổng, stage rail K–12, chuỗi 4 cảnh sản phẩm và Parent Copilot. |
| **Chế độ hiển thị (Modes)** | Một kiểu layout cho toàn bộ ứng dụng. | **3 Chế độ chuyên biệt**: `BRAND MODE` (Khám phá), `FOCUS MODE` (Chẩn đoán không sao nhãng), `INSIGHT MODE` (Bản đồ tri thức & phụ huynh). |
| **Phòng chẩn đoán** | Vẫn còn khung app chung, nút điều hướng rải rác. | **Focus Mode tập trung tối đa**: Giới hạn bề rộng 820px, loại bỏ mọi thẻ marketing, toán KaTeX kích thước lớn, phím tắt 1..4, không lộ mã node nội bộ. |
| **Kết quả lỗ hổng** | Hiển thị mã kỹ thuật (`ROOT_GAP`), khô cứng. | **Ngôn ngữ nhân văn**: Tiêu đề *"Có dấu hiệu con cần củng cố 'Quy đồng mẫu số' trước"*, bản đồ mắt xích trực quan làm trung tâm, bằng chứng minh bạch. |
| **Hỗ trợ phụ huynh** | Hộp thoại AI chung chung hoặc văn bản rời rạc. | **Parent Copilot dạng Companion Panel**: Bảng trợ lý theo ngữ cảnh lỗ hổng, giải thích ngộ nhận, gợi ý câu hỏi bàn ăn, đối soát chuẩn GDPT 2018. |
| **Truyền thông & Bằng chứng** | Có thể chứa các cụm từ cam kết ("15 phút", "dứt điểm"). | **Chuẩn mực bằng chứng**: Xóa sạch lời hứa suông, không xếp hạng điểm số, không tạo số liệu người dùng giả. |

---

## 2. Hệ Thống Token Thiết Kế (V4 Design Tokens)

Theo đặc tả `V4_DESIGN_TOKENS.json` và `tailwind.config.ts`:

```json
{
  "version": "4.0.0",
  "fonts": {
    "display": "Lora, Georgia, serif (var(--font-lora))",
    "ui": "Be Vietnam Pro, system-ui, sans-serif (var(--font-be-vietnam-pro))"
  },
  "colors": {
    "canvas": "#F5F1E8",
    "surface": "#FFFDF8",
    "surfaceStrong": "#FFFFFF",
    "ink": "#1D211D",
    "inkMuted": "#677069",
    "line": "#D8D5CC",
    "brand": {
      "DEFAULT": "#245B47",
      "dark": "#143C2F",
      "soft": "#DDEBE3"
    },
    "accent": {
      "DEFAULT": "#E9B44C",
      "soft": "#F8EAC1"
    },
    "danger": {
      "DEFAULT": "#B6473A",
      "soft": "#F5DDD7"
    },
    "info": {
      "DEFAULT": "#315E9B",
      "soft": "#DDE8F6"
    }
  },
  "radius": {
    "app": "14px",
    "marketingWindow": "24px",
    "pill": "9999px"
  },
  "maxWidths": {
    "marketing": "1280px",
    "reading": "760px",
    "diagnostic": "820px",
    "insight": "1120px"
  }
}
```

---

## 3. Các Trang & Thành Phần Đã Tái Thiết Kế Toàn Diện

1. **`app/layout.tsx` & `tailwind.config.ts`**:
   - Tích hợp đồng thời Google Font `Lora` và `Be Vietnam Pro`.
   - Thiết lập màu nền toàn cục `bg-canvas text-ink`.
2. **`components/v4/layout/`**:
   - `ProductHeader.tsx`: Thanh điều hướng trong suốt trên Hero, chuyển nền mờ khi cuộn, thương hiệu AI School với điểm nhấn Lora serif, loại bỏ toàn bộ liên kết khảo sát cũ.
   - `ProductFooter.tsx`: Chân trang chuẩn mực biên tập, căn cứ pháp lý Thông tư 32/2018/TT-BGDĐT, cam kết bảo mật không số điện thoại.
   - `AppShell.tsx`: Vỏ bọc hỗ trợ 3 chế độ (`BRAND`, `FOCUS`, `INSIGHT`).
3. **`components/v4/landing/` & `app/page.tsx`**:
   - `HeroAct.tsx` (Hồi 1): Phân tách 5/7, H1 Lora thanh nhã, cửa sổ sản phẩm thật `KnowledgePathPreview`.
   - `GapTracingAct.tsx` (Hồi 2): Phân tích nguyên nhân ngộ nhận với toán KaTeX tách biệt rõ nhãn chữ tiếng Việt.
   - `CurriculumRailAct.tsx` (Hồi 3): Thanh chọn cấp học (Mầm non, Tiểu học, THCS, THPT) và danh mục hàng ngang minh bạch trạng thái.
   - `ProductProgressionAct.tsx` (Hồi 4): Chuỗi 4 bước khép kín từ chẩn đoán đến kiểm tra lại.
   - `ParentSupportAct.tsx` (Hồi 5): Bảng đồng hành Parent Copilot.
   - `SourceTrustBand.tsx`, `FaqSection.tsx`, `FinalCtaSection.tsx`.
4. **`app/curriculum/page.tsx` & `components/v4/curriculum/EditorialCatalog.tsx`**:
   - Danh mục chương trình biên tập với bảng chọn giai đoạn và thanh tra cây tri thức DAG trực quan.
5. **`app/diagnostic/math-grade6/page.tsx` & `components/v4/diagnostic/FocusDiagnosticWorkspace.tsx`**:
   - Phòng chẩn đoán Focus Mode: Max width 820px, phím tắt 1..4, toán học KaTeX, không nút cheat, không lộ ID node.
6. **`components/v4/remediation/GapInsightView.tsx`**:
   - Insight Mode: Cây tri thức là trung tâm, tiêu đề nhân văn, bảng đồng hành phụ huynh tích hợp.
7. **`app/learn/page.tsx`, `app/learn/new/page.tsx`, `app/learn/history/page.tsx`, `app/parent/page.tsx`**:
   - Đồng bộ sang `AppShell` V4.

---

## 4. Chuyển Động (Motion) & Khả Năng Tiếp Cận (Accessibility)

- **Motion Restraint**:
  - Không dùng animation vô nghĩa hay quả cầu phát sáng ảo.
  - Chuyển động tập trung vào việc mô tả: Lần vết mắt xích tri thức, chuyển đổi trạng thái node (`UNASSESSED` $\rightarrow$ `GAP_CONFIRMED` $\rightarrow$ `MASTERED`), chuyển tab các giai đoạn.
  - Tôn trọng thuộc tính `prefers-reduced-motion`.
- **Accessibility (A11y)**:
  - Độ tương phản đạt chuẩn WCAG AA trên nền canvas ấm.
  - Phím tắt (1..4) cho câu hỏi trắc nghiệm, hỗ trợ bàn phím điều hướng hoàn toàn.
  - Toàn bộ công thức toán kết xuất qua KaTeX với `output: 'html'`, loại bỏ mã TeX thô trong DOM.

---

## 5. Kiểm Toán & Từ Chối Đề Xuất Generic (Anti-Slop Audit)

Trong quá trình thực thi, hệ thống đã chủ động ngăn chặn và loại bỏ các đề xuất thiết kế rập khuôn (SaaS slop):
1. **Từ chối lưới 3 thẻ tính năng ngang bằng**: Thay thế bằng cốt truyện 5 Hồi bất đối xứng và cảnh sản phẩm thực tế.
2. **Từ chối quả cầu AI phát sáng (Glowing AI Orb) hoặc nền tím/xanh gradient**: Thay thế bằng ánh sáng ấm áp khuếch tán nhẹ phía sau cửa sổ sản phẩm.
3. **Từ chối Chatbot thả nổi vô định (Floating Chat Bubble)**: Thay thế bằng `Parent Copilot` dạng bảng đồng hành chuyên biệt gắn liền với ngữ cảnh lỗ hổng của bài học.
4. **Từ chối số liệu người dùng ảo (Fake KPIs / Testimonials)**: Tuyệt đối không sinh đánh giá giả mạo hay % cải thiện không có căn cứ.
5. **Từ chối nút gian lận (Developer Cheats) trong bản thương mại**: Toàn bộ nút mô phỏng ngộ nhận được dỡ bỏ khỏi giao diện người học.

---

## 6. Kết Quả Kiểm Thử Toàn Diện (Test Results)

### 6.1 TypeScript & ESLint
- `npm run lint` $\rightarrow$ **✔ No ESLint warnings or errors**
- `npm run typecheck` $\rightarrow$ **0 errors (Code 0)**

### 6.2 Vitest Suites (32 test files / 117 tests)
- `tests/integration/v4-art-direction.test.tsx`: **4/4 passed**
- `tests/integration/v3-web-template-requirements.test.tsx`: **5/5 passed**
- `components/marketing/landing.test.tsx`: **1/1 passed**
- `tests/integration/smoke.test.tsx`: **1/1 passed**
- Toàn bộ 28 suite domain, scoring, gap-engine, curriculum graph: **100% passed**
- **Tổng cộng: 32 files passed, 117/117 tests passed (Duration: 48.4s)**

### 6.3 Playwright E2E Suites (34/34 passed trên cả Desktop Chrome & Mobile Chrome)
Đã kiểm thử responsive trên cả 5 kích thước màn hình bắt buộc:
- **360px (Mobile nhỏ)**: PASS (Không tràn ngang, font và math hiển thị vừa vặn).
- **390px (Mobile hiện đại)**: PASS (Không tràn ngang).
- **768px (Tablet)**: PASS (Layout thích ứng mượt mà).
- **1024px (Laptop)**: PASS.
- **1440px (Desktop)**: PASS (Tỷ lệ 5/7 và khoảng trắng chuẩn mực).
- **Luồng học sinh đầy đủ**: Landing $\rightarrow$ `/curriculum` $\rightarrow$ `/diagnostic/math-grade6` ở Focus Mode: **PASS (100%)**.

### 6.4 Next.js Production Build
- `npm run build` $\rightarrow$ **24/24 static pages generated successfully (Code 0)**.

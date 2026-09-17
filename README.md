# Assessment Studio — Nền Tảng Đánh Giá Năng Lực Mã Nguồn Mở

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-green?logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.50-green?logo=playwright)](https://playwright.dev/)

**Assessment Studio** là nền tảng SaaS mã nguồn mở (Open-Source) tối ưu hóa trải nghiệm di động (Mobile-First) dành cho thị trường Việt Nam. Hệ thống chuyển đổi **10 câu hỏi tình huống thực tế** thành điểm số toán học 4 chiều chuẩn xác (**Tư duy phân tích**, **Giải quyết vấn đề**, **Hiểu biết AI**, **Khả năng thích ứng**), tích hợp cơ chế thu thập thông tin khách hàng tiềm năng có chủ đích (Delayed Lead Capture) để nhận bản kế hoạch hành động 6 tuần do AI đề xuất.

---

## 🌟 Triết Lý Thiết Kế Cốt Lõi (Core Principles)

1. **Thẩm quyền điểm số toán học tuyệt đối (Deterministic Scoring Authority)**:
   - Toàn bộ điểm số 4 chiều và phân loại dải năng lực (Khởi đầu, Đang phát triển, Vững vàng, Xuất sắc) được tính toán 100% bằng thuật toán toán học tất định trên máy chủ.
   - **Mô hình AI không bao giờ được phép tính toán, can thiệp hay thay đổi điểm số.**
2. **Suy giảm hữu ích (Fail-Useful Graceful Degradation)**:
   - Ứng dụng hoạt động đầy đủ 100% ngay cả khi chưa cấu hình Supabase hoặc AI API key. Hệ thống tự động chuyển sang cơ chế lưu trữ bộ nhớ an toàn (In-Memory Fallback) và bản báo cáo dự phòng chuẩn mực.
3. **Quyền riêng tư & Thu thập tối thiểu (Privacy & Data Minimization)**:
   - Người học làm bài hoàn toàn ẩn danh. Quyền sở hữu phiên làm việc được bảo vệ bằng mã định danh ngẫu nhiên 256-bit lưu qua cookie HttpOnly.
   - Không thu thập số điện thoại, không gọi điện làm phiền (telesales). Thông tin liên hệ (Email & Tên) chỉ được yêu cầu khi người học chủ động muốn nhận báo cáo AI nâng cao.
4. **Trung thực tuyệt đối (Zero Fabricated Metrics)**:
   - Không tạo bộ đếm thời gian giả (no fake urgency timers), không tạo số người đang xem giả mạo, không sử dụng đánh giá khách hàng bịa đặt.

---

## 📐 Kiến Trúc Hệ Thống (Clean Architecture)

Dự án tuân thủ nghiêm ngặt ranh giới kiến trúc Domain-Driven Design:

```text
src/
├── domain/                  # Lõi nghiệp vụ độc lập (Zero external dependencies)
│   ├── assessment/          # Thang đo, Zod schema, công thức toán học, result bands
│   ├── referral/            # Chuẩn hóa mã giới thiệu (?ref=)
│   └── report/              # Hợp đồng cấu trúc dữ liệu bản báo cáo
├── application/             # Cổng giao tiếp & Các trường hợp sử dụng (Use Cases)
│   ├── assessment-repository.ts
│   ├── report-generator.ts
│   └── analytics.ts
├── infrastructure/          # Triển khai kỹ thuật & Tích hợp bên ngoài
│   ├── auth/                # HttpOnly token, Admin auth, Open-redirect protection
│   ├── database/            # Supabase PostgreSQL adapter & InMemory fallback
│   ├── ai/                  # Adapter OpenAI / Gemini / Mock fallback & Prompt versioning
│   ├── analytics/           # First-party tracker & Optional PostHog adapter
│   └── browser/             # LocalStorage session recovery
app/                         # Next.js 15 App Router (Routes & Server Components)
components/                  # Giao diện người dùng theo Design System (Trust Blue & Slate)
assessments/                 # Định nghĩa các bộ câu hỏi chuẩn (ai-career-readiness-v1.ts)
```

---

## 🚀 Tính Năng Nổi Bật

- **Trình làm bài thi chuẩn Mobile (Single-Question Runner)**:
  - Hiển thị từng câu hỏi độc lập, chuyển câu mượt mà, hỗ trợ thanh tiến trình trực quan.
  - Phím tắt bàn phím tiện lợi (`1`..`5` để chọn đáp án, `Enter` để tiếp tục, `Back` để sửa đáp án).
  - Tự động phục hồi trạng thái làm bài khi người dùng vô tình tải lại trình duyệt.
- **Biểu đồ mạng nhện SVG (Accessible Radar Chart)**:
  - Biểu đồ radar 4 trục đa chiều hiển thị trực quan tỷ lệ năng lực.
  - Tích hợp bảng điểm và mô tả dải năng lực dạng văn bản song song đảm bảo khả năng tiếp cận (Accessibility WCAG AA/AAA).
- **Thu thập Lead có chủ đích (Delayed Lead Capture)**:
  - Không chặn xem kết quả điểm số ban đầu.
  - Biểu mẫu nhận báo cáo chi tiết thu thập Tên, Email và ghi nhận thời điểm đồng ý (consent timestamp) minh bạch.
- **Báo cáo hành động 6 tuần (Personalized AI Report)**:
  - Bản phân tích năng lực chi tiết chia theo từng tuần rèn luyện.
  - Bộ đệm cơ sở dữ liệu ngăn chặn việc gọi API trùng lặp, tối ưu chi phí hạ tầng (Cost-Safe Caching).
  - Nút in và lưu PDF trực tiếp từ trình duyệt.
- **Bảng điều khiển học viên (Participant Dashboard)**:
  - Đăng nhập không cần mật khẩu bằng liên kết bảo mật Email (Magic Link).
  - Tự động liên kết và xác nhận quyền sở hữu các bài đánh giá ẩn danh trước đó vào tài khoản người dùng sau khi đăng nhập thành công.
- **Bảng điều khiển quản trị (Admin Minimum)**:
  - Xác thực nghiêm ngặt phía máy chủ qua biến môi trường `ADMIN_EMAILS`.
  - Giám sát phễu chuyển đổi thời gian thực: Số lượt bắt đầu, Hoàn thành, Tỷ lệ hoàn thành, Yêu cầu Lead, Chuyển đổi báo cáo AI.
  - Phân tích hiệu quả theo từng nguồn giới thiệu (`?ref=`).
  - Danh sách phiên làm bài tối giản, bảo vệ quyền riêng tư (không hiển thị PII email/tên).

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu Cầu Môi Trường
- Node.js `>= 18.18.0` (Khuyên dùng Node 20+ hoặc 24 LTS)
- npm `>= 9.0.0`

### 1. Cài đặt mã nguồn
```bash
git clone https://github.com/your-org/assessment-platform.git
cd assessment-platform
npm install
```

### 2. Cấu hình biến môi trường
Sao chép tệp mẫu `.env.example`:
```bash
cp .env.example .env.local
```

Nội dung cấu hình cơ bản (`.env.local`):
```env
# URL trang web
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (Tùy chọn: Để trống để dùng In-Memory Fallback)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider (Tùy chọn: Để trống để dùng Mock AI fallback)
AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=

# Quản trị viên hệ thống (Danh sách email cách nhau bởi dấu phẩy)
ADMIN_EMAILS=admin@example.com,lead@platform.vn
```

### 3. Khởi tạo cơ sở dữ liệu Supabase (Khi sử dụng Supabase)
Nếu bạn kết nối cơ sở dữ liệu Supabase thật:
1. Chạy mã SQL khởi tạo bảng và bảo mật RLS từ:
   `supabase/migrations/20260917000001_initial_schema.sql`
2. Chạy dữ liệu mẫu ban đầu (Seed data) từ:
   `supabase/seed.sql`

### 4. Khởi động môi trường phát triển
```bash
npm run dev
```
Mở trình duyệt tại: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Kiểm Thử & Đảm Bảo Chất Lượng (Quality Gates)

Hệ thống được kiểm thử toàn diện từ tầng Domain, Infrastructure đến E2E:

```bash
# 1. Chạy toàn bộ Unit & Integration tests (Vitest)
npm test

# 2. Chạy kiểm tra tĩnh (TypeScript & ESLint)
npm run typecheck
npm run lint

# 3. Chạy toàn bộ cổng chất lượng (Lint + Typecheck + Test)
npm run check

# 4. Chạy kiểm thử tự động giao diện người dùng (Playwright E2E)
npx playwright install chromium
npm run test:e2e
```

---

## 🚢 Hướng Dẫn Triển Khai Lên Vercel

Dự án đã sẵn sàng 100% để triển khai tự động lên Vercel:

1. Đẩy mã nguồn lên kho lưu trữ GitHub của bạn.
2. Đăng nhập vào [Vercel](https://vercel.com/) và bấm **Import Project**.
3. Chọn kho lưu trữ `assessment-platform`.
4. Trong phần **Environment Variables**, cấu hình các biến từ tệp `.env.example`.
5. Bấm **Deploy**. Vercel sẽ tự động phát hiện Next.js 15 và xây dựng sản phẩm tối ưu.

---

## 📄 Giấy Phép & Đóng Góp

- **Bản quyền**: © 2026 Assessment Studio Team.
- **Giấy phép mã nguồn**: Phát hành theo chuẩn [Apache License 2.0](./LICENSE).
- **Đóng góp**: Vui lòng tham khảo [CONTRIBUTING.md](./CONTRIBUTING.md) và [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

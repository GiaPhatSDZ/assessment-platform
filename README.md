# AI School — Nền Tảng Khảo Sát Năng Lực & Làm Chủ Tri Thức Chuẩn GDPT 2018

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-green?logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.50-green?logo=playwright)](https://playwright.dev/)

**AI School** là nền tảng chẩn đoán mắt xích kiến thức và làm chủ tri thức bám sát Chương trình Giáo dục phổ thông 2018 (**Thông tư 32/2018/TT-BGDĐT**). Hệ thống thay thế phương pháp luyện đề tràn lan bằng quy trình chẩn đoán truy vết ngược trên đồ thị tri thức có hướng (DAG), giúp học sinh và phụ huynh phát hiện chính xác lỗ hổng gốc rễ và củng cố có trọng tâm.

> [!IMPORTANT]
> **Tài Liệu Thẩm Quyền Kiến Trúc Hiện Hành:**  
> Vui lòng tham khảo văn bản [docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md](docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md) để nắm rõ toàn bộ quy chuẩn sản phẩm, ranh giới an toàn học sinh, và cơ chế phát hành nội dung.

---

## 🌟 Nguyên Tắc Sư Phạm & Ranh Giới Kỹ Thuật (Core Invariants)

1. **Không Dùng Generative AI Trong Runtime Học Sinh (Zero Runtime Student AI)**:
   - Học sinh không tiếp xúc với chatbot hay Generative AI trong quá trình làm bài chẩn đoán và học tập.
   - Toàn bộ câu hỏi, bài học và ví dụ mẫu phải được biên soạn, thẩm định bởi con người và có chữ ký số/review attestation gắn với phiên bản nội dung.
2. **Truy Vết Mắt Xích Tiên Quyết (Prerequisite Gap Tracing)**:
   - Thay vì bắt học sinh làm lại hàng chục bài tập của kỹ năng đang sai, hệ thống truy vết ngược trên đồ thị tri thức DAG để tìm mắt xích nền tảng bị hổng (ví dụ: hổng kỹ năng quy đồng mẫu số ở Lớp 5 dẫn tới không làm được phép cộng phân số ở Lớp 6).
3. **Cổng Phát Hành Mật Mã Học & Ranh Giới Máy Chủ (Server-Only Publication Gate)**:
   - Dữ liệu học liệu DRAFT/chưa qua thẩm định con người chỉ được nạp ở tầng máy chủ (`server-only`) và **không bao giờ lọt vào client bundle** của học sinh.
   - Khi chưa có kiểm duyệt, phòng thi tự động đóng (`CONTENT_NOT_AVAILABLE`).
4. **Phụ Huynh Đồng Hành Có Trách Nhiệm (Parent Copilot)**:
   - AI hỗ trợ phụ huynh (Parent Copilot) chỉ hoạt động tại góc phụ huynh (`/parent`), bám sát yêu cầu cần đạt (YCCĐ) chính thống và bằng chứng học tập thực tế của con.
   - AI phụ huynh hoàn toàn chỉ đọc, không có quyền thay đổi trạng thái làm chủ hay điểm số của học sinh.
5. **Không Bịa Đặt Điểm Số Toàn Cầu (No Fake Intelligence Scores)**:
   - Không tạo điểm số IQ giả lập, không xếp hạng trí tuệ mơ hồ. Mọi đánh giá đều gắn liền với từng mắt xích tri thức cụ thể theo chuẩn GDPT.

---

## 📐 Kiến Trúc Hệ Thống (System Architecture)

Dự án tổ chức theo mô hình phân tầng chặt chẽ (Domain-Driven Clean Architecture):

```text
src/
├── domain/                      # Lõi nghiệp vụ độc lập (Zero external dependencies)
│   ├── curriculum/              # Đồ thị tri thức (DAG), Node, Edge, Validator
│   ├── content/                 # Lược đồ học liệu, Canonical Content Hash, Reviewer Authority, Publication Guard
│   ├── diagnostic/              # Động cơ đánh giá mắt xích (Engine), Chẩn đoán lỗ hổng gốc (Gap Engine)
│   ├── remediation/             # Gói bồi đắp kiến thức (Learning Pack)
│   ├── mastery/                 # Lịch sử và chuyển dịch trạng thái làm chủ (Mastery Transition)
│   ├── assessment/              # [Platform Core] Thang đo & Động cơ tính điểm tất định tái sử dụng
│   └── report/                  # [Platform Core] Lược đồ báo cáo cấu trúc
├── application/                 # Các trường hợp sử dụng & Cổng máy chủ
│   ├── curriculum/
│   │   ├── student-content-delivery-service.ts  # [Server-Only] Cổng nạp và sàng lọc học liệu học sinh
│   │   └── curriculum-service.ts                # Dịch vụ truy xuất thông tin chương trình
│   ├── assessment-repository.ts # [Platform Core] Cổng trừu tượng lưu trữ
│   └── report-generator.ts      # [Platform Core] Hợp đồng sinh báo cáo
└── infrastructure/              # Triển khai kỹ thuật & Tích hợp bên ngoài
    ├── auth/                    # Token HttpOnly 256-bit, Quyền Admin, Safe-redirect
    ├── database/                # Supabase PostgreSQL adapter & InMemory fallback
    ├── remediation/             # Bộ sinh prompt phụ huynh (ManualGeminiNotebookProvider)
    └── ai/                      # [Platform Core] AI Adapter (OpenAI / Gemini / Mock fallback)
app/                             # Next.js 15 App Router
├── diagnostic/math-grade6/      # Server Component chẩn đoán Toán Lớp 6 (bảo vệ bởi cổng Server-Only)
├── curriculum/                  # Danh mục chương trình GDPT & Sổ đăng ký độ phủ
├── learn/                       # Góc học tập học sinh (/learn, /learn/new, /learn/history)
└── parent/                      # Góc phụ huynh (Parent Copilot)
components/                      # Giao diện người dùng theo Design System chuẩn
curriculum/                      # Kho ngữ liệu chuẩn quốc gia (YCCĐ, SGK, SGV, VBT NXB Giáo dục)
```

---

## 🧱 Hạ Tầng Nền Tảng Tái Sử Dụng (Reusable Platform Core)

> [!NOTE]
> **REUSABLE PLATFORM-CORE REFERENCE**  
> Hạ tầng đánh giá chung (Generic Assessment Platform v0.1) được lưu giữ và duy trì làm hạ tầng lõi tái sử dụng, không còn đóng vai trò sản phẩm định hướng chính. Current product authority: [AI_SCHOOL_CURRENT_AUTHORITY.md](docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md).

Dự án kế thừa và duy trì bộ hạ tầng lõi phục vụ các bài đánh giá tiêu chuẩn:
- **Động cơ tính điểm toán học tất định (`src/domain/assessment/scoring.ts`)**: Tính toán điểm số 100% bằng thuật toán toán học phía máy chủ, AI không được phép can thiệp vào điểm số.
- **Xác thực phiên ẩn danh mật mã học (`src/infrastructure/auth/`)**: Bảo vệ quyền sở hữu bài làm qua mã định danh ngẫu nhiên 256-bit lưu trong cookie HttpOnly an toàn.
- **Hệ thống lưu trữ bền vững (`src/infrastructure/database/`)**: Tương thích Supabase PostgreSQL với Row Level Security (RLS), tự động chuyển sang cơ chế lưu trữ bộ nhớ an toàn (In-Memory Fallback) khi chạy cục bộ.
- **Bảng điều khiển quản trị (`components/admin/`)**: Giám sát phễu chuyển đổi và phân tích nguồn người dùng ẩn danh không lưu trữ PII.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu Cầu Môi Trường
- Node.js `>= 18.18.0` (Khuyên dùng Node 20+ hoặc Node 24 LTS)
- npm `>= 9.0.0`

### 1. Cài đặt mã nguồn
```bash
git clone https://github.com/GiaPhatSDZ/assessment-platform.git
cd assessment-platform
npm install
```

### 2. Cấu hình biến môi trường
Sao chép tệp mẫu `.env.example`:
```bash
cp .env.example .env.local
```

### 3. Khởi động môi trường phát triển
```bash
npm run dev
```
Mở trình duyệt tại: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Bộ Kiểm Thử Đảm Bảo Chất Lượng (Quality Gates)

Hệ thống được bảo vệ bởi bộ kiểm thử tự động toàn diện:

```bash
# 1. Chạy toàn bộ Unit & Integration tests (Vitest)
npm test

# 2. Chạy kiểm tra kiểu tĩnh TypeScript
npx tsc --noEmit

# 3. Chạy kiểm tra chuẩn mã nguồn (ESLint)
npm run lint

# 4. Xây dựng bản phân phối sản xuất và kiểm tra ranh giới bundle
npm run build

# 5. Chạy kiểm thử tự động hành trình người dùng (Playwright E2E)
npm run test:e2e
```

---

## 📄 Giấy Phép & Đóng Góp

- **Bản quyền**: © 2026 AI School Team.
- **Giấy phép mã nguồn**: Phát hành theo chuẩn [Apache License 2.0](./LICENSE).
- **Đóng góp**: Vui lòng tham khảo [CONTRIBUTING.md](./CONTRIBUTING.md) và [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

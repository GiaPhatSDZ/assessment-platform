# Hướng Dẫn Đóng Góp (Contributing Guide)

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án **Assessment Studio**! Chúng tôi trân trọng mọi đóng góp nhằm xây dựng nền tảng đánh giá năng lực minh bạch, công bằng và khách quan.

---

## 1. Nguyên Tắc Cốt Lõi Khi Đóng Góp

1. **Thẩm quyền điểm số toán học (Deterministic Scoring)**:
   - Nghiệp vụ chấm điểm nằm hoàn toàn tại `src/domain/assessment/scoring.ts`. Tuyệt đối không đưa logic tính toán điểm số vào prompt của AI hay phân định ngẫu nhiên phía client.
2. **Kiến trúc phân tầng sạch (Clean Architecture)**:
   - Tầng `src/domain/` không được phụ thuộc vào bất kỳ thư viện bên ngoài nào (ngoại trừ Zod cho việc xác thực schema).
   - Tuyệt đối không gọi trực tiếp Supabase client hay mô hình AI bên trong React component.
3. **Không tạo số liệu giả (Zero Fabricated Metrics)**:
   - Không commit các bộ đếm thời gian giả mạo, đánh giá ảo (fake reviews), hay các kỹ thuật thao túng tâm lý (dark patterns).

---

## 2. Quy Trình Phát Triển Cục Bộ

1. **Tạo nhánh tính năng mới**:
   ```bash
   git checkout -b feat/ten-tinh-nang-moi
   ```
2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```
3. **Thực thi quy trình kiểm thử trước khi commit (TDD)**:
   - Viết bài kiểm thử tương ứng tại `tests/` hoặc gần component.
   - Chạy toàn bộ các cổng chất lượng bắt buộc:
     ```bash
     npm run check
     ```
   - Lệnh `npm run check` sẽ tự động chạy:
     1. `npm run lint` (ESLint)
     2. `npm run typecheck` (TypeScript)
     3. `npm run test` (Vitest)
4. **Kiểm thử giao diện (E2E)** nếu có thay đổi luồng người dùng:
   ```bash
   npm run test:e2e
   ```

---

## 3. Tiêu Chuẩn Commit Git

Chúng tôi áp dụng chuẩn **Conventional Commits**:
- `feat:` Thêm tính năng mới
- `fix:` Sửa lỗi
- `docs:` Thay đổi tài liệu
- `test:` Bổ sung hoặc cập nhật bài test
- `perf:` Tối ưu hiệu năng
- `chore:` Thay đổi cấu hình công cụ, phụ thuộc

---

## 4. Tiêu Chuẩn Tạo Pull Request (PR)

- Đảm bảo tất cả các bài test trong CI đều chuyển sang trạng thái xanh (Green).
- Đảm bảo không có cảnh báo lint hay lỗi TypeScript (`noEmit`).
- Mô tả chi tiết mục đích thay đổi và bằng chứng kiểm thử (ảnh chụp hoặc log kết quả).

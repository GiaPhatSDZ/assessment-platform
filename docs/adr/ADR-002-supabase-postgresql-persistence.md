# ADR-002: Lưu Trữ Bằng Supabase PostgreSQL Kèm Bảo Mật Cấp Hàng (RLS)

## Trạng Thái (Status)
Đã Phê Duyệt (Accepted) — Ngày: 2026-09-17

## Bối Cảnh (Context)
Nền tảng cần một cơ sở dữ liệu quan hệ mạnh mẽ để lưu trữ các phiên đánh giá, câu trả lời, điểm số, thông tin Lead và tài khoản học viên, đồng thời hỗ trợ xác thực và cơ chế kiểm soát truy cập dữ liệu an toàn.

## Quyết Định (Decision)
Chúng tôi chọn **Supabase (PostgreSQL)** làm giải pháp lưu trữ chính thức:
1. **Kiến trúc phân tách rõ ràng**: Lưu trữ thông qua các bảng quan hệ có ràng buộc toàn vẹn khóa ngoại (Foreign Keys) và chỉ mục tìm kiếm (Indexes).
2. **Row Level Security (RLS)**: Kích hoạt RLS trên tất cả 10 bảng dữ liệu. Bảng bài đánh giá công khai cho phép đọc; các bảng phiên làm việc, kết quả và Lead chỉ có thể truy cập qua máy chủ Next.js Server Client với quyền sở hữu được xác minh.
3. **Cơ chế suy giảm hữu ích (Fail-Useful Fallback)**: Nếu chưa cấu hình Supabase URL/Keys, hệ thống tự động chuyển tiếp sang `InMemoryAssessmentRepository` giúp các nhà phát triển thử nghiệm cục bộ mà không bắt buộc phải cài đặt database ngay lập tức.

## Hệ Quả (Consequences)
- **Tích cực**:
  - Tận dụng tính toàn vẹn dữ liệu chuẩn ACID của PostgreSQL.
  - Sẵn sàng tích hợp xác thực Magic Link của Supabase Auth.
  - An toàn bảo mật dữ liệu ở tầng cơ sở dữ liệu thông qua RLS.
- **Tiêu cực / Ràng buộc**:
  - Cần bảo trì các tệp di chuyển cấu trúc cơ sở dữ liệu (`supabase/migrations/`) theo phiên bản.

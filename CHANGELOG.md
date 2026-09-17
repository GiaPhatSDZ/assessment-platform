# Nhật Ký Thay Đổi (Changelog)

Tất cả các thay đổi đáng chú ý đối với dự án **Assessment Studio** sẽ được ghi lại trong tệp này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
và dự án này tuân thủ chuẩn [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-09-17

### Đã Thêm (Added)
- **Tầng Domain & Tính Điểm Toán Học (Deterministic Scoring)**:
  - Triển khai động cơ tính điểm tất định `SCORING_ENGINE_VERSION = "1.0.0"` với chuẩn hóa min/max lý thuyết (0..100).
  - Định nghĩa 4 chiều năng lực: Tư duy phân tích, Giải quyết vấn đề, Hiểu biết AI, Khả năng thích ứng.
  - Phân loại 4 dải kết quả chuẩn mực: Khởi đầu, Đang phát triển, Vững vàng, Xuất sắc.
  - Bộ câu hỏi tham chiếu tiếng Việt 10 câu tình huống thực tế (`ai-career-readiness-v1.ts`).
- **Giao Diện Người Dùng Chuẩn Mobile-First (Design System)**:
  - Khởi tạo design system trên bảng màu Trust Blue và Slate với độ tương phản cao WCAG AAA/AA.
  - Trình làm bài thi từng câu hỏi (Single-Question Runner) với phím tắt bàn phím (1-5, Enter, Back).
  - Biểu đồ mạng nhện SVG (Radar Result) trực quan kèm bản giải trình điểm số chi tiết.
- **Bảo Mật Quyền Sở Hữu Ẩn Danh & Cơ Sở Dữ Liệu Supabase**:
  - Mã token ngẫu nhiên 256-bit lưu qua cookie HttpOnly `assessment_visitor_token` và băm SHA-256 trên cơ sở dữ liệu.
  - 10 bảng dữ liệu PostgreSQL kèm chính sách Row Level Security (RLS) bảo vệ quyền truy cập.
  - Cơ chế suy giảm hữu ích (Fail-useful In-Memory fallback) cho phép chạy hoàn hảo khi chưa cấu hình DB.
- **Nguồn Giới Thiệu & Thống Kê Phễu (Attribution & Analytics)**:
  - Tiếp nhận và chuẩn hóa tham số `?ref=`, khóa phân bổ chạm đầu tiên (first-touch attribution).
  - Bộ ghi nhận sự kiện bảo mật First-Party và adapter tùy chọn PostHog.
- **Thu Thập Lead Có Chủ Đích & Báo Cáo AI Cá Nhân Hóa (AI Report)**:
  - Biểu mẫu thu thập Tên và Email minh bạch khi người dùng yêu cầu báo cáo chi tiết.
  - Adapter AI trung lập với nhà cung cấp (OpenAI / Google Gemini / Mock Fallback).
  - Bản báo cáo năng lực chi tiết kèm kế hoạch hành động 6 tuần do AI đề xuất có lưu đệm bộ nhớ (Cost-Safe Caching).
- **Xác Thực Học Viên & Bảng Điều Khiển Cá Nhân (Dashboard)**:
  - Đăng nhập bảo mật qua liên kết email (Magic Link) với cơ chế chống Open Redirect nghiêm ngặt.
  - Tự động liên kết các bài làm ẩn danh trước đó vào hồ sơ người dùng sau khi xác thực.
  - Bảng điều khiển học viên hiển thị lịch sử làm bài, điểm số 4 chiều và liên kết báo cáo.
- **Khu Vực Quản Trị Hệ Thống (Admin Minimum)**:
  - Phân quyền bảo mật phía máy chủ qua `ADMIN_EMAILS`.
  - Giám sát phễu chuyển đổi thời gian thực: Bắt đầu, Hoàn thành, Lead, Báo cáo AI, Nguồn giới thiệu.
  - Bảng kiểm tra phiên làm bài tối giản, tuân thủ giảm thiểu dữ liệu và bảo vệ quyền riêng tư.
- **Pháp Lý, Khả Năng Tiếp Cận & Tối Ưu Hóa (Hardening)**:
  - Trang Chính sách bảo mật (`/privacy`) và Điều khoản dịch vụ (`/terms`).
  - Tiêu đề bảo mật HTTP (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff).
  - Tự động phát sinh `robots.txt` (chặn lập chỉ mục trang riêng tư) và `sitemap.xml`.
  - Bộ tài liệu quản trị mã nguồn mở (Apache-2.0, Contributing, Code of Conduct, Security).

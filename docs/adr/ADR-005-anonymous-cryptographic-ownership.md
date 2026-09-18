# ADR-005: Xác Thực Quyền Sở Hữu Phiên Ẩn Danh Bằng Mật Mã Học (Anonymous Cryptographic Ownership)

> [!NOTE]
> **HISTORICAL BASELINE**  
> **SUPERSEDED FOR CURRENT PUBLIC PRODUCT DIRECTION**  
> **RETAINED AS REUSABLE PLATFORM-CORE REFERENCE**  
> *This decision record reflects reusable platform-core authentication infrastructure. Current product authority is defined in [docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md](../authority/AI_SCHOOL_CURRENT_AUTHORITY.md).*

## Trạng Thái (Status)
Đã Phê Duyệt (Accepted) — Ngày: 2026-09-17 (Platform Core Reference)

## Bối Cảnh (Context)
Nền tảng cho phép người dùng làm bài đánh giá và nhận kết quả ẩn danh mà không bắt buộc phải đăng ký tài khoản trước. Tuy nhiên, điều này đặt ra thách thức kỹ thuật về bảo mật:
- Làm thế nào để ngăn chặn kẻ tấn công đoán hoặc duyệt mã `sessionId` (ID enumeration / brute-force) để xem kết quả bài làm hoặc thông tin Lead của người khác?
- Làm thế nào để duy trì phiên làm việc khi người dùng tải lại trang mà không làm rò rỉ quyền riêng tư?

## Quyết Định (Decision)
Chúng tôi triển khai cơ chế **Xác thực quyền sở hữu ẩn danh bằng mật mã học (Cryptographic Anonymous Ownership)**:
1. **Khởi tạo mã Token 256-bit**:
   - Khi phiên đánh giá bắt đầu, máy chủ tạo một chuỗi ngẫu nhiên 32 byte an toàn (`crypto.randomBytes(32).toString("hex")`).
2. **Lưu trữ bằng Cookie HttpOnly**:
   - Token được gán vào cookie `assessment_visitor_token` với các thuộc tính bảo mật: `httpOnly: true`, `secure: production`, `sameSite: "lax"`, `maxAge: 1 năm`.
   - JavaScript phía client hoàn toàn không thể truy cập vào cookie này (phòng chống tấn công XSS đánh cắp token).
3. **Băm một chiều SHA-256 trong Cơ sở dữ liệu**:
   - Trên bảng `assessment_sessions`, chỉ lưu trữ giá trị băm `visitor_owner_hash = sha256(visitorToken)`.
   - Ngay cả khi cơ sở dữ liệu bị rò rỉ, kẻ tấn công cũng không thể tạo ra token hợp lệ để mạo danh người dùng.
4. **Xác minh hằng số thời gian (Timing-Safe Verification)**:
   - Sử dụng `crypto.timingSafeEqual` khi so sánh giá trị băm để triệt tiêu nguy cơ tấn công kênh kề (timing side-channel attacks).

## Hệ Quả (Consequences)
- **Tích cực**:
  - Bảo vệ tuyệt đối tính riêng tư của kết quả bài làm: chỉ trình duyệt nắm giữ cookie mới có thể xem hoặc chỉnh sửa bài làm.
  - Ngăn chặn triệt để tấn công đọc trộm kết quả qua việc đoán ID.
  - Trải nghiệm mượt mà, người dùng không cần đăng ký tài khoản mà vẫn bảo mật.
- **Tiêu cực / Ràng buộc**:
  - Nếu người dùng xóa toàn bộ cookie trình duyệt trước khi tạo tài khoản, họ sẽ không thể tự động lấy lại phiên ẩn danh cũ (trừ khi đã đăng nhập qua Magic Link để liên kết `user_id`).

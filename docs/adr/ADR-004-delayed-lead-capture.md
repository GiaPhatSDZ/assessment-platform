# ADR-004: Chiến Lược Thu Thập Lead Có Chủ Đích (Delayed Lead Capture Strategy)

> [!NOTE]
> **HISTORICAL BASELINE**  
> **SUPERSEDED FOR CURRENT PUBLIC PRODUCT DIRECTION**  
> **RETAINED AS REUSABLE PLATFORM-CORE REFERENCE**  
> *This decision record reflects reusable platform-core lead capture infrastructure. Current product authority is defined in [docs/authority/AI_SCHOOL_CURRENT_AUTHORITY.md](../authority/AI_SCHOOL_CURRENT_AUTHORITY.md).*

## Trạng Thái (Status)
Đã Phê Duyệt (Accepted) — Ngày: 2026-09-17 (Platform Core Reference)

## Bối Cảnh (Context)
Nhiều nền tảng trắc nghiệm trực tuyến áp dụng kỹ thuật thao túng (dark pattern): cho người dùng làm bài 10-15 phút rồi bất ngờ chặn màn hình (paywall/email-wall), ép buộc phải nhập email hoặc số điện thoại mới cho xem kết quả. Kỹ thuật này gây ức chế tâm lý cao, dẫn đến tỷ lệ bỏ cuộc lớn và thu thập phải thông tin email rác.

## Quyết Định (Decision)
Chúng tôi áp dụng mô hình **Delayed Lead Capture (Thu thập thông tin tự nguyện có chủ đích)**:
1. **Giá trị tức thì không rào cản**:
   - Ngay sau khi hoàn thành 10 câu hỏi, người học xem ngay lập tức biểu đồ mạng nhện SVG 4 chiều, điểm số toán học chuẩn xác và phân loại dải năng lực mà KHÔNG cần cung cấp bất kỳ thông tin cá nhân nào.
2. **Thu thập Lead gắn liền với giá trị nâng cao**:
   - Biểu mẫu thu thập Tên và Email chỉ xuất hiện như một lựa chọn bổ sung: "Nhận Báo Cáo Phân Tích Chuyên Sâu & Kế Hoạch Hành Động 6 Tuần Từ AI".
3. **Minh bạch & Đồng ý rõ ràng (Explicit Consent)**:
   - Thu thập kèm checkbox đồng ý xử lý dữ liệu và ghi nhận mốc thời gian (`consent_processing_at`).
   - Tuyệt đối không thu thập số điện thoại và không chia sẻ thông tin cho bên thứ ba.

## Hệ Quả (Consequences)
- **Tích cực**:
  - Xây dựng lòng tin thương hiệu vững chắc, trải nghiệm người dùng cao cấp.
  - Tỷ lệ Lead thu được có chất lượng và mức độ quan tâm thực sự cao hơn nhiều so với việc ép buộc.
  - Tuân thủ các nguyên tắc bảo vệ quyền riêng tư hiện đại (GDPR, Decree 13).
- **Tiêu cực / Ràng buộc**:
  - Tổng số lượng email thu thập có thể thấp hơn về mặt số lượng thuần túy so với hình thức chặn ép buộc, nhưng giá trị chuyển đổi thực tế cao hơn.

# ADR-003: Sinh Báo Cáo AI Tùy Chọn Trung Lập Nhà Cung Cấp (Provider-Neutral Optional AI)

## Trạng Thái (Status)
Đã Phê Duyệt (Accepted) — Ngày: 2026-09-17

## Bối Cảnh (Context)
Để hỗ trợ người học có lộ trình phát triển kỹ năng rõ ràng, nền tảng cung cấp bản phân tích năng lực chuyên sâu và kế hoạch hành động 6 tuần do AI đề xuất. Tuy nhiên:
- Khóa chặt vào một nhà cung cấp duy nhất (ví dụ chỉ OpenAI) gây rủi ro phụ thuộc (vendor lock-in) và gián đoạn dịch vụ khi nhà cung cấp gặp sự cố hoặc cấm truy cập địa lý.
- Chi phí token AI có thể tăng vọt nếu người dùng yêu cầu liên tục cùng một báo cáo.

## Quyết Định (Decision)
1. **Cổng trừu tượng hóa `ReportGenerator`**:
   - Tầng Application chỉ phụ thuộc vào interface `ReportGenerator` với phương thức `generateReport(request: ReportGenerationRequest): Promise<ReportGenerationResult>`.
2. **Adapter đa nhà cung cấp**:
   - Hỗ trợ OpenAI (`OpenAILikeReportGenerator`), Google Gemini, và Mock AI (`MockReportGenerator`).
   - Lựa chọn nhà cung cấp linh hoạt qua biến môi trường `AI_PROVIDER`.
3. **Bộ đệm vĩnh viễn (Cost-Safe Caching)**:
   - Khi báo cáo được tạo thành công lần đầu, kết quả JSON có cấu trúc (`report_payload`) được lưu vào bảng `generated_reports`. Các lần truy cập sau được phục vụ trực tiếp từ cơ sở dữ liệu với độ trễ 0ms và chi phí 0 đồng.
4. **Định dạng cấu trúc chặt chẽ bằng Zod**:
   - Toàn bộ kết quả AI bắt buộc tuân thủ `PersonalizedReportSchema` (gồm summary, strengths, growthAreas, 6-week actionPlan, disclaimer).

## Hệ Quả (Consequences)
- **Tích cực**:
  - Tự do chuyển đổi giữa OpenAI, Gemini, hoặc mô hình cục bộ mà không cần sửa đổi mã nguồn nghiệp vụ.
  - Tiết kiệm chi phí vận hành tối đa nhờ cơ chế lưu đệm.
  - Khả năng kiểm thử tự động với Mock AI mà không tốn chi phí API.
- **Tiêu cực / Ràng buộc**:
  - Cần duy trì các prompt tương thích cho nhiều họ mô hình khác nhau.

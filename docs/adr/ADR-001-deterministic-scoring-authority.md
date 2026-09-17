# ADR-001: Thẩm Quyền Điểm Số Toán Học Tất Định (Deterministic Scoring Authority)

## Trạng Thái (Status)
Đã Phê Duyệt (Accepted) — Ngày: 2026-09-17

## Bối Cảnh (Context)
Nhiều nền tảng đánh giá hiện nay sử dụng mô hình ngôn ngữ lớn (LLM) để vừa chấm điểm, vừa phân tích bài làm. Cách làm này mang lại nhiều rủi ro nghiêm trọng:
- Kết quả không tất định: Cùng một bộ câu trả lời có thể cho ra các điểm số khác nhau qua từng lần chạy.
- Hiện tượng ảo giác (hallucination): LLM có thể phát minh ra tiêu chuẩn chấm không có cơ sở lý thuyết.
- Chi phí hạ tầng cao và độ trễ lớn (2-5 giây để tính một bài kiểm tra).

## Quyết Định (Decision)
Chúng tôi quyết định thiết lập **Động cơ tính điểm toán học tất định (Deterministic Scoring Engine)** tại tầng Domain (`src/domain/assessment/scoring.ts`) làm **thẩm quyền tối cao và duy nhất**:
1. Điểm số của mỗi chiều năng lực được tính bằng công thức toán học nội bộ:
   - Tổng điểm thô (raw score) từ các lựa chọn trọng số (1..5).
   - Chuẩn hóa trên khoảng min/max lý thuyết của bài đánh giá sang thang đo 0..100.
2. Mô hình AI tuyệt đối không bao giờ được tính toán điểm, thay đổi điểm số, hay quyết định xếp loại năng lực.
3. Động cơ tính điểm được gán phiên bản rõ ràng (`SCORING_ENGINE_VERSION = "1.0.0"`).

## Hệ Quả (Consequences)
- **Tích cực**:
  - Độ tin cậy và minh bạch toán học tuyệt đối: 100% tái lập được kết quả.
  - Tốc độ phản hồi tức thì (< 10ms) cho kết quả điểm số.
  - Tiết kiệm 100% chi phí AI cho các lượt làm bài chỉ xem kết quả toán học.
- **Tiêu cực / Ràng buộc**:
  - Cần tác giả hóa bộ câu hỏi cẩn thận với trọng số và ma trận đóng góp rõ ràng.

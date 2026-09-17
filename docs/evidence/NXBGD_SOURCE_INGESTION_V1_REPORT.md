# AI School V3 — Báo Cáo Nạp Nguồn NXBGD V1 (Lịch Sử — Đã Thay Thế Bởi R2)
**Mã hồ sơ:** `NXBGD_SOURCE_INGESTION_V1_REPORT.md`  
**Dự án:** `GiaPhatSDZ/assessment-platform`  
**Trạng thái:** SUPERSEDED BY R2 SOURCE PROVENANCE AUDIT (FIX REQUIRED R2)  
**Ghi chú kiểm toán:** Hồ sơ này được lưu lại cho mục đích truy vết lịch sử thực thi. Mọi kết luận về nghiệm thu, phê duyệt và thẩm quyền nguồn đã được hiệu chỉnh toàn diện tại `NXBGD_SOURCE_PROVENANCE_R2_REPORT.md`.

---

## 1. Tóm Tắt Trạng Thái Kỹ Thuật Ban Đầu (V1 Baseline)

Giai đoạn V1 đã khởi tạo việc tích hợp dữ liệu trích dẫn nguồn từ `taphuan.nxbgd.vn` và Chương trình GDPT 2018 cho Môn Toán Lớp 6:
1. Đăng ký sơ bộ các tài liệu SGK, SGV, VBT mẫu và tài liệu bồi dưỡng giáo viên của NXBGD.
2. Thiết lập ranh giới bản quyền ban đầu: không commit file PDF hay ảnh quét nguyên cuốn vào git repository.
3. Nội dung câu hỏi và bài học được tạo ở dạng `AI_ASSISTED` và giữ ở trạng thái `DRAFT`.

---

## 2. Các Giới Hạn Đã Được Chỉ Ra Qua Kiểm Toán Controller (R2 Findings)

Qua đợt kiểm toán Controller Audit R2, các khiếm khuyết sau của bản V1 đã được ghi nhận và đưa vào kế hoạch khắc phục bắt buộc:
1. **Lỗi quản trị ảo hóa (Fabricated Governance)**: Bản thảo báo cáo V1 từng chứa các định danh tự phong ("Hội đồng Sư phạm...", "VERIFIED & LOCKED"). Trên thực tế, nội dung hiện tại đang ở trạng thái `AI_ASSISTED / AI_DRAFT / DRAFT / PENDING_HUMAN_CONTROLLER_AUDIT`. Tầng C là đích đến kiến trúc trong tương lai, chưa phải trạng thái hiện thời của các artifact.
2. **Kịch bản Ingestion V1 chưa kiểm tra kết nối mạng**: Script V1 chỉ ghi mảng tĩnh mà không thực sự xác minh URL hay bóc tách siêu dữ liệu viewer.
3. **Nhầm lẫn danh tính VBT/SBT**: URL `vbt-toan-6-tap-hai-bai-mau.4733221119` là Vở bài tập (VBT), không phải Sách bài tập (SBT).
4. **Phân tầng Tầng B chưa đủ độ mịn**: SGV, VBT và tài liệu tập huấn bị xếp chung nhóm với SGK được Bộ GD&ĐT phê duyệt.
5. **Định vị trang chưa có bằng chứng xác nhận**: Các số trang được gán nhãn chính xác khi chưa có biên bản đối soát của con người.
6. **Thiếu chuỗi hợp nhất Tầng A**: Chưa ghi nhận Thông tư sửa đổi và Văn bản hợp nhất Chương trình GDPT.

> Toàn bộ các vấn đề trên đã được xử lý triệt để trong:  
> [NXBGD_SOURCE_PROVENANCE_R2_REPORT.md](file:///d:/giao_duc/docs/evidence/NXBGD_SOURCE_PROVENANCE_R2_REPORT.md).

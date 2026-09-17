import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Database, Sparkles, UserCheck } from "lucide-react";
import { siteConfig } from "@/src/config/site";

export const metadata = {
  title: `Chính Sách Bảo Mật & Quyền Riêng Tư | ${siteConfig.name}`,
  description:
    "Cam kết minh bạch về dữ liệu: Thu thập tối thiểu, ẩn danh theo mặc định, không bao giờ thu thập số điện thoại, và điểm số được tính toán hoàn toàn bằng toán học độc lập.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Back navigation */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Trở về trang chủ</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Bảo Vệ Quyền Riêng Tư & Minh Bạch Dữ Liệu</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cập nhật lần cuối: Ngày 17 tháng 09 năm 2026 • Phiên bản chính thức V1.0
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <Lock className="h-4 w-4" />
              <span>Ẩn Danh Mặc Định</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn làm bài đánh giá hoàn toàn ẩn danh. Hệ thống chỉ gán một mã định danh ngẫu nhiên mã hóa qua cookie HttpOnly để bạn không bị mất tiến trình khi tải lại trang.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <UserCheck className="h-4 w-4" />
              <span>Không Thu Thập Số Điện Thoại</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Chúng tôi cam kết không thu thập số điện thoại, thông tin sinh trắc, hay dữ liệu định danh nhạy cảm. Không bao giờ thực hiện cuộc gọi làm phiền hay telesales.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Thông Tin Chúng Tôi Thu Thập
            </h2>
            <p>
              Nền tảng thực thi nguyên tắc giảm thiểu dữ liệu (Data Minimization). Chúng tôi chỉ lưu trữ các thông tin kỹ thuật tối thiểu cần thiết để vận hành:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong>Câu trả lời bài đánh giá:</strong> 10 lựa chọn thang đo tương ứng với bài đánh giá năng lực nghề nghiệp kỷ nguyên AI.
              </li>
              <li>
                <strong>Mã phiên làm việc ẩn danh:</strong> Chuỗi mã hóa ngẫu nhiên 256-bit lưu trong cookie bảo mật HttpOnly (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded dark:bg-slate-800">assessment_visitor_token</code>) để xác thực quyền xem kết quả của chính bạn.
              </li>
              <li>
                <strong>Thông tin liên hệ tự nguyện (Delayed Capture):</strong> Chỉ khi bạn chủ động yêu cầu bản báo cáo chi tiết kèm kế hoạch hành động 6 tuần do AI đề xuất, chúng tôi mới tiếp nhận tên hiển thị và địa chỉ email của bạn cùng thời điểm đồng ý rõ ràng.
              </li>
              <li>
                <strong>Mã nguồn giới thiệu:</strong> Tham số đường dẫn (ví dụ <code className="text-xs bg-slate-100 px-1 py-0.5 rounded dark:bg-slate-800">?ref=DEMO123</code>) nhằm thống kê hiệu quả kênh truyền thông.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Thẩm Quyền Điểm Số Toán Học & Vai Trò Của AI
            </h2>
            <p>
              Chúng tôi thiết lập ranh giới kiến trúc tuyệt đối giữa tính toán điểm số và diễn giải văn bản:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong>Thuật toán tính điểm tất định (Deterministic Scoring Engine):</strong> Điểm số 4 chiều năng lực (Tư duy phân tích, Giải quyết vấn đề, Hiểu biết AI, Khả năng thích ứng) được tính toán 100% bằng công thức toán học nội bộ trên máy chủ.
              </li>
              <li>
                <strong>Mô hình Trí Tuệ Nhân Tạo (AI):</strong> AI không bao giờ được phép tính toán, chỉnh sửa hay can thiệp vào điểm số của bạn. AI chỉ đóng vai trò hỗ trợ diễn giải văn phong và đề xuất lịch trình học tập 6 tuần dựa trên kết quả toán học đã được chốt.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Chia Sẻ Dữ Liệu Với Bên Thứ Ba
            </h2>
            <p>
              Chúng tôi không bán, trao đổi hoặc thương mại hóa dữ liệu cá nhân của bạn dưới bất kỳ hình thức nào. Dữ liệu chỉ được xử lý bởi các nhà cung cấp hạ tầng đáng tin cậy phục vụ vận hành:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong>Cơ sở dữ liệu & Xác thực:</strong> Supabase (PostgreSQL) với chính sách bảo mật cấp hàng (Row Level Security).
              </li>
              <li>
                <strong>Mô hình ngôn ngữ (Khi có yêu cầu báo cáo):</strong> API của nhà cung cấp AI (OpenAI/Google Gemini). Dữ liệu gửi đi chỉ gồm điểm số và chủ đề năng lực, không bao gồm thông tin mật khẩu hay cookie trình duyệt.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Quyền Của Bạn Đối Với Dữ Liệu
            </h2>
            <p>
              Bạn có toàn quyền kiểm soát thông tin của mình bất cứ lúc nào:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Yêu cầu xóa toàn bộ lịch sử làm bài và thông tin liên hệ đã đăng ký.</li>
              <li>Yêu cầu trích xuất dữ liệu bài đánh giá cá nhân dưới định dạng chuẩn.</li>
              <li>Hủy đăng ký nhận các thông tin cập nhật thông qua liên kết ở cuối mỗi email.</li>
            </ul>
            <p className="pt-1">
              Để thực thi các quyền trên, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật qua email:{" "}
              <a
                href="mailto:privacy@assessment-platform.org"
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                privacy@assessment-platform.org
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

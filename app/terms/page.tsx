import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, AlertTriangle, Scale, Code } from "lucide-react";
import { siteConfig } from "@/src/config/site";

export const metadata = {
  title: `Điều Khoản Sử Dụng | ${siteConfig.name}`,
  description:
    "Điều khoản sử dụng nền tảng đánh giá: Công cụ tự soi chiếu và nâng cao năng lực, không thay thế chẩn đoán y khoa hay cam kết tuyển dụng.",
};

export default function TermsPage() {
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
            <Scale className="h-4 w-4" />
            <span>Quy Định & Trách Nhiệm Sử Dụng Nền Tảng</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Điều Khoản Dịch Vụ
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cập nhật lần cuối: Ngày 17 tháng 09 năm 2026 • Áp dụng cho người dùng toàn cầu
          </p>
        </div>

        {/* Prominent Disclaimer Alert */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/50 dark:bg-amber-950/30 flex items-start gap-3.5">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 dark:text-amber-400" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
              Tuyên bố từ chối trách nhiệm quan trọng
            </h3>
            <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
              Bài đánh giá là công cụ tự soi chiếu và tham vấn phát triển bản thân. Kết quả điểm số và phân tích KHÔNG phải là chẩn đoán y khoa, tâm thần học, bài thi tuyển dụng chính thức, và KHÔNG đảm bảo bất kỳ mức lương hay vị trí công việc cụ thể nào.
            </p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Mục Đích Của Nền Tảng
            </h2>
            <p>
              Nền tảng {siteConfig.name} cung cấp các bộ câu hỏi tình huống thực tế nhằm giúp người học và chuyên gia tự đánh giá mức độ sẵn sàng nghề nghiệp trong bối cảnh ứng dụng trí tuệ nhân tạo (AI). Nền tảng hướng tới mục tiêu cung cấp góc nhìn tham khảo mang tính xây dựng để lập kế hoạch tự học tập và rèn luyện kỹ năng cá nhân.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Trách Nhiệm Của Người Dùng
            </h2>
            <p>
              Khi tham gia làm bài đánh giá và sử dụng các tính năng trên nền tảng, bạn đồng ý rằng:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Cung cấp thông tin trung thực dựa trên trải nghiệm và cách tư duy thực tế của bản thân.</li>
              <li>Chịu trách nhiệm hoàn toàn đối với mọi quyết định nghề nghiệp, học tập, hoặc đầu tư phát triển chuyên môn của mình.</li>
              <li>Không sử dụng các biện pháp kỹ thuật nhằm tấn công, phá hoại, gửi yêu cầu hàng loạt (DDoS/spam), hoặc trích xuất tự động trái phép mã nguồn và nội dung độc quyền.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Giấy Phép Mã Nguồn Mở & Quyền Sở Hữu Trí Tuệ
            </h2>
            <p>
              Nền tảng {siteConfig.name} được phát triển theo mô hình mã nguồn mở dưới giấy phép{" "}
              <strong>Apache License 2.0</strong>.
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Code className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                Mã nguồn khung nền tảng được phát hành tự do theo giấy phép Apache-2.0. Bộ câu hỏi và bản quyền thương hiệu thuộc về đơn vị sáng lập.
              </span>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Giới Hạn Trách Nhiệm Pháp Lý
            </h2>
            <p>
              Trong giới hạn tối đa được pháp luật hiện hành cho phép, đội ngũ sáng lập và người đóng góp cho dự án sẽ không chịu trách nhiệm đối với bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc phái sinh nào phát sinh từ việc sử dụng hoặc không thể sử dụng kết quả đánh giá và các khuyến nghị do hệ thống đưa ra.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              5. Sửa Đổi & Liên Hệ
            </h2>
            <p>
              Chúng tôi có quyền cập nhật các điều khoản này khi mở rộng thêm các tính năng mới. Mọi thắc mắc về điều khoản dịch vụ xin vui lòng gửi về:{" "}
              <a
                href="mailto:contact@assessment-platform.org"
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                contact@assessment-platform.org
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

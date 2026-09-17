import React from "react";
import Link from "next/link";
import { BookOpen, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export function CurriculumTrustSection() {
  return (
    <section className="py-16 md:py-20 border-b border-warm-200/80 bg-warm-50/50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-edu-700 dark:text-edu-400 mb-2">
            2. Thẩm quyền chương trình (Curriculum-Backed Trust)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Chuẩn Hóa Theo Khung Năng Lực Quốc Gia
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Chúng tôi không cho phép AI tự suy diễn mục tiêu học tập hay tự sinh bài thi trắc nghiệm ngẫu nhiên. Mọi bài chẩn đoán đều được các chuyên gia sư phạm đối soát từng từ với văn bản chính thức của Bộ Giáo dục và Đào tạo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-warm-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-edu-50 text-edu-700 dark:bg-edu-950 dark:text-edu-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Căn cứ Thông tư 32/2018
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mã nguồn tài liệu <code>SRC-VN-MOET-MATH-2018</code> quy định chi tiết chuẩn đầu ra, mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng) cho từng lớp học.
            </p>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-edu-50 text-edu-700 dark:bg-edu-950 dark:text-edu-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Đồ thị tiên quyết không chu trình (DAG)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mối quan hệ giữa các bài học được cấu trúc toán học chặt chẽ. Hệ thống tự động kiểm tra tính chu trình để đảm bảo không xảy ra nghịch lý tiên quyết.
            </p>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-edu-50 text-edu-700 dark:bg-edu-950 dark:text-edu-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Minh bạch phạm vi bao phủ
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Phần nào đã có chẩn đoán được công bố rõ ràng. Phần nào chưa đủ bằng chứng được gắn nhãn <code>BLOCKED_BY_EVIDENCE</code> thay vì tạo nội dung giả lập.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-2 text-xs font-semibold text-edu-700 hover:text-edu-800 dark:text-edu-400"
          >
            <span>Tra cứu sổ đăng ký nguồn & bản đồ chương trình chi tiết</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

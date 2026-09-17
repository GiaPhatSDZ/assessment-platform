import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Ban, ArrowRight } from "lucide-react";

export function CatalogPreviewSection() {
  return (
    <section className="py-16 md:py-20 border-b border-warm-200/80 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-edu-700 dark:text-edu-400 mb-2">
              3. Danh mục khối lớp & môn học (Catalog Preview)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Phạm Vi Chẩn Đoán Hiện Tại
            </h2>
          </div>
          <Link
            href="/curriculum"
            className="text-xs font-semibold text-edu-700 hover:text-edu-800 dark:text-edu-400"
          >
            Xem bảng đối soát đầy đủ →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Math Grade 6 - ACTIVE */}
          <div className="rounded-2xl border border-edu-300 bg-edu-50/40 p-6 space-y-4 dark:border-edu-800 dark:bg-edu-950/20 ring-1 ring-edu-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-edu-800 dark:text-edu-300">Toán Lớp 6 (THCS)</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3 w-3" />
                <span>Đã có chẩn đoán</span>
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Phân Số & Phép Tính Phân Số
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bao gồm đầy đủ 4 nút kiến thức liên hoàn: BCNN, Cộng cùng mẫu, Quy đồng mẫu số và Cộng phân số khác mẫu.
            </p>

            <div className="pt-2">
              <Link
                href="/diagnostic/math-grade6"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-edu-700 hover:text-edu-800 dark:text-edu-400"
              >
                <span>Bắt đầu chẩn đoán Toán 6</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Math Upper Secondary - IN PROGRESS */}
          <div className="rounded-2xl border border-warm-200 bg-warm-50/40 p-6 space-y-4 opacity-75 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400">Toán Lớp 7 - 9 (THCS)</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                <Clock className="h-3 w-3" />
                <span>Đang biên soạn</span>
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Số Hữu Tỉ & Đại Số Tuyến Tính
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Đang hoàn thiện ngân hàng câu hỏi chẩn đoán và phân tích các dạng ngộ nhận hình học, đại số.
            </p>

            <div className="pt-2 text-xs text-slate-400 italic">
              Dự kiến ra mắt Quý 4/2026
            </div>
          </div>

          {/* Card 3: Other subjects - BLOCKED BY EVIDENCE */}
          <div className="rounded-2xl border border-dashed border-slate-300 bg-warm-50/20 p-6 space-y-4 opacity-60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Môn Học Khác & THPT</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                <Ban className="h-3 w-3" />
                <span>Chưa hỗ trợ</span>
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Khoa Học Tự Nhiên & Tiếng Anh
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Tuyệt đối không mở chẩn đoán khi chưa có đồ thị chuẩn mực và câu hỏi được kiểm định thực tế.
            </p>

            <div className="pt-2 text-xs text-slate-400 font-mono">
              BLOCKED_BY_EVIDENCE
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

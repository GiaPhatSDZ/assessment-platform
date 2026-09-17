import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-edu-200 bg-edu-50/70 p-8 sm:p-14 text-center dark:border-edu-900 dark:bg-edu-950/30 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-edu-800 border border-edu-200 shadow-2xs dark:bg-slate-900 dark:text-edu-300 dark:border-edu-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-edu-700" />
            <span>Trải nghiệm miễn phí trong 5 phút</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white max-w-2xl mx-auto leading-tight">
            Giúp Con Tự Tin Môn Toán Ngay Hôm Nay
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Chỉ với 4 câu hỏi nhận thức, phụ huynh sẽ nhìn thấy chính xác nút kiến thức con đang vướng và nhận ngay gói học bù trọng tâm chuẩn Bộ GD&ĐT.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/learn/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-edu-700 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-edu-800 transition-all active:scale-[0.98]"
            >
              <span>Bắt đầu kiểm tra kiến thức</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/curriculum"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-warm-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-warm-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Xem bản đồ chương trình K–12
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/90 px-3.5 py-1 text-xs font-semibold text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
          <span>Hệ Thống Kiểm Soát Lỗ Hổng Kiến Thức · Chuẩn Bộ GD&ĐT</span>
        </div>

        <h1 className="mt-6 font-serif text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white leading-[1.15]">
          Con không chỉ cần học thêm. <br />
          Con cần biết chính xác mình <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-200 underline-offset-8">đang hổng kiến thức nào</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300 leading-relaxed">
          Không chấm điểm số chung chung, không phỏng đoán năng lực bằng AI. Hệ thống lần theo cây tri thức tiên quyết, tìm ra nguyên nhân gốc rễ (ví dụ: hổng BCNN dẫn đến sai phép cộng phân số), và cung cấp tài liệu nguồn chuẩn để học lại.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/diagnostic/math-grade6"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <span>Bắt đầu chẩn đoán Toán Lớp 6 (Miễn phí)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Quy trình 4 bước khép kín
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Không yêu cầu Số điện thoại</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Không telesale quảng cáo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Căn cứ Thông tư 32/2018/TT-BGDĐT</span>
          </div>
        </div>
      </div>
    </section>
  );
}

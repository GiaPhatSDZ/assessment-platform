"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, BookOpen } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-warm-200/70 bg-gradient-to-b from-white to-warm-50/50 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-edu-200 bg-edu-50/90 px-4 py-1.5 text-xs font-semibold text-edu-900 dark:border-edu-900/60 dark:bg-edu-950/40 dark:text-edu-300 shadow-2xs">
          <BookOpen className="h-3.5 w-3.5 text-edu-700" />
          <span>Hệ Thống Kiểm Soát Lỗ Hổng Kiến Thức · Chuẩn Bộ GD&ĐT</span>
        </div>

        {/* H1 - Exact spec text */}
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white leading-[1.18] max-w-4xl mx-auto">
          Tìm đúng chỗ con đang hổng. <br className="hidden sm:inline" />
          Học lại <span className="text-edu-700 dark:text-edu-400 underline decoration-edu-200 underline-offset-8">đúng phần cần thiết</span>.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Không chấm điểm số chung chung, không phỏng đoán năng lực bằng AI. Hệ thống lần theo cây tri thức tiên quyết, tìm ra nguyên nhân gốc rễ và cung cấp tài liệu nguồn chuẩn để học lại.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/learn/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-edu-700 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-edu-800 transition-all active:scale-[0.98]"
          >
            <span>Bắt đầu kiểm tra kiến thức</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-warm-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-warm-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Xem cách hệ thống hoạt động
          </a>
        </div>

        {/* Three Transparent Commitments */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-edu-600" />
            <span>Không số điện thoại bắt buộc</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-edu-600" />
            <span>Không telesale quảng cáo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-edu-600" />
            <span>Căn cứ Thông tư 32/2018/TT-BGDĐT</span>
          </div>
        </div>
      </div>
    </section>
  );
}

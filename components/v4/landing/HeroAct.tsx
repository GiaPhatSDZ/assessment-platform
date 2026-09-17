"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles, BookMarked } from "lucide-react";

export function HeroAct() {
  return (
    <section className="relative pt-6 pb-16 sm:pt-10 sm:pb-24 lg:pt-14 lg:pb-32 overflow-hidden">
      {/* Ambient background glow behind the right side (soft, restrained, no neon) */}
      <div
        className="pointer-events-none absolute -top-24 right-0 -z-10 h-[640px] w-[640px] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(221, 235, 227, 0.9) 0%, rgba(248, 234, 193, 0.5) 45%, rgba(245, 241, 232, 0) 70%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(86vh-80px)]">
          {/* Left Column: 5 Cols on Desktop - Editorial Brand Message */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-semibold text-ink leading-[1.04] tracking-tight">
                Tìm đúng chỗ con đang hổng.{" "}
                <span className="italic font-normal text-brand block mt-1">
                  Học lại đúng phần cần thiết.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-normal pt-1">
                Theo chương trình học đã được kiểm duyệt, hệ thống lần theo kiến thức nền,
                chỉ ra phần cần củng cố và kiểm tra lại sau khi học.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/learn/new"
                className="inline-flex items-center justify-center gap-2 rounded-app bg-brand px-7 py-3.5 text-sm font-medium text-white shadow-2xs hover:bg-brand-dark transition-all active:scale-[0.98]"
              >
                <span>Bắt đầu kiểm tra kiến thức</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#gap-story"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
              >
                <span>Xem một lỗ hổng được tìm như thế nào</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Quiet Ethical Trust Statement */}
            <div className="pt-4 border-t border-line/50">
              <p className="text-xs text-ink-muted flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Theo nguồn chương trình</span>
                <span className="text-line">•</span>
                <span>Không xếp hạng trẻ</span>
                <span className="text-line">•</span>
                <span>Có bằng chứng cho từng kết luận</span>
              </p>
            </div>
          </div>

          {/* Right Column: 7 Cols on Desktop - Actual Product Scene: KnowledgePathPreview */}
          <div className="lg:col-span-7">
            <div className="relative rounded-marketingWindow border border-line/80 bg-surface p-5 sm:p-7 shadow-xs">
              {/* Product Window Top Bar */}
              <div className="flex items-center justify-between border-b border-line/50 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-line" />
                  <span className="h-2.5 w-2.5 rounded-full bg-line" />
                  <span className="h-2.5 w-2.5 rounded-full bg-line" />
                  <span className="ml-2 text-2xs font-mono text-ink-muted uppercase tracking-wider">
                    Bản đồ tri thức tiên quyết · Toán Lớp 6
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-2xs font-medium text-brand bg-brand-soft/70 px-2.5 py-1 rounded-pill">
                  <BookMarked className="h-3 w-3" />
                  GDPT 2018
                </span>
              </div>

              {/* Connected Knowledge Path Visual Motif */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Chuỗi mắt xích cần đạt được phát hiện:
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                  {/* Node 1: Foundation (Mastered) */}
                  <div className="relative flex items-start gap-3 bg-canvas/60 rounded-app p-3 border border-line/40">
                    <span className="absolute -left-6 top-3.5 h-3 w-3 rounded-full border-2 border-surface bg-brand" />
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-ink truncate">
                          Phép nhân & chia phân số (Tiểu học)
                        </span>
                        <span className="text-2xs font-medium text-brand bg-brand-soft/50 px-2 py-0.5 rounded-pill shrink-0">
                          Đã nắm vững
                        </span>
                      </div>
                      <p className="text-2xs text-ink-muted mt-0.5">
                        Làm đúng 3/3 bài kiểm tra cơ bản.
                      </p>
                    </div>
                  </div>

                  {/* Node 2: Prerequisite Gap (Root cause highlighted!) */}
                  <div className="relative flex items-start gap-3 bg-danger-soft/40 rounded-app p-3.5 border border-danger/30 shadow-2xs">
                    <span className="absolute -left-6 top-4 h-3 w-3 rounded-full border-2 border-surface bg-danger animate-ping" />
                    <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-danger truncate">
                          Quy đồng mẫu số hai phân số (Mắt xích gốc)
                        </span>
                        <span className="text-2xs font-semibold text-danger bg-surface px-2 py-0.5 rounded-pill shrink-0 border border-danger/20">
                          Cần củng cố trước
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-1 leading-snug">
                        Con gặp ngộ nhận: cộng trực tiếp cả tử số và mẫu số do chưa nắm vững bước tìm mẫu số chung.
                      </p>
                    </div>
                  </div>

                  {/* Node 3: Target Task (In Progress) */}
                  <div className="relative flex items-start gap-3 bg-canvas/60 rounded-app p-3 border border-line/40">
                    <span className="absolute -left-6 top-3.5 h-3 w-3 rounded-full border-2 border-surface bg-line" />
                    <span className="h-4 w-4 rounded-full border border-line flex items-center justify-center text-2xs text-ink-muted shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-ink truncate">
                          Phép cộng hai phân số khác mẫu số (Lớp 6)
                        </span>
                        <span className="text-2xs font-medium text-ink-muted bg-surface px-2 py-0.5 rounded-pill shrink-0">
                          Mục tiêu hiện tại
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Embedded Contextual Parent Companion Callout */}
                <div className="mt-5 rounded-app bg-surfaceStrong border border-line/70 p-3.5 flex items-start gap-3">
                  <div className="h-7 w-7 rounded-md bg-brand-soft/70 flex items-center justify-center text-brand shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-medium text-ink">
                      Gợi ý đồng hành cho phụ huynh tối nay:
                    </div>
                    <p className="text-ink-muted leading-relaxed text-2xs">
                      &ldquo;Khi con làm bài cộng phân số, đừng mắng con ẩu. Hãy cùng con vẽ hai chiếc bánh pizza cắt thành 8 và 12 miếng để con thấy vì sao phải quy về cùng kích cỡ mẫu số trước.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

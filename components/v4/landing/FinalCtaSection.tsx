import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-28 border-t border-line/60 bg-surface">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink leading-tight">
            Giúp con tự tin học tập từ việc củng cố đúng mắt xích nền tảng.
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-normal">
            Không cần số điện thoại bắt buộc. Không xếp hạng thi đua. Chỉ có lộ trình học bù rõ ràng, dựa trên chuẩn chương trình GDPT 2018.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/learn/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-app bg-brand px-8 py-3.5 text-sm font-medium text-white shadow-2xs hover:bg-brand-dark transition-all active:scale-[0.98]"
          >
            <span>Bắt đầu kiểm tra kiến thức</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/curriculum"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-app border border-line bg-canvas px-6 py-3.5 text-sm font-medium text-ink hover:bg-surface transition-all"
          >
            Xem bản đồ chương trình K–12
          </Link>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
          <ShieldCheck className="h-4 w-4 text-brand" />
          <span>Bảo mật quyền riêng tư học sinh • Không số điện thoại bắt buộc</span>
        </div>
      </div>
    </section>
  );
}

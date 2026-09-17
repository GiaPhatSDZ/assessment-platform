import React from "react";
import Link from "next/link";
import { siteConfig } from "@/src/config/site";
import { ShieldCheck, BookOpen, GraduationCap } from "lucide-react";

export function ProductFooter() {
  return (
    <footer className="border-t border-warm-200 bg-white dark:border-slate-800 dark:bg-slate-900 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-edu-700 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-edu-600" />
                <span>Không số điện thoại bắt buộc</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-edu-600" />
                <span>Căn cứ Thông tư 32/2018/TT-BGDĐT</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Điều hướng học tập
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/learn" className="text-slate-600 hover:text-edu-700 dark:text-slate-400">
                  Góc học tập cá nhân
                </Link>
              </li>
              <li>
                <Link href="/learn/new" className="text-slate-600 hover:text-edu-700 dark:text-slate-400">
                  Bắt đầu chẩn đoán mới
                </Link>
              </li>
              <li>
                <Link href="/curriculum" className="text-slate-600 hover:text-edu-700 dark:text-slate-400">
                  Bản đồ chương trình K–12
                </Link>
              </li>
              <li>
                <Link href="/parent" className="text-slate-600 hover:text-edu-700 dark:text-slate-400">
                  Dành cho phụ huynh
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Minh bạch & Pháp lý
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-edu-700 dark:text-slate-400">
                  Chính sách bảo mật dữ liệu
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-edu-700 dark:text-slate-400">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Hỗ trợ: {siteConfig.supportEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-warm-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Nghiên cứu độc lập dựa trên khung năng lực Bộ GD&ĐT.</p>
          <p>Không dùng AI phán đoán năng lực · Động cơ phân tích lỗ hổng tất định.</p>
        </div>
      </div>
    </footer>
  );
}

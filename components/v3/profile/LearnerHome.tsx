"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  History,
} from "lucide-react";

interface LearnerHomeProps {
  user?: {
    displayName?: string | null;
    email?: string | null;
  };
}

export function LearnerHome({ user }: LearnerHomeProps) {
  const learnerName = user?.displayName || user?.email || "Học sinh";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-edu-700 dark:text-edu-400">
            <GraduationCap className="h-4 w-4" />
            <span>Góc Học Tập Cá Nhân</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Chào mừng trở lại, {learnerName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Theo dõi chính xác tiến trình làm chủ các mắt xích kiến thức chuẩn Bộ GD&ĐT.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/learn/new"
            className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition active:scale-[0.98]"
          >
            <span>Bắt đầu chẩn đoán kiến thức</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/learn/history"
            className="inline-flex items-center gap-1.5 rounded-xl border border-warm-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-warm-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <History className="h-3.5 w-3.5" />
            <span>Lịch sử</span>
          </Link>
        </div>
      </div>

      {/* Current Active Subject & Topic Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Trạng thái chẩn đoán kiến thức
            </h2>
            <Link
              href="/curriculum"
              className="text-xs font-semibold text-edu-700 hover:text-edu-800 dark:text-edu-400"
            >
              Xem toàn bộ chương trình →
            </Link>
          </div>

          {/* Truthful Empty Learner State */}
          <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-warm-100 p-3 text-warm-700 dark:bg-slate-800 dark:text-slate-300">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chưa có dữ liệu khảo sát được ghi nhận
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Học sinh chưa hoàn thành bài khảo sát chẩn đoán nào. AI School chỉ xác nhận năng lực dựa trên bằng chứng kiểm tra thực tế đối chiếu với đồ thị kiến thức chuẩn Bộ GD&ĐT, tuyệt đối không gán điểm năng lực suy diễn.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/learn/new"
                className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition"
              >
                <span>Bắt đầu chẩn đoán kiến thức</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Explicitly Badged Illustrative Demonstration Card */}
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Ví dụ minh họa
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Mô hình báo cáo sau khi hoàn thành chẩn đoán
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  Chủ đề: Phép cộng phân số (Toán Lớp 6)
                </h4>
              </div>
              <span className="text-[11px] italic text-slate-500 dark:text-slate-400">
                Không phải kết quả thực tế
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
              Ví dụ minh họa: Giao diện dưới đây minh họa cách hệ thống theo dõi trạng thái từng mắt xích kiến thức thành phần, thay vì cho điểm số chung chung.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                <div className="text-slate-500 text-[11px]">BCNN (Lớp 6)</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300 mt-1">Ví dụ minh họa</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                <div className="text-slate-500 text-[11px]">Cộng cùng mẫu (Lớp 4)</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300 mt-1">Ví dụ minh họa</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                <div className="text-slate-500 text-[11px]">Quy đồng mẫu số</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300 mt-1">Ví dụ minh họa</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                <div className="text-slate-500 text-[11px]">Cộng khác mẫu</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300 mt-1">Ví dụ minh họa</div>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-slate-500">
              Trạng thái bằng chứng: <em>Ví dụ minh họa (Chưa có dữ liệu bài thi của học sinh)</em>
            </div>
          </div>
        </div>

        {/* Sidebar: Recommended Next Step */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Hành động tiếp theo
          </h2>

          <div className="rounded-2xl border border-edu-200 bg-edu-50/50 p-5 shadow-xs space-y-3 dark:border-edu-900/60 dark:bg-edu-950/20">
            <div className="flex items-center gap-2 text-edu-800 dark:text-edu-300 font-bold text-xs">
              <Sparkles className="h-4 w-4" />
              <span>Chẩn đoán chủ đề mới</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Thực hiện bài chẩn đoán để hệ thống lập bản đồ chính xác các mắt xích kiến thức đã vững hoặc cần củng cố.
            </p>
            <Link
              href="/learn/new"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-edu-700 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition"
            >
              <span>Chọn bài kiểm tra mới</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-xs text-xs space-y-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="font-bold text-slate-900 dark:text-white">Quy tắc chấm điểm GDPT 2018:</div>
            <p className="text-slate-500 leading-relaxed">
              Hệ thống không tính điểm trung bình tổng quát <code>/100</code> hay gán nhãn năng lực suy diễn. Năng lực được ghi nhận độc lập cho từng nút kiến thức dựa trên bằng chứng khảo sát thực tế.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

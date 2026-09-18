"use client";

import React, { useState } from "react";
import Link from "next/link";
import { History, CheckCircle2, ArrowRight, BookOpen, AlertCircle, Info } from "lucide-react";

export interface HistoryItemDisplay {
  id: string;
  date: string;
  nodeId: string;
  previousState: string;
  newState: string;
  confidence: string;
  reasonCode: string;
}

export interface LearnerHistoryProps {
  events?: HistoryItemDisplay[];
  initialShowDemo?: boolean;
}

const ILLUSTRATIVE_DEMO_EVENTS = [
  {
    id: "DEMO-01",
    date: "Minh họa",
    type: "RETEST_EVALUATION",
    title: "Đánh giá kiểm tra lại song song (Re-test)",
    description: "Chuyển đổi trạng thái từ DEVELOPING lên SECURE (Độ tin cậy: HIGH) sau khi hoàn thành gói học tập.",
    tag: "SECURE",
  },
  {
    id: "DEMO-02",
    date: "Minh họa",
    type: "PRACTICE_EVALUATION",
    title: "Đánh giá luyện tập kiến thức",
    description: "Ghi nhận tiến trình ôn luyện kỹ năng quy đồng mẫu số.",
    tag: "DEVELOPING",
  },
  {
    id: "DEMO-03",
    date: "Minh họa",
    type: "DIAGNOSTIC_EVALUATION",
    title: "Khảo sát chẩn đoán ban đầu",
    description: "Xác định vùng kiến thức chưa vững và lập sơ đồ lỗ hổng tiên quyết.",
    tag: "UNCERTAIN",
  },
];

export function LearnerHistory({ events = [], initialShowDemo = false }: LearnerHistoryProps) {
  const [showDemo, setShowDemo] = useState(initialShowDemo);
  const hasRealEvents = events.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-warm-200 pb-4 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-edu-200 bg-edu-50 px-3 py-0.5 text-xs font-semibold text-edu-800 dark:bg-edu-950/40 dark:text-edu-300">
          <History className="h-3.5 w-3.5 text-edu-700" />
          <span>Dòng Thời Gian Năng Lực Thực Chất</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
          Lịch Sử Kiểm Soát & Phục Hồi Lỗ Hổng
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ghi nhận toàn bộ minh chứng tiến trình từ chẩn đoán ban đầu đến khi làm chủ vững vàng.
        </p>
      </div>

      {/* Real Events or Truthful Empty State */}
      {hasRealEvents ? (
        <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-warm-200 dark:before:bg-slate-800">
            {events.map((item) => (
              <div key={item.id} className="relative space-y-1">
                <div className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-edu-700 text-white ring-4 ring-white dark:ring-slate-900">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{item.date}</span>
                  <span>·</span>
                  <span className="font-mono font-bold text-edu-700 dark:text-edu-400">{item.newState}</span>
                  <span>({item.confidence})</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Mã nút: {item.nodeId} — {item.reasonCode}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Chuyển từ {item.previousState} sang {item.newState} dựa trên minh chứng đánh giá thực tế.
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-warm-300 bg-warm-50/50 p-8 sm:p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warm-100 text-warm-600 dark:bg-slate-800 dark:text-slate-400 mb-4">
            <Info className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Chưa có lịch sử học tập được ghi nhận.
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            Học sinh chưa hoàn thành buổi khảo sát chẩn đoán hoặc bài kiểm tra lại nào. Mọi chuyển đổi trạng thái làm chủ chỉ được ghi lại khi có minh chứng bài làm thực tế.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/learn/new"
              className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-edu-800 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Bắt đầu khảo sát chẩn đoán</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-warm-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-warm-100 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <span>{showDemo ? "Ẩn ví dụ minh họa" : "Xem ví dụ minh họa"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Explicitly Labeled Illustrative Demo */}
      {showDemo && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 sm:p-8 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3 dark:border-amber-900/50">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                Ví dụ minh họa
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Không phải kết quả thực tế của học sinh hiện tại
              </span>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              Minh họa cấu trúc nhật ký chuyển đổi năng lực
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-200 dark:before:bg-amber-900">
            {ILLUSTRATIVE_DEMO_EVENTS.map((item) => (
              <div key={item.id} className="relative space-y-1">
                <div className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white ring-4 ring-amber-50 dark:ring-slate-900">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400">
                  <span>{item.date}</span>
                  <span>·</span>
                  <span className="font-mono font-bold">{item.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

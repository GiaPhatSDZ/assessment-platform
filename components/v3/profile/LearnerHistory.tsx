"use client";

import React from "react";
import Link from "next/link";
import { History, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, BookOpen } from "lucide-react";

export function LearnerHistory() {
  const historyEvents = [
    {
      date: "Hôm nay",
      type: "RETEST_PASSED",
      title: "Vượt qua bài kiểm tra lại song song (Re-test)",
      description: "Thăng cấp trạng thái nút 'Cộng, trừ hai phân số không cùng mẫu' từ DEVELOPING lên SECURE (Độ tin cậy: HIGH).",
      tag: "SECURE",
    },
    {
      date: "Hôm nay",
      type: "LEARNING_PACK_COMPLETED",
      title: "Hoàn thành Gói học bù trọng tâm",
      description: "Học lại kỹ năng Quy đồng mẫu số và sử dụng Manual Gemini NotebookLM với Prompt Socratic Bộ GD&ĐT.",
      tag: "REMEDIATION",
    },
    {
      date: "Hôm nay",
      type: "GAP_DETECTED",
      title: "Phát hiện lỗ hổng gốc rễ",
      description: "Gap Engine phân tích sai lầm ADD_NUM_AND_DENOM_DIRECTLY và định vị nút hổng: 'Quy đồng mẫu số các phân số'.",
      tag: "GAP_FOUND",
    },
    {
      date: "Hôm nay",
      type: "DIAGNOSTIC_STARTED",
      title: "Bắt đầu bài chẩn đoán Toán Lớp 6",
      description: "Thực hiện 4 câu hỏi nhận thức bao phủ 4 nút trong đồ thị tiên quyết.",
      tag: "INITIAL_TEST",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
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

      <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-warm-200 dark:before:bg-slate-800">
          {historyEvents.map((item, idx) => (
            <div key={idx} className="relative space-y-1">
              <div className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-edu-700 text-white ring-4 ring-white dark:ring-slate-900">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{item.date}</span>
                <span>·</span>
                <span className="font-mono font-bold text-edu-700 dark:text-edu-400">{item.tag}</span>
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
    </div>
  );
}

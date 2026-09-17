"use client";

import React from "react";
import { LearningPack } from "@/src/domain/remediation/learning-pack";
import { MathText } from "@/components/math/MathText";
import { GeminiHandoff } from "./GeminiHandoff";
import { BookOpen, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface LearningPackViewProps {
  pack: LearningPack;
  onProceedToRetest: () => void;
  onBackToReport?: () => void;
}

export function LearningPackView({
  pack,
  onProceedToRetest,
  onBackToReport,
}: LearningPackViewProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Header Card */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-edu-200 bg-edu-50 px-3 py-0.5 text-xs font-semibold text-edu-800 dark:bg-edu-950/40 dark:text-edu-300">
          <BookOpen className="h-3.5 w-3.5 text-edu-700" />
          <span>Gói Học Bù Trọng Tâm (Targeted Learning Pack)</span>
        </div>

        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Kế Hoạch Củng Cố: {pack.focusNodeLabel}
        </h1>

        <div className="mt-4 rounded-xl border border-warm-200 bg-warm-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Mục tiêu học tập cần phục hồi
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {pack.objective}
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {pack.learnerGuide}
          </p>
        </div>

        {/* Source References */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400">Tài liệu chuẩn căn cứ:</span>
          {pack.curriculumSourceRefs.map((ref, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md bg-warm-100 px-2.5 py-1 text-slate-700 font-medium dark:bg-slate-800 dark:text-slate-300"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-edu-600" />
              <span>{ref.documentTitle} ({ref.clauseOrSection})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Worked Examples */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Ví Dụ Mẫu & Phương Pháp Giải Từng Bước
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Được trích xuất từ quy tắc thực hành chuẩn của SGK Toán 6.
          </p>
        </div>

        <div className="space-y-4">
          {pack.workedExamplePlan.map((exampleText, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-warm-200 bg-warm-50/30 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/20"
            >
              <div className="text-xs font-bold text-edu-700 dark:text-edu-400 mb-1">
                Bài tập mẫu {idx + 1}:
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2 leading-relaxed">
                <MathText text={exampleText} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gemini NotebookLM Handoff */}
      <GeminiHandoff
        copyablePrompt={pack.geminiNotebookInstructions.copyablePrompt}
        sourceDocTitles={pack.geminiNotebookInstructions.suggestedSources}
      />

      {/* Proceed to Re-test CTA Card */}
      <div className="rounded-2xl border border-edu-200 bg-edu-50/50 p-6 sm:p-8 text-center space-y-4 dark:border-edu-900/60 dark:bg-edu-950/20">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Đã sẵn sàng kiểm tra lại kiến thức?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Bài kiểm tra lại gồm 4 câu hỏi song song với dạng bài tương đương. Khi vượt qua, hệ thống sẽ thăng hạng năng lực của con lên mức <strong>Vững vàng (SECURE)</strong>.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onProceedToRetest}
            className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-edu-800 transition active:scale-[0.98]"
          >
            <span>Bắt đầu bài kiểm tra lại (Re-test)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

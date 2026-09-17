"use client";

import React from "react";
import { GapReport } from "@/src/domain/diagnostic/gap-engine";
import { KnowledgeGraph } from "@/src/domain/curriculum/types";
import { NodeMasteryState } from "@/src/domain/diagnostic/types";
import { PrerequisiteTree } from "../curriculum/PrerequisiteTree";
import { ShieldAlert, CheckCircle2, ArrowRight, BookOpen, HelpCircle } from "lucide-react";

interface GapReportViewProps {
  report: GapReport;
  graph: KnowledgeGraph;
  nodeStates: Record<string, NodeMasteryState>;
  onProceedToLearningPack: () => void;
  onRetestDirectly?: () => void;
}

export function GapReportView({
  report,
  graph,
  nodeStates,
  onProceedToLearningPack,
  onRetestDirectly,
}: GapReportViewProps) {
  const hasPrerequisiteGap = report.classification === "PREREQUISITE_GAP_CANDIDATE";
  const hasNoGap = report.classification === "NO_GAP";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Overview Card */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-100 pb-6 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-edu-200 bg-edu-50 px-3 py-0.5 text-xs font-semibold text-edu-800 dark:bg-edu-950/40 dark:text-edu-300">
              <BookOpen className="h-3.5 w-3.5 text-edu-700" />
              <span>Báo Cáo Phân Tích Lỗ Hổng Kiến Thức</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
              {hasNoGap ? "Chúc mừng! Con đã làm chủ kiến thức." : "Đã phát hiện điểm nghẽn nhận thức."}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Chủ đề kiểm tra: <span className="font-semibold text-slate-800 dark:text-slate-200">{report.targetNodeLabel}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasNoGap ? (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>Vững vàng (SECURE)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300">
                <ShieldAlert className="h-4 w-4" />
                <span>Hổng kiến thức nền tảng</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-warm-200 bg-warm-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Phân tích sư phạm chuyên sâu
            </h4>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {report.explanation}
            </p>
          </div>

          {report.detectedMisconceptions.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1">
                Ngộ nhận thường gặp ghi nhận được
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                Học sinh đang có xu hướng cộng trực tiếp tử với tử và mẫu với mẫu <code>(a+c)/(b+d)</code> thay vì quy đồng về mẫu số chung. Đây là ngộ nhận rất phổ biến khi chuyển từ phân số cùng mẫu sang khác mẫu.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-edu-200 bg-edu-50/40 p-4 dark:border-edu-900/40 dark:bg-edu-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-edu-900 dark:text-edu-300 mb-1">
              Kế hoạch hành động đề xuất
            </h4>
            <p className="text-sm text-edu-800 dark:text-edu-200 leading-relaxed font-semibold">
              {report.actionableNextStep}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-warm-100 dark:border-slate-800">
          {hasNoGap ? (
            <button
              type="button"
              onClick={onRetestDirectly}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-edu-700 px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition"
            >
              <span>Làm bài thử thách nâng cao</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onProceedToLearningPack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-edu-700 px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition active:scale-[0.98]"
            >
              <span>Mở gói học bù trọng tâm</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Prerequisite Knowledge Graph Tree */}
      <PrerequisiteTree
        nodes={graph.nodes}
        edges={graph.edges}
        nodeStates={nodeStates}
        rootGapNodeId={report.rootPrerequisiteNodeId}
        targetNodeId={report.targetNodeId}
      />
    </div>
  );
}

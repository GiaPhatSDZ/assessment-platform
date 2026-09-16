"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GeneratedReportPayload } from "@/src/domain/report/types";
import { DimensionInterpretation } from "@/src/domain/assessment/types";
import { aiCareerReadinessAssessmentV1 } from "@/assessments/ai-career-readiness-v1";
import { getResultBand } from "@/src/domain/assessment/result-bands";
import { localSessionStore } from "@/src/infrastructure/browser/local-session-store";
import { RadarResult } from "@/components/results/RadarResult";
import {
  Sparkles,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Printer,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface ReportPageContentProps {
  sessionId: string;
}

export function ReportPageContent({ sessionId }: ReportPageContentProps) {
  const [report, setReport] = useState<GeneratedReportPayload | null>(null);
  const [interpretations, setInterpretations] = useState<DimensionInterpretation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReportData() {
      setIsLoading(true);

      // 1. Calculate local/stored interpretations
      const draft = localSessionStore.getDraft(aiCareerReadinessAssessmentV1.slug);
      const score = draft?.finalizedScore;

      const interps: DimensionInterpretation[] = aiCareerReadinessAssessmentV1.dimensions.map(
        (def) => {
          const s = score?.dimensions.find((d) => d.dimensionId === def.id);
          const val = s ? s.normalizedScore : 75;
          return {
            dimensionId: def.id,
            label: def.label,
            score: val,
            band: getResultBand(val),
          };
        }
      );
      setInterpretations(interps);

      // 2. Request / Load report from API
      try {
        const res = await fetch("/api/report/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.report) {
            setReport(json.report);
          } else {
            setError("Báo cáo AI tạm thời chưa khả dụng.");
          }
        } else {
          setError("Không thể tải báo cáo vào lúc này.");
        }
      } catch (err: any) {
        setError("Không thể kết nối đến máy chủ tạo báo cáo.");
      } finally {
        setIsLoading(false);
      }
    }

    loadReportData();
  }, [sessionId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Đang tổng hợp báo cáo năng lực và lập kế hoạch hành động...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 space-y-10">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <Link
          href={`/assessment/${aiCareerReadinessAssessmentV1.slug}/result/${sessionId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại kết quả sơ bộ</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>In / Lưu PDF</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Báo cáo chính thức • Phiên làm bài #{sessionId.slice(-6)}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Báo Cáo Phân Tích Năng Lực & Kế Hoạch Hành Động Cá Nhân Hóa
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Dựa trên thẩm quyền điểm số toán học của bài đánh giá &quot;{aiCareerReadinessAssessmentV1.title}&quot;.
        </p>
      </div>

      {/* Graceful error alert if AI report unavailable */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Báo cáo diễn giải AI tạm thời không khả dụng
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              {error} Toàn bộ điểm số xác thực và kết quả đánh giá 4 chiều kích của bạn vẫn được bảo toàn nguyên vẹn bên dưới.
            </p>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {report && (
        <div className="rounded-2xl border border-blue-200 bg-white p-6 sm:p-8 dark:border-blue-900/40 dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Sparkles className="h-4 w-4" />
            <span>Tóm tắt năng lực điều hành</span>
          </div>
          <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed">
            {report.summary}
          </p>
        </div>
      )}

      {/* Side-by-side Radar & Score Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="lg:col-span-5 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
          <RadarResult dimensions={interpretations} size={300} />
          <span className="text-xs text-slate-400 mt-2">Phân bố điểm số các chiều kích</span>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Điểm số toán học chuẩn hóa (0 - 100%)
          </h3>
          <div className="space-y-3">
            {interpretations.map((dim) => (
              <div
                key={dim.dimensionId}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{dim.label}</div>
                  <div className="text-xs text-slate-500">{dim.band.label}</div>
                </div>
                <div className="text-lg font-black text-blue-600">{dim.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Strengths & Growth Areas */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Strengths */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Điểm mạnh vượt trội</span>
            </div>
            <div className="space-y-4">
              {report.strengths.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Areas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              <TrendingUp className="h-4 w-4" />
              <span>Vùng phát triển & Bứt phá</span>
            </div>
            <div className="space-y-4">
              {report.growthAreas.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Plan */}
      {report && report.actionPlan.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Calendar className="h-4 w-4" />
              <span>Lộ trình thực thi</span>
            </div>
            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Kế hoạch hành động 6 tuần nâng cao năng lực
            </h3>
          </div>

          <div className="space-y-4">
            {report.actionPlan.map((action) => (
              <div
                key={action.step}
                className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-850/70"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white">
                  {action.step}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {action.title}
                    </h4>
                    <span className="inline-flex rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {action.timeframe}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Tuyên bố miễn trừ trách nhiệm</p>
        <p>{aiCareerReadinessAssessmentV1.disclaimer}</p>
      </div>
    </div>
  );
}

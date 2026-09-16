"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { aiCareerReadinessAssessmentV1 } from "@/assessments/ai-career-readiness-v1";
import { AssessmentScore, DimensionInterpretation } from "@/src/domain/assessment/types";
import { getResultBand } from "@/src/domain/assessment/result-bands";
import { localSessionStore } from "@/src/infrastructure/browser/local-session-store";
import { RadarResult } from "./RadarResult";
import { DimensionScoreCard } from "./DimensionScoreCard";
import { DeterministicSummary } from "./DeterministicSummary";
import { FullReportCta } from "./FullReportCta";
import { CheckCircle2, RotateCcw, ShieldAlert } from "lucide-react";

interface ResultPageContentProps {
  slug: string;
  sessionId: string;
  initialScore?: AssessmentScore | null;
}

export function ResultPageContent({
  slug,
  sessionId,
  initialScore,
}: ResultPageContentProps) {
  const [score, setScore] = useState<AssessmentScore | null>(initialScore || null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!initialScore) {
      const draft = localSessionStore.getDraft(slug);
      if (draft && draft.finalizedScore) {
        setScore(draft.finalizedScore);
      }
    }
    setIsLoaded(true);
  }, [slug, initialScore]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">Đang tải kết quả đánh giá...</div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          Chưa tìm thấy kết quả đánh giá
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Phiên làm bài này có thể chưa hoàn thành hoặc dữ liệu đã được làm mới.
        </p>
        <div className="mt-6">
          <Link
            href={`/assessment/${slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Bắt đầu bài đánh giá</span>
          </Link>
        </div>
      </div>
    );
  }

  // Map each dimension score to interpretation and band
  const interpretations: DimensionInterpretation[] = aiCareerReadinessAssessmentV1.dimensions.map(
    (def) => {
      const dimScore = score.dimensions.find((d) => d.dimensionId === def.id);
      const val = dimScore ? dimScore.normalizedScore : 0;
      const band = getResultBand(val);
      return {
        dimensionId: def.id,
        label: def.label,
        score: val,
        band,
      };
    }
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 space-y-10">
      {/* Title & Status */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Hoàn thành đánh giá chuẩn xác 100%</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Hồ Sơ Năng Lực Nghề Nghiệp Kỷ Nguyên AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Phân tích định lượng dựa trên 4 trụ cột kỹ năng chuẩn hóa với thang điểm xác thực tuyệt đối.
        </p>
      </div>

      {/* Visual Radar & Top-level Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="lg:col-span-5 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
          <RadarResult dimensions={interpretations} size={320} />
          <span className="text-xs text-slate-400 mt-2">Biểu đồ mạng nhện 4 chiều kích</span>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Bảng chỉ số năng lực theo chiều kích
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interpretations.map((dim) => (
              <DimensionScoreCard key={dim.dimensionId} dimension={dim} />
            ))}
          </div>
        </div>
      </div>

      {/* Summary of Strongest Signals & Growth Areas */}
      <DeterministicSummary dimensions={interpretations} />

      {/* Delayed Lead Capture CTA for Full AI Action Plan */}
      <FullReportCta sessionId={sessionId} />

      {/* Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Tuyên bố miễn trừ trách nhiệm</p>
        <p>{aiCareerReadinessAssessmentV1.disclaimer}</p>
      </div>
    </div>
  );
}

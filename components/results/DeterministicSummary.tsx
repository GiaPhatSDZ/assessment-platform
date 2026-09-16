import { DimensionInterpretation } from "@/src/domain/assessment/types";
import { Sparkles, TrendingUp } from "lucide-react";

interface DeterministicSummaryProps {
  dimensions: DimensionInterpretation[];
}

export function DeterministicSummary({ dimensions }: DeterministicSummaryProps) {
  // Sort dimensions to identify strongest and growth areas
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const strongest = sorted.slice(0, 2);
  const growth = sorted.slice(-2).reverse();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-850/70 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Tổng quan phân tích năng lực
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Kết quả tổng hợp khách quan dựa trên đối chiếu toán học giữa lựa chọn của bạn và khung năng lực nghề nghiệp chuẩn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Tín hiệu nổi bật nhất</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {strongest.map((dim) => (
              <li key={dim.dimensionId} className="flex items-center justify-between">
                <span>{dim.label}</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {dim.score}% ({dim.band.label})
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Dư địa mở rộng phát triển</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {growth.map((dim) => (
              <li key={dim.dimensionId} className="flex items-center justify-between">
                <span>{dim.label}</span>
                <span className="font-semibold text-blue-700 dark:text-blue-400">
                  {dim.score}% ({dim.band.label})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

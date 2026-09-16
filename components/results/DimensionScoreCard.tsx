import { DimensionInterpretation } from "@/src/domain/assessment/types";

interface DimensionScoreCardProps {
  dimension: DimensionInterpretation;
}

const bandColorMap: Record<string, { badge: string; bar: string }> = {
  emerging: {
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    bar: "bg-slate-500",
  },
  developing: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    bar: "bg-blue-500",
  },
  strong: {
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    bar: "bg-indigo-600",
  },
  standout: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    bar: "bg-emerald-600",
  },
};

export function DimensionScoreCard({ dimension }: DimensionScoreCardProps) {
  const colors = bandColorMap[dimension.band.id] || bandColorMap.developing;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          {dimension.label}
        </h4>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}
        >
          {dimension.band.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">Điểm chuẩn hóa</span>
        <span className="text-2xl font-black text-slate-900 dark:text-white">
          {dimension.score}
          <span className="text-sm font-medium text-slate-400">/100</span>
        </span>
      </div>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${dimension.score}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        {dimension.band.description}
      </p>
    </div>
  );
}

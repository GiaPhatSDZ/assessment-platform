import { landingCopy } from "@/src/content/vi/site-copy";
import { aiCareerReadinessAssessmentV1 } from "@/assessments/ai-career-readiness-v1";
import { Brain, Cpu, Compass, Activity } from "lucide-react";

const icons = [Brain, Activity, Cpu, Compass];
const borderColors = [
  "border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600",
  "border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 text-blue-600",
  "border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600",
  "border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 text-amber-600",
];

export function DimensionPreview() {
  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {landingCopy.dimensions.title}
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            {landingCopy.dimensions.subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {aiCareerReadinessAssessmentV1.dimensions.map((dim, idx) => {
            const Icon = icons[idx % icons.length];
            const colorClass = borderColors[idx % borderColors.length];
            return (
              <div
                key={dim.id}
                className="relative rounded-2xl border border-slate-200 p-6 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  {dim.label}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {dim.shortDescription}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

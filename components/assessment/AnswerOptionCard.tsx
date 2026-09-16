import { QuestionOption } from "@/src/domain/assessment/types";
import { CheckCircle2, Circle } from "lucide-react";

interface AnswerOptionCardProps {
  option: QuestionOption;
  index: number;
  selected: boolean;
  onSelect: (optionId: string) => void;
}

export function AnswerOptionCard({
  option,
  index,
  selected,
  onSelect,
}: AnswerOptionCardProps) {
  const numberLabel = index + 1;

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={`group relative flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all duration-150 min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
        selected
          ? "border-2 border-blue-600 bg-blue-50/70 text-blue-950 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-100 shadow-sm"
          : "border border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 shadow-sm"
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-3 shrink-0 pt-0.5">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
            selected
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {numberLabel}
        </span>
        {selected ? (
          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-400" />
        )}
      </div>

      <span className="text-base font-normal leading-relaxed pt-0.5">
        {option.label}
      </span>
    </button>
  );
}

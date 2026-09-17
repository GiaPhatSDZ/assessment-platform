import React from "react";

interface DiagnosticProgressProps {
  currentIndex: number;
  totalQuestions: number;
  subjectTitle: string;
  topicTitle: string;
}

export function DiagnosticProgress({
  currentIndex,
  totalQuestions,
  subjectTitle,
  topicTitle,
}: DiagnosticProgressProps) {
  const percentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-edu-700 bg-edu-50 px-2 py-0.5 rounded-md dark:bg-edu-950 dark:text-edu-300">
            {subjectTitle}
          </span>
          <span className="text-slate-500 dark:text-slate-400">·</span>
          <span className="text-slate-700 font-medium dark:text-slate-300 truncate max-w-[200px] sm:max-w-none">
            {topicTitle}
          </span>
        </div>
        <div className="text-slate-500 dark:text-slate-400 font-medium">
          Câu <span className="font-bold text-slate-900 dark:text-white">{currentIndex + 1}</span> / {totalQuestions}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-warm-200 overflow-hidden dark:bg-slate-800">
        <div
          className="h-full bg-edu-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

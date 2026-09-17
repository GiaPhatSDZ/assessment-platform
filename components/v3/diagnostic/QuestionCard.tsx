"use client";

import React, { useEffect } from "react";
import { DiagnosticItem } from "@/src/domain/diagnostic/types";
import { MathText } from "@/components/math/MathText";

interface QuestionCardProps {
  item: DiagnosticItem;
  selectedAnswer: string | null;
  onSelectAnswer: (optionId: string) => void;
  disabled?: boolean;
}

export function QuestionCard({
  item,
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
}: QuestionCardProps) {
  // Keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled) return;
      // If user is focusing an input or textarea, ignore
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key;
      const options = item.options || [];
      if (["1", "2", "3", "4"].includes(key)) {
        const index = parseInt(key, 10) - 1;
        if (options[index]) {
          onSelectAnswer(options[index].id);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onSelectAnswer, disabled]);

  return (
    <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Prompt */}
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Câu hỏi kiểm tra nhận thức
        </div>
        <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
          <MathText text={item.prompt} />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {(item.options || []).map((option, idx) => {
          const isSelected = selectedAnswer === option.id;
          const shortcutNumber = idx + 1;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAnswer(option.id)}
              className={`w-full text-left flex items-center justify-between p-4 rounded-xl border transition-all text-sm font-medium ${
                isSelected
                  ? "border-edu-600 bg-edu-50/70 text-slate-900 ring-2 ring-edu-500/40 dark:border-edu-500 dark:bg-edu-950/40 dark:text-white"
                  : "border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50/50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
              } ${disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer active:scale-[0.99]"}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                    isSelected
                      ? "border-edu-600 bg-edu-600 text-white dark:border-edu-500 dark:bg-edu-500"
                      : "border-slate-300 bg-warm-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {option.id}
                </span>

                <div className="text-base font-medium">
                  <MathText text={option.text} />
                </div>
              </div>

              <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono border border-slate-200 rounded px-1.5 py-0.5 dark:border-slate-800">
                Phím {shortcutNumber}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

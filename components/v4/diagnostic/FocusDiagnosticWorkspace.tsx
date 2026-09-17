"use client";

import React, { useState, useEffect } from "react";
import { MathText } from "@/components/math/MathText";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { DiagnosticItem, ItemAttempt } from "@/src/domain/diagnostic/types";

interface FocusDiagnosticWorkspaceProps {
  items: DiagnosticItem[];
  subjectTitle?: string;
  topicTitle?: string;
  onComplete: (attempts: ItemAttempt[]) => void;
}

export function FocusDiagnosticWorkspace({
  items,
  subjectTitle = "Toán Lớp 6",
  topicTitle = "Phép cộng phân số khác mẫu số",
  onComplete,
}: FocusDiagnosticWorkspaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<ItemAttempt[]>([]);

  const currentItem = items[currentIndex];
  const isLastQuestion = currentIndex === items.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / items.length) * 100);
  const options = currentItem?.options || [];

  // Keyboard shortcut listener (1..4 to select option, Enter to proceed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIndex = parseInt(e.key, 10) - 1;
        if (options[optionIndex]) {
          setSelectedOptionId(options[optionIndex].id);
        }
      } else if (e.key === "Enter" && selectedOptionId) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleNext = () => {
    if (!selectedOptionId || !currentItem) return;

    const selectedOption = options.find((o) => o.id === selectedOptionId);
    const isCorrect =
      selectedOption?.text === currentItem.correctAnswer ||
      selectedOption?.id === currentItem.correctAnswer;
    const detectedMisconceptions = isCorrect ? [] : currentItem.misconceptionTags;

    const newAttempt: ItemAttempt = {
      itemId: currentItem.id,
      primaryNodeId: currentItem.primaryNodeId,
      studentAnswer: selectedOption?.text || "",
      isCorrect,
      selectedOptionId,
      detectedMisconceptions,
      attemptedAt: new Date().toISOString(),
    };

    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);
    setSelectedOptionId(null);

    if (isLastQuestion) {
      onComplete(updatedAttempts);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      const prevAttempt = attempts[currentIndex - 1];
      setSelectedOptionId(prevAttempt?.selectedOptionId || null);
      setAttempts((prev) => prev.slice(0, prev.length - 1));
    }
  };

  if (!currentItem) return null;

  return (
    <div className="mx-auto w-full max-w-diagnostic space-y-8 animate-fadeIn">
      {/* Top Header: Progress & Subject Context */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">{subjectTitle}</span>
            <span>·</span>
            <span className="truncate">{topicTitle}</span>
          </div>

          <div className="font-mono font-medium">
            Câu {currentIndex + 1} / {items.length}
          </div>
        </div>

        {/* Thin elegant progress track */}
        <div className="h-1 w-full bg-line/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task Card: Distraction-free, clean borders, high contrast math */}
      <div className="rounded-marketingWindow border border-line/80 bg-surface p-6 sm:p-10 shadow-xs space-y-8">
        {/* Question Prompt */}
        <div className="space-y-4">
          <div className="text-2xs font-mono font-bold tracking-widest text-ink-muted uppercase">
            Yêu cầu bài toán
          </div>

          <div className="text-lg sm:text-2xl font-normal text-ink leading-relaxed font-sans">
            <MathText text={currentItem.prompt} />
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 pt-2">
          <div className="text-2xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-1">
            Chọn 1 trong các phương án dưới đây (hoặc nhấn phím 1..4):
          </div>

          {options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOptionId(option.id)}
                className={`w-full text-left p-4 sm:p-4.5 rounded-app transition-all border flex items-center gap-4 ${
                  isSelected
                    ? "border-brand bg-brand-soft/40 shadow-2xs text-ink font-semibold"
                    : "border-line/60 bg-surfaceStrong/60 hover:border-line hover:bg-surface text-ink"
                }`}
              >
                {/* Keyboard Shortcut Indicator */}
                <span
                  className={`h-7 w-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-brand text-white"
                      : "bg-canvas text-ink-muted border border-line/40"
                  }`}
                >
                  {idx + 1}
                </span>

                {/* Rendered Math Content */}
                <div className="flex-1 text-base sm:text-lg">
                  <MathText text={option.text} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-line/50 pt-6">
          {currentIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={!selectedOptionId}
            onClick={handleNext}
            className={`inline-flex items-center gap-2 rounded-app px-6 py-3 text-sm font-semibold transition-all shadow-2xs ${
              selectedOptionId
                ? "bg-brand text-white hover:bg-brand-dark active:scale-[0.98]"
                : "bg-line/40 text-ink-muted/50 cursor-not-allowed"
            }`}
          >
            <span>{isLastQuestion ? "Hoàn thành & Xem kết quả" : "Tiếp tục"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

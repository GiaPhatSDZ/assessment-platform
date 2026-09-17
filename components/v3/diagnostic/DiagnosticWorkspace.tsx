"use client";

import React, { useState } from "react";
import { DiagnosticItem, ItemAttempt } from "@/src/domain/diagnostic/types";
import { DiagnosticProgress } from "./DiagnosticProgress";
import { QuestionCard } from "./QuestionCard";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
import Link from "next/link";

interface DiagnosticWorkspaceProps {
  items: DiagnosticItem[];
  subjectTitle: string;
  topicTitle: string;
  onComplete: (attempts: ItemAttempt[]) => void;
  onExit?: () => void;
}

export function DiagnosticWorkspace({
  items,
  subjectTitle,
  topicTitle,
  onComplete,
  onExit,
}: DiagnosticWorkspaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const currentItem = items[currentIndex];
  const isLastQuestion = currentIndex === items.length - 1;
  const currentAnswer = currentItem ? selectedAnswers[currentItem.id] || null : null;

  const handleSelectAnswer = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentItem.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (!currentAnswer) return;

    if (isLastQuestion) {
      // Construct attempts
      const attempts: ItemAttempt[] = items.map((item) => {
        const studentAnswer = selectedAnswers[item.id] || "";
        const isCorrect = studentAnswer === item.correctAnswer;
        const detectedMisconceptions = !isCorrect && item.misconceptionTags
          ? item.misconceptionTags
          : [];

        return {
          itemId: item.id,
          primaryNodeId: item.primaryNodeId,
          studentAnswer,
          isCorrect,
          detectedMisconceptions,
          attemptedAt: new Date().toISOString(),
        };
      });

      onComplete(attempts);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!currentItem) {
    return <div className="p-8 text-center text-slate-500">Không có câu hỏi chẩn đoán.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Top Bar with Progress and Exit Link */}
      <div className="flex items-center justify-between pb-2 border-b border-warm-200 dark:border-slate-800">
        <DiagnosticProgress
          currentIndex={currentIndex}
          totalQuestions={items.length}
          subjectTitle={subjectTitle}
          topicTitle={topicTitle}
        />
      </div>

      {/* Question Card */}
      <QuestionCard
        item={currentItem}
        selectedAnswer={currentAnswer}
        onSelectAnswer={handleSelectAnswer}
      />

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        {currentIndex > 0 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 rounded-xl border border-warm-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-warm-50 transition active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Câu trước</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          disabled={!currentAnswer}
          onClick={handleNext}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] ${
            currentAnswer
              ? "bg-edu-700 hover:bg-edu-800"
              : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          <span>{isLastQuestion ? "Hoàn thành & Xem kết quả" : "Câu tiếp theo"}</span>
          {isLastQuestion ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

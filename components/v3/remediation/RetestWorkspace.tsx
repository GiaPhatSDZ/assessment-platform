"use client";

import React, { useState } from "react";
import { DiagnosticItem, ItemAttempt } from "@/src/domain/diagnostic/types";
import { processReTestOutcome, MasteryTransitionRecord } from "@/src/domain/mastery/history";
import { QuestionCard } from "../diagnostic/QuestionCard";
import { DiagnosticProgress } from "../diagnostic/DiagnosticProgress";
import { ArrowLeft, ArrowRight, CheckCircle2, Award, History, RotateCcw } from "lucide-react";
import Link from "next/link";

interface RetestWorkspaceProps {
  reTestItems: DiagnosticItem[];
  targetNodeId: string;
  targetNodeLabel: string;
  learningPackId: string;
  onFinish?: (record: MasteryTransitionRecord) => void;
}

export function RetestWorkspace({
  reTestItems,
  targetNodeId,
  targetNodeLabel,
  learningPackId,
  onFinish,
}: RetestWorkspaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [transitionRecord, setTransitionRecord] = useState<MasteryTransitionRecord | null>(null);

  const currentItem = reTestItems[currentIndex];
  const isLastQuestion = currentIndex === reTestItems.length - 1;
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
      // Evaluate re-test attempts
      const attempts: ItemAttempt[] = reTestItems.map((item) => {
        const studentAnswer = selectedAnswers[item.id] || "";
        const isCorrect = studentAnswer === item.correctAnswer;
        return {
          itemId: item.id,
          primaryNodeId: item.primaryNodeId,
          studentAnswer,
          isCorrect,
          detectedMisconceptions: [],
          attemptedAt: new Date().toISOString(),
        };
      });

      const record = processReTestOutcome(
        "learner-active-v3",
        targetNodeId,
        targetNodeLabel,
        "DEVELOPING",
        "MEDIUM",
        attempts,
        learningPackId
      );

      setTransitionRecord(record);
      if (onFinish) onFinish(record);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  // If completed and record is generated, show victory transition card
  if (transitionRecord) {
    const isMastered = transitionRecord.newState === "SECURE";

    return (
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-6">
        <div className="rounded-2xl border border-warm-200 bg-white p-8 shadow-xs text-center dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Award className="h-8 w-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Xác nhận năng lực thực chất
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isMastered ? "Lỗ Hổng Đã Được Khắc Phục Thành Công!" : "Cần Thêm Thời Gian Luyện Tập"}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {transitionRecord.reason}
            </p>
          </div>

          {/* Evidence Card */}
          <div className="rounded-xl border border-warm-200 bg-warm-50/60 p-4 text-left space-y-3 dark:border-slate-800 dark:bg-slate-800/40 text-xs">
            <div className="flex items-center justify-between border-b border-warm-200/80 pb-2 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Nút kiến thức phục hồi:</span>
              <span className="font-bold text-slate-900 dark:text-white">{transitionRecord.nodeLabel}</span>
            </div>
            <div className="flex items-center justify-between border-b border-warm-200/80 pb-2 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Chuyển dịch trạng thái:</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-amber-600">{transitionRecord.previousState}</span>
                <span>→</span>
                <span className="text-emerald-600">{transitionRecord.newState}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-warm-200/80 pb-2 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Độ tin cậy bằng chứng:</span>
              <span className="font-bold text-edu-700 dark:text-edu-400">{transitionRecord.newConfidence}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Số câu kiểm tra lại đạt:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {transitionRecord.reTestCorrectCount} / {transitionRecord.reTestAttemptsCount} câu
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/learn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-edu-700 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition active:scale-[0.98]"
            >
              <span>Về Góc học tập cá nhân</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/learn/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-warm-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-warm-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>Chẩn đoán chủ đề khác</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return <div className="p-8 text-center text-slate-500">Không có câu hỏi kiểm tra lại.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Top Bar with Progress */}
      <div className="flex items-center justify-between pb-2 border-b border-warm-200 dark:border-slate-800">
        <DiagnosticProgress
          currentIndex={currentIndex}
          totalQuestions={reTestItems.length}
          subjectTitle="Bài kiểm tra lại song song (Re-test)"
          topicTitle={targetNodeLabel}
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
          <span>{isLastQuestion ? "Nộp bài kiểm tra lại" : "Câu tiếp theo"}</span>
          {isLastQuestion ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AssessmentDefinition, Answer } from "@/src/domain/assessment/types";
import { scoreAssessment } from "@/src/domain/assessment/scoring";
import { localSessionStore } from "@/src/infrastructure/browser/local-session-store";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

interface AssessmentRunnerProps {
  assessment: AssessmentDefinition;
}

export function AssessmentRunner({ assessment }: AssessmentRunnerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refParam = searchParams?.get ? searchParams.get("ref") : null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [sessionId, setSessionId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate local draft on mount
  useEffect(() => {
    const draft = localSessionStore.getDraft(assessment.slug, assessment.version);
    if (draft) {
      setSessionId(draft.sessionId);
      const answerMap = new Map<string, string>();
      for (const a of draft.answers) {
        answerMap.set(a.questionId, a.optionId);
      }
      setAnswers(answerMap);
      if (draft.currentStepIndex >= 0 && draft.currentStepIndex < assessment.questions.length) {
        setCurrentIndex(draft.currentStepIndex);
      }
    } else {
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setSessionId(newSessionId);
      localSessionStore.saveDraft({
        sessionId: newSessionId,
        assessmentId: assessment.id,
        assessmentSlug: assessment.slug,
        assessmentVersion: assessment.version,
        currentStepIndex: 0,
        answers: [],
        referralCode: refParam || undefined,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setIsHydrated(true);
  }, [assessment, refParam]);

  const currentQuestion = assessment.questions[currentIndex];
  const selectedOptionId = currentQuestion ? answers.get(currentQuestion.id) : undefined;
  const isAnswered = !!selectedOptionId;
  const isLastQuestion = currentIndex === assessment.questions.length - 1;

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      setErrorMessage(null);

      const updated = new Map(answers);
      updated.set(currentQuestion.id, optionId);
      setAnswers(updated);

      const answerItem: Answer = {
        questionId: currentQuestion.id,
        optionId,
        answeredAt: new Date().toISOString(),
      };

      localSessionStore.updateAnswer(assessment.slug, answerItem, currentIndex);
    },
    [currentQuestion, answers, assessment.slug, currentIndex]
  );

  const handleNext = useCallback(() => {
    if (!currentQuestion) return;

    if (currentQuestion.required && !isAnswered) {
      setErrorMessage("Vui lòng chọn một phương án trước khi tiếp tục.");
      return;
    }

    setErrorMessage(null);
    if (!isLastQuestion) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const draft = localSessionStore.getDraft(assessment.slug);
      if (draft) {
        draft.currentStepIndex = nextIdx;
        localSessionStore.saveDraft(draft);
      }
    }
  }, [currentQuestion, isAnswered, isLastQuestion, currentIndex, assessment.slug]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setErrorMessage(null);
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const draft = localSessionStore.getDraft(assessment.slug);
      if (draft) {
        draft.currentStepIndex = prevIdx;
        localSessionStore.saveDraft(draft);
      }
    }
  }, [currentIndex, assessment.slug]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    // Check all required questions
    for (const q of assessment.questions) {
      if (q.required && !answers.has(q.id)) {
        setErrorMessage(`Vui lòng hoàn thành câu hỏi: ${q.prompt}`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const answerList: Answer[] = Array.from(answers.entries()).map(([questionId, optionId]) => ({
        questionId,
        optionId,
        answeredAt: new Date().toISOString(),
      }));

      // Authoritative deterministic scoring
      const finalScore = scoreAssessment(assessment, answerList);

      // Save finalized score locally
      localSessionStore.setFinalizedScore(assessment.slug, finalScore);

      // Also attempt server sync if endpoint available
      try {
        await fetch("/api/assessment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            slug: assessment.slug,
            version: assessment.version,
            answers: answerList,
            referralCode: refParam || undefined,
          }),
        });
      } catch {
        // Safe fallback: local score is valid and usable
      }

      router.push(`/assessment/${assessment.slug}/result/${sessionId}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi tính toán kết quả. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  }, [isSubmitting, assessment, answers, sessionId, refParam, router]);

  // Keyboard shortcut listener (1-5 for options, Enter for Next/Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion) return;

      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        const optionIndex = parseInt(e.key, 10) - 1;
        if (optionIndex < currentQuestion.options.length) {
          handleSelectOption(currentQuestion.options[optionIndex].id);
        }
      } else if (e.key === "Enter" && !e.shiftKey) {
        if (isAnswered) {
          if (isLastQuestion) {
            handleSubmit();
          } else {
            handleNext();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, isAnswered, isLastQuestion, handleSelectOption, handleNext, handleSubmit]);

  if (!isHydrated || !currentQuestion) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-slate-500">Đang chuẩn bị câu hỏi...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Progress */}
      <ProgressBar current={currentIndex + 1} total={assessment.questions.length} />

      {/* Error notification */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Question */}
      <div className="mt-6">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={assessment.questions.length}
          selectedOptionId={selectedOptionId}
          onSelectOption={handleSelectOption}
        />
      </div>

      {/* Navigation Controls */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0 || isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </button>

        {isLastQuestion ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isAnswered || isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <span>Đang chấm điểm...</span>
            ) : (
              <>
                <span>Hoàn thành & Xem kết quả</span>
                <CheckCircle className="h-4 w-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isAnswered}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Câu tiếp theo</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Disclaimer reminder */}
      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
        {assessment.disclaimer}
      </div>
    </div>
  );
}

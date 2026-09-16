import { QuestionDefinition } from "@/src/domain/assessment/types";
import { AnswerOptionCard } from "./AnswerOptionCard";

interface QuestionCardProps {
  question: QuestionDefinition;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
}: QuestionCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        <span>Câu hỏi {questionNumber} / {totalQuestions}</span>
        {question.required && (
          <span className="text-rose-500" title="Bắt buộc">
            *
          </span>
        )}
      </div>

      <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
        {question.prompt}
      </h2>

      <div className="mt-8 space-y-3" role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option, idx) => (
          <AnswerOptionCard
            key={option.id}
            option={option}
            index={idx}
            selected={selectedOptionId === option.id}
            onSelect={onSelectOption}
          />
        ))}
      </div>
    </div>
  );
}

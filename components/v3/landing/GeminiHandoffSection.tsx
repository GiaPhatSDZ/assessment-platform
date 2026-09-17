import React from "react";
import { Bot, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

export function GeminiHandoffSection() {
  return (
    <section className="py-16 md:py-20 border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand mb-2">
            Giao Thức Hỗ Trợ Phụ Huynh (Parent Copilot)
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-ink">
            AI Hỗ Trợ Phụ Huynh — Trẻ Em Học Trên Tài Liệu Đã Thẩm Định
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed font-normal">
            Thay vì tích hợp chatbot trả lời tự do cho học sinh (dễ gây phân tâm và ảo giác), chúng tôi thiết lập ranh giới nghiêm ngặt: AI là trợ lý dành riêng cho phụ huynh tham khảo phương pháp sư phạm Socratic trên <strong>Google NotebookLM</strong>, trong khi học sinh chỉ học tập trên tài liệu chuẩn tĩnh đã qua kiểm định.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="rounded-marketingWindow border border-line bg-surfaceStrong p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-brand font-semibold text-xs">
              <Bot className="h-5 w-5" />
              <span>Phương pháp sư phạm gợi mở dành cho cha mẹ</span>
            </div>

            <h3 className="font-serif text-lg font-bold text-ink">
              Gợi ý phương pháp, không làm thay con
            </h3>

            <p className="text-xs text-ink-muted leading-relaxed font-normal">
              Prompt được thiết kế để trợ lý cung cấp cho phụ huynh các câu hỏi gợi mở nhỏ: <em>&ldquo;Mẫu số của hai phân số này là bao nhiêu?&rdquo;, &ldquo;Bội chung nhỏ nhất của chúng là số nào?&rdquo;</em> để cha mẹ hướng dẫn con tự suy luận và tự thao tác trên giấy.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-ink-muted">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Riêng tư trên Google NotebookLM, không lưu PII</span>
            </div>
          </div>

          <div className="rounded-marketingWindow border border-line bg-surface p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Ranh giới kiểm soát năng lực nghiêm ngặt
            </div>

            <ul className="space-y-3 text-xs text-ink">
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">✕</span>
                <span>Học sinh không trò chuyện tự do với AI trong runtime học tập.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">✕</span>
                <span>AI không thể tự ý thay đổi trạng thái làm chủ kiến thức hay sửa điểm số.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                <span>Chỉ bài kiểm tra lại song song (Re-test) độc lập mới có giá trị ghi nhận bằng chứng tiến bộ.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { Bot, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

export function GeminiHandoffSection() {
  return (
    <section className="py-16 md:py-20 border-b border-warm-200/80 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-edu-700 dark:text-edu-400 mb-2">
            5. Giao thức hỗ trợ học tập (Gemini Notebook Handoff)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Đóng Vai Trò Gia Sư Kiên Nhẫn — Không Phải Giám Thị Chấm Thi
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Thay vì tích hợp chatbot trả lời tự do dễ gây ảo giác (hallucination), chúng tôi cung cấp giao thức Socratic chuẩn để học sinh sử dụng trực tiếp trên <strong>Google NotebookLM</strong> với tài liệu SGK Bộ GD&ĐT đã được thẩm duyệt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="rounded-2xl border border-warm-200 bg-warm-50/50 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
              <Bot className="h-5 w-5" />
              <span>Phương pháp đối thoại Socratic sư phạm</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Không đưa ngay đáp án cuối cùng
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Prompt được thiết kế để AI không bao giờ giải bài tập hộ học sinh. Thay vào đó, AI sẽ đặt từng câu hỏi gợi mở nhỏ: <em>&ldquo;Mẫu số của hai phân số này là bao nhiêu?&rdquo;, &ldquo;Bội chung nhỏ nhất của chúng là số nào?&rdquo;</em> để con tự tư duy và tìm ra cách làm.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Hoàn toàn miễn phí trên Google NotebookLM</span>
            </div>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ranh giới kiểm soát điểm số nghiêm ngặt
            </div>

            <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">✕</span>
                <span>AI không thể tự động cấp chứng chỉ làm chủ bài học.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">✕</span>
                <span>AI không chấm điểm dựa trên cảm xúc của đoạn văn chat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                <span>Chỉ bài kiểm tra lại song song (Re-test) trên hệ thống mới có giá trị thăng hạng trạng thái kiến thức.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

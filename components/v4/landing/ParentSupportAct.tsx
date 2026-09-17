"use client";

import React, { useState } from "react";
import { HeartHandshake, Sparkles, MessageSquareQuote, ShieldAlert, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

export function ParentSupportAct() {
  const [expandedExplanation, setExpandedExplanation] = useState(false);

  return (
    <section className="py-20 sm:py-28 border-t border-line/60 bg-canvas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Editorial Statement (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand tracking-widest uppercase bg-brand-soft/60 px-3 py-1 rounded-pill">
              <HeartHandshake className="h-3.5 w-3.5" />
              Đồng Hành Cùng Phụ Huynh
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-semibold text-ink leading-[1.1]">
              Bố mẹ không cần phải nhớ hết kiến thức lớp 6 để dạy con.
            </h2>

            <p className="text-base text-ink-muted leading-relaxed font-normal">
              Thay vì mất kiên nhẫn hay ép con đi học thêm tràn lan, phụ huynh nhận được một trợ lý đồng hành sư phạm (Parent Copilot) giải thích cặn kẽ nguyên nhân và đưa ra các câu hỏi gợi mở tự nhiên.
            </p>

            {/* AI Boundary Safe Guard */}
            <div className="rounded-app bg-surface border border-line/60 p-4 space-y-2 text-xs">
              <div className="font-semibold text-ink flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-brand" />
                Nguyên tắc bảo vệ an toàn cho trẻ em:
              </div>
              <p className="text-ink-muted leading-relaxed">
                Trí tuệ nhân tạo chỉ phục vụ giải thích cho cha mẹ. Hệ thống tuyệt đối không để trẻ tiếp xúc với chatbot sinh nội dung tự do trong lúc làm bài chẩn đoán.
              </p>
            </div>
          </div>

          {/* Right Contextual Companion Panel (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-marketingWindow border border-line/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-line/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-brand-soft flex items-center justify-center text-brand">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Parent Copilot · Bảng Hướng Dẫn Sư Phạm
                    </h3>
                    <p className="text-2xs text-ink-muted">
                      Ngữ cảnh: Lỗ hổng &ldquo;Quy đồng mẫu số hai phân số&rdquo;
                    </p>
                  </div>
                </div>
                <span className="text-2xs font-semibold text-brand bg-brand-soft/60 px-2.5 py-1 rounded-pill">
                  Dành riêng cho cha mẹ
                </span>
              </div>

              {/* Child's Mistake Explained in Plain Language */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-ink uppercase tracking-wider">
                  1. Con đang gặp khó khăn gì?
                </div>
                <div className="p-3.5 rounded-app bg-canvas text-xs text-ink leading-relaxed border border-line/40">
                  Khi gặp phép tính <span className="font-semibold">3/8 + 5/12</span>, con đã tính ra <span className="font-semibold text-danger">8/20</span>. Con đang cộng thẳng hàng tử số và mẫu số vì chưa hiểu được rằng: Không thể cộng hai vật thể có kích thước đo lường khác nhau khi chưa quy về cùng một đơn vị.
                </div>
              </div>

              {/* Suggested Conversation Prompt for Dinner Table */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquareQuote className="h-3.5 w-3.5 text-accent" />
                  <span>2. Câu hỏi gợi mở nên hỏi con tối nay:</span>
                </div>
                <div className="p-4 rounded-app bg-accent-soft/40 text-xs text-ink font-medium leading-relaxed border border-accent/30">
                  &ldquo;Nếu mẹ có 3 miếng bánh cắt từ một chiếc bánh chia làm 8 phần, và con có 5 miếng bánh cắt từ chiếc bánh chia làm 12 phần, hai mẹ con mình có thể cộng ngay số miếng lại để so sánh được không? Vì sao?&rdquo;
                </div>
              </div>

              {/* Expandable Deep Explanation */}
              <div className="border-t border-line/40 pt-3">
                <button
                  type="button"
                  onClick={() => setExpandedExplanation(!expandedExplanation)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-brand hover:underline py-1"
                >
                  <span>Giải thích bản chất sư phạm cho tôi</span>
                  {expandedExplanation ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {expandedExplanation && (
                  <div className="mt-3 p-3.5 rounded-app bg-canvas text-2xs text-ink-muted leading-relaxed space-y-2 border border-line/40">
                    <p>
                      Quy đồng mẫu số thực chất là tìm một kích thước mẫu số chung (bội chung nhỏ nhất) để chia nhỏ cả hai phân số thành các phần tương đương.
                    </p>
                    <p>
                      Mẫu số chung của 8 và 12 là 24. Khi đó 3/8 = 9/24 và 5/12 = 10/24. Kết quả chính xác là 19/24.
                    </p>
                    <div className="flex items-center gap-1.5 text-brand font-medium pt-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Trích xuất từ: SGK Toán 6 Tập 2, Chương Phân số (Chuẩn GDPT 2018).</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

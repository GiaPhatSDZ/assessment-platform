"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Bài khảo sát khác gì một bài thi thử hoặc kiểm tra thông thường?",
      a: "Bài kiểm tra thông thường chỉ chấm điểm số (ví dụ: 6/10) và kết luận chung chung. Bài khảo sát của AI School sử dụng phương pháp đối soát tiên quyết: Mỗi đáp án được gắn với mô thức nhầm lẫn sư phạm có căn cứ, hỗ trợ định vị mắt xích kiến thức cần ôn tập từ các lớp trước.",
    },
    {
      q: "Hệ thống có sử dụng AI để sinh câu hỏi hoặc chấm điểm cảm tính không?",
      a: "Tuyệt đối không. Toàn bộ câu hỏi chẩn đoán và cây tri thức được thẩm định cố định từ chương trình GDPT 2018 của Bộ Giáo dục & Đào tạo. Cơ chế chẩn đoán là hoàn toàn tất định (deterministic), không phỏng đoán ngẫu nhiên. Trí tuệ nhân tạo chỉ được dùng ở góc độ hỗ trợ phụ huynh tham khảo cách hướng dẫn con.",
    },
    {
      q: "Học sinh có bị gắn mác hoặc xếp hạng điểm số không?",
      a: "Không bao giờ. Chúng tôi kiên quyết bài trừ việc xếp hạng thi đua hay so sánh điểm số giữa các học sinh. Mọi kết quả chỉ hiển thị dưới dạng mắt xích năng lực ('Đã nắm vững' hoặc 'Cần củng cố') để giúp con học có trọng tâm mà không chịu áp lực tâm lý.",
    },
    {
      q: "Phụ huynh có cần để lại số điện thoại hay thông tin nhạy cảm không?",
      a: "Không thu thập số điện thoại. Để bắt đầu kiểm tra kiến thức cho con, phụ huynh chỉ cần truy cập trực tiếp. Khi muốn lưu trữ tiến trình học tập dài hạn, hệ thống chỉ sử dụng email để gửi liên kết đăng nhập Magic Link an toàn.",
    },
    {
      q: "Sau khi phát hiện lỗ hổng, con sẽ học lại như thế nào?",
      a: "Hệ thống tạo ra một gói học bù ngắn gọn, tập trung đúng vào mắt xích bị khuyết bằng tài liệu trích xuất từ SGK chuẩn. Sau khi đọc hiểu và làm bài tập mẫu, con sẽ làm bài kiểm tra lại song song để xác nhận đã nắm vững kiến thức.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-line/60 bg-canvas">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand tracking-widest uppercase bg-brand-soft/60 px-3 py-1 rounded-pill">
            <HelpCircle className="h-3.5 w-3.5" />
            Minh Bạch Sư Phạm
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink">
            Giải Đáp Thắc Mắc Về Phương Pháp Chẩn Đoán
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Các câu hỏi thường gặp của phụ huynh về tính khoa học, quyền riêng tư và hiệu quả học tập.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="rounded-app border border-line/70 bg-surface transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base sm:text-lg font-semibold text-ink leading-snug">
                    {faq.q}
                  </span>
                  <span className="text-ink-muted shrink-0">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-line/40 text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

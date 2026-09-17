"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Tại sao hệ thống không cho điểm số tổng quát 0-100?",
    answer:
      "Điểm số 70/100 hay 5/10 không mang lại giá trị sư phạm hành động. Điểm số đó không thể cho phụ huynh biết con làm sai vì không biết tính nhẩm, hay vì không hiểu bản chất quy đồng mẫu số. Hệ thống chia nhỏ kiến thức thành từng nút rời rạc và chỉ rõ nút nào đã vững (SECURE), nút nào đang hổng (DEVELOPING) để học bù đúng chỗ.",
  },
  {
    question: "Tại sao AI không trực tiếp chấm điểm bài làm?",
    answer:
      "Mô hình ngôn ngữ lớn (LLM) có thể bị ảo giác (hallucination) và thiếu tính nhất quán khi chấm điểm. Tại AI School V3, việc đánh giá trạng thái kiến thức hoàn toàn do động cơ tất định (Deterministic Engine) thực hiện dựa trên quy tắc toán học rõ ràng. AI chỉ đóng vai trò gia sư sư phạm ngoài luồng hỗ trợ học sinh tự học trên Google NotebookLM.",
  },
  {
    question: "Cây tri thức tiên quyết khác gì sách bài tập thông thường?",
    answer:
      "Sách bài tập thường xếp các bài toán theo từng chương tuyến tính. Khi học sinh làm sai bài ở Lớp 6, sách không thể tự động chỉ ra rằng nguyên nhân bắt nguồn từ một kỹ năng ở Lớp 4. Cây tri thức kết nối mạng lưới các mắt xích xuyên suốt các năm học, cho phép truy vết ngược về đúng điểm gốc rễ gây ra lỗi.",
  },
  {
    question: "Tôi có phải trả phí hay cung cấp số điện thoại không?",
    answer:
      "Hoàn toàn không. Lát cắt chẩn đoán Toán Lớp 6 được mở công khai và miễn phí cho mọi học sinh và phụ huynh. Chúng tôi không thu thập số điện thoại và cam kết không gọi điện telesale quảng cáo.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 md:py-20 border-b border-warm-200/80 bg-warm-50/50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-edu-700 dark:text-edu-400">
            8. Câu hỏi thường gặp (FAQ)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Giải Đáp Thắc Mắc Về Phương Pháp Chẩn Đoán
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-warm-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-edu-700 dark:hover:text-edu-400 transition"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform text-slate-400 ${
                      isOpen ? "rotate-180 text-edu-700" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-warm-100 dark:border-slate-800 pt-3">
                    {item.answer}
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

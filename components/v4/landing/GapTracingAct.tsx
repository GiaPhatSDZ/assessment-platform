"use client";

import React, { useState } from "react";
import { InlineMath } from "@/components/math/InlineMath";
import { ArrowDown, AlertCircle, Check, Search, Sparkles } from "lucide-react";

export function GapTracingAct() {
  const [activeStep, setActiveStep] = useState<number>(2);

  const steps = [
    {
      id: 1,
      tag: "BƯỚC 1: TRIỆU CHỨNG BỀ NỔI",
      title: "Con chọn một đáp án sai",
      description:
        "Khi gặp bài toán tính tổng hai phân số khác mẫu số, con đưa ra kết quả là 8/20.",
      mathPrefix: "Phép tính của con:",
      math: "\\frac{3}{8} + \\frac{5}{12} = \\frac{8}{20}",
      mathSuffix: "(Sai)",
      insight: "Cách dạy truyền thống: Cho con làm đi làm lại 50 bài tương tự.",
      badWay: true,
    },
    {
      id: 2,
      tag: "BƯỚC 2: PHÂN TÍCH ĐỒ THỊ TIÊN QUYẾT",
      title: "Hệ thống lần ngược cây tri thức",
      description:
        "Thay vì trừ điểm số đơn thuần, hệ thống đối chiếu với đồ thị tiên quyết chuẩn GDPT 2018. Lỗi 8/20 phản ánh dấu hiệu nhầm lẫn: Cộng thẳng tử với tử (3+5=8) và mẫu với mẫu (8+12=20).",
      mathPrefix: "Mô thức nhầm lẫn quan sát được:",
      math: "\\frac{a}{b} + \\frac{c}{d} = \\frac{a+c}{b+d}",
      insight: "Đặc điểm: Học sinh bỏ qua bước quy đồng vì chưa hiểu bản chất 'mẫu số biểu thị số phần bằng nhau'.",
      badWay: false,
    },
    {
      id: 3,
      tag: "BƯỚC 3: KHOANH VÙNG ĐÚNG MẮT XÍCH CẦN HỌC",
      title: "Chỉ học lại đúng phần bị hổng",
      description:
        "Con không cần học lại toàn bộ chương Phân số. Con chỉ cần củng cố lại bài 'Quy đồng mẫu số hai phân số' bằng hình ảnh trực quan.",
      mathPrefix: "Quy đồng mẫu số chung 24:",
      math: "\\frac{3}{8} = \\frac{9}{24}, \\quad \\frac{5}{12} = \\frac{10}{24}",
      insight: "Tiết kiệm thời gian, giải tỏa cảm giác tự ti, không ép học vẹt.",
      badWay: false,
    },
  ];

  return (
    <section id="gap-story" className="py-20 sm:py-28 border-t border-line/60 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (5 Cols) - Editorial Statement */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand tracking-widest uppercase bg-brand-soft/60 px-3 py-1 rounded-pill">
              <Search className="h-3.5 w-3.5" />
              Cách Tìm Lỗ Hổng
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-semibold text-ink leading-[1.1]">
              Một câu trả lời chưa đúng thường phản ánh mắt xích kiến thức chưa vững.
            </h2>

            <p className="text-base text-ink-muted leading-relaxed font-normal">
              Toán học là một chuỗi mắt xích liên tục. Khi học sinh gặp khó khăn ở lớp 6, trở ngại thường liên quan đến một khái niệm tiên quyết ở lớp 4 hoặc lớp 5 chưa được củng cố đầy đủ.
            </p>

            <div className="p-4 rounded-app bg-canvas border border-line/60 space-y-2 text-xs">
              <div className="font-semibold text-ink flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Nguyên lý khảo sát theo đồ thị tiên quyết:
              </div>
              <p className="text-ink-muted leading-relaxed">
                Mỗi phương án nhiễu trong bài khảo sát được xây dựng dựa trên mô thức nhầm lẫn có căn cứ sư phạm, hỗ trợ khoanh vùng kiến thức tiên quyết cần củng cố.
              </p>
            </div>
          </div>

          {/* Right Column (7 Cols) - Interactive Gap Tracing Steps */}
          <div className="lg:col-span-7 space-y-6">
            {steps.map((step, idx) => {
              const isSelected = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`cursor-pointer rounded-marketingWindow border transition-all p-6 sm:p-7 ${
                    isSelected
                      ? "border-brand bg-canvas shadow-xs"
                      : "border-line/60 bg-surfaceStrong/70 hover:border-line"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-2xs font-mono font-semibold tracking-wider text-ink-muted uppercase">
                      {step.tag}
                    </span>
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isSelected
                          ? "bg-brand text-white"
                          : "bg-line/40 text-ink-muted"
                      }`}
                    >
                      {step.id}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-ink mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-ink-muted leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Math Render */}
                  <div className="rounded-app bg-surface p-3.5 border border-line/50 text-center my-3 text-sm sm:text-base flex flex-wrap items-center justify-center gap-2 font-medium">
                    {step.mathPrefix && <span className="text-xs text-ink-muted">{step.mathPrefix}</span>}
                    <InlineMath math={step.math} />
                    {step.mathSuffix && <span className="text-xs text-danger font-semibold">{step.mathSuffix}</span>}
                  </div>

                  {/* Pedagogical Insight */}
                  <div
                    className={`mt-4 rounded-app p-3 text-xs flex items-start gap-2.5 ${
                      step.badWay
                        ? "bg-danger-soft/50 text-danger border border-danger/20"
                        : "bg-brand-soft/40 text-brand-dark border border-brand/20"
                    }`}
                  >
                    {step.badWay ? (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <Check className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{step.insight}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

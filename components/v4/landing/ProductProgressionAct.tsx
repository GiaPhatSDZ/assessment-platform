"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight, BookOpen, Compass, RefreshCw, Layers } from "lucide-react";

export function ProductProgressionAct() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const stages = [
    {
      stepNumber: "01",
      title: "Chẩn đoán có trọng tâm",
      subtitle: "3 đến 5 câu hỏi được thiết kế khoa học",
      description:
        "Bài chẩn đoán chỉ tập trung vào một chủ đề cụ thể. Các phương án sai được cài cắm ngộ nhận sư phạm điển hình để tìm chính xác mắt xích con đang bối rối.",
      icon: Compass,
      preview: {
        badge: "GIAO DIỆN TẬP TRUNG (FOCUS MODE)",
        header: "Toán · Lớp 6 · Phân số",
        body: "Tính tổng hai phân số khác mẫu số: 3/8 + 5/12",
        note: "Giao diện không quảng cáo, không điểm số thi đua, tập trung hoàn toàn vào tư duy.",
      },
    },
    {
      stepNumber: "02",
      title: "Khoanh vùng lỗ hổng gốc",
      subtitle: "Báo cáo bằng chứng, không phán xét",
      description:
        "Hệ thống không đánh giá con học 'yếu' hay 'kém'. Báo cáo chỉ ra chính xác mắt xích nền tảng bị khuyết (ví dụ: cần củng cố bước tìm mẫu số chung).",
      icon: Layers,
      preview: {
        badge: "BÁO CÁO MẮT XÍCH (INSIGHT MODE)",
        header: "Mắt xích cần củng cố: Quy đồng mẫu số",
        body: "Phát hiện: Con có xu hướng cộng trực tiếp mẫu với mẫu do chưa nắm vững khái niệm phần bằng nhau.",
        note: "Kèm theo bằng chứng đối soát với chương trình Toán Lớp 5 GDPT 2018.",
      },
    },
    {
      stepNumber: "03",
      title: "Học bù từ nguồn chuẩn",
      subtitle: "Gói bài học trích từ SGK thẩm định",
      description:
        "Không bắt con xem hàng giờ video lan man. Con được cung cấp gói học bù cô đọng với hình ảnh trực quan và bài tập mẫu từ sách giáo khoa đã thẩm định.",
      icon: BookOpen,
      preview: {
        badge: "GÓI TÀI LIỆU HỌC BÙ CHUẨN MỰC",
        header: "Bài học: Quy đồng mẫu số hai phân số",
        body: "Phương pháp trực quan: Vẽ thanh phân số để nhận biết mẫu số chung nhỏ nhất là 24.",
        note: "Có thể xuất tài liệu sang Gemini / NotebookLM để phụ huynh nhận bộ câu hỏi gợi ý.",
      },
    },
    {
      stepNumber: "04",
      title: "Kiểm tra lại & Xác nhận Đạt",
      subtitle: "Đóng vòng lặp học tập thực chất",
      description:
        "Sau khi củng cố, con làm bài kiểm tra lại song song (các câu hỏi mới cùng cấu trúc). Khi làm đúng, trạng thái tự động chuyển thành 'Đã nắm vững'.",
      icon: RefreshCw,
      preview: {
        badge: "KIỂM TRA LẠI & CHUYỂN ĐỔI NĂNG LỰC",
        header: "Bài test lại song song: 3 câu hỏi mới",
        body: "Kết quả: 3/3 câu đạt. Mắt xích chuyển từ [Cần củng cố] sang [Đã nắm vững].",
        note: "Lưu lịch sử kiểm toán minh bạch, phụ huynh theo dõi được sự tiến bộ có bằng chứng.",
      },
    },
  ];

  const current = stages[activeTab];

  return (
    <section className="py-20 sm:py-28 border-t border-line/60 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-semibold text-brand tracking-widest uppercase bg-brand-soft/60 px-3 py-1 rounded-pill">
            Quy Trình Học Tập Khép Kín
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-semibold text-ink leading-[1.1]">
            Từ phát hiện lỗ hổng đến khi nắm vững.
          </h2>
          <p className="text-base text-ink-muted leading-relaxed font-normal">
            Không học vẹt, không làm đề thi thử vô tận. 4 bước khoa học giúp con lấp đúng phần kiến thức bị khuyết.
          </p>
        </div>

        {/* 4 Tabs / Steps Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stages.map((stage, idx) => {
            const isSelected = activeTab === idx;
            const Icon = stage.icon;
            return (
              <button
                key={stage.stepNumber}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`p-4 sm:p-5 rounded-app text-left transition-all border ${
                  isSelected
                    ? "bg-canvas border-brand shadow-2xs text-ink"
                    : "bg-surfaceStrong border-line/50 hover:border-line text-ink-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-brand">
                    {stage.stepNumber}
                  </span>
                  <Icon className={`h-4 w-4 ${isSelected ? "text-brand" : "text-ink-muted"}`} />
                </div>
                <div className="font-serif text-base sm:text-lg font-bold line-clamp-1 text-ink">
                  {stage.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Product Scene Window */}
        <div className="rounded-marketingWindow border border-line/80 bg-canvas p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
                Bước {current.stepNumber} Trong Chu Trình
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                {current.title}
              </h3>
              <div className="text-xs font-semibold text-ink-muted">
                {current.subtitle}
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Right UI Scene Preview */}
            <div className="lg:col-span-7">
              <div className="rounded-app border border-line/80 bg-surface p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-line/50 pb-3">
                  <span className="text-2xs font-mono font-semibold tracking-wider text-brand uppercase bg-brand-soft/60 px-2.5 py-0.5 rounded-pill">
                    {current.preview.badge}
                  </span>
                  <span className="text-2xs text-ink-muted">Mô phỏng thực tế</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-ink">
                    {current.preview.header}
                  </h4>
                  <div className="p-3.5 rounded-lg bg-canvas text-xs text-ink font-medium leading-relaxed border border-line/40">
                    {current.preview.body}
                  </div>
                </div>

                <p className="text-2xs text-ink-muted italic border-t border-line/40 pt-3">
                  {current.preview.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

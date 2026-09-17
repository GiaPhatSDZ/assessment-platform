"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookCheck, Clock, Ban } from "lucide-react";

type StageKey = "PRESCHOOL" | "PRIMARY" | "LOWER_SECONDARY" | "UPPER_SECONDARY";

interface StageData {
  title: string;
  subtitle: string;
  sourceStandard: string;
  grades: {
    gradeName: string;
    topics: {
      name: string;
      status: "READY" | "IN_REVIEW" | "BLOCKED";
      detail: string;
      href?: string;
    }[];
  }[];
}

const STAGE_CONFIG: Record<StageKey, StageData> = {
  PRESCHOOL: {
    title: "Mầm non",
    subtitle: "Trẻ 3 – 5 tuổi",
    sourceStandard: "Thông tư 28/2016/TT-BGDĐT & Đề án 2026",
    grades: [
      {
        gradeName: "Mẫu giáo Lớn (5 tuổi)",
        topics: [
          {
            name: "Làm quen với biểu tượng số & đếm đối tượng",
            status: "IN_REVIEW",
            detail: "Đang hoàn tất thẩm định sư phạm đồ thị tiên quyết.",
          },
          {
            name: "Nhận biết hình khối và định hướng không gian",
            status: "BLOCKED",
            detail: "Chưa mở đánh giá trực tuyến vì cần tương tác trực quan thực tế.",
          },
        ],
      },
    ],
  },
  PRIMARY: {
    title: "Tiểu học",
    subtitle: "Lớp 1 đến Lớp 5",
    sourceStandard: "Thông tư 32/2018/TT-BGDĐT",
    grades: [
      {
        gradeName: "Lớp 4 & Lớp 5",
        topics: [
          {
            name: "Khái niệm phân số & Phép so sánh phân số",
            status: "READY",
            detail: "Đã có đầy đủ đồ thị tiên quyết và câu hỏi kiểm định ngộ nhận.",
          },
          {
            name: "Quy đồng mẫu số hai phân số",
            status: "READY",
            detail: "Đã tích hợp trong lát cắt liên kết với chương trình Lớp 6.",
          },
        ],
      },
    ],
  },
  LOWER_SECONDARY: {
    title: "THCS",
    subtitle: "Lớp 6 đến Lớp 9",
    sourceStandard: "Thông tư 32/2018/TT-BGDĐT",
    grades: [
      {
        gradeName: "Lớp 6",
        topics: [
          {
            name: "Phân số: Cộng, trừ phân số khác mẫu số",
            status: "READY",
            detail: "Lát cắt chẩn đoán hoàn chỉnh, có gói học bù SGK và test lại song song.",
            href: "/learn/new",
          },
          {
            name: "Số học: Ước chung lớn nhất & Bội chung nhỏ nhất",
            status: "READY",
            detail: "Đồ thị tiên quyết phục vụ bước quy đồng mẫu số.",
          },
          {
            name: "Hình học trực quan: Các hình phẳng trong thực tiễn",
            status: "IN_REVIEW",
            detail: "Đang biên soạn các câu hỏi trắc nghiệm chẩn đoán quan sát.",
          },
        ],
      },
      {
        gradeName: "Lớp 7, 8, 9",
        topics: [
          {
            name: "Số hữu tỉ, Định lý Thalès, Phương trình bậc nhất",
            status: "IN_REVIEW",
            detail: "Đang tiến hành rà soát chuẩn đầu ra quốc gia.",
          },
        ],
      },
    ],
  },
  UPPER_SECONDARY: {
    title: "THPT",
    subtitle: "Lớp 10 đến Lớp 12",
    sourceStandard: "Thông tư 32/2018/TT-BGDĐT",
    grades: [
      {
        gradeName: "Lớp 10 – 12",
        topics: [
          {
            name: "Hàm số, Lượng giác, Hình học không gian, Tích phân",
            status: "BLOCKED",
            detail: "Chưa mở thử nghiệm cho đến khi hoàn thành chuẩn hóa cấp THCS.",
          },
        ],
      },
    ],
  },
};

export function CurriculumRailAct() {
  const [activeStage, setActiveStage] = useState<StageKey>("LOWER_SECONDARY");
  const stage = STAGE_CONFIG[activeStage];

  return (
    <section className="py-20 sm:py-28 border-t border-line/60 bg-canvas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-semibold text-brand tracking-widest uppercase bg-brand-soft/60 px-3 py-1 rounded-pill">
            Phạm Vi Chương Trình K–12
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-semibold text-ink leading-[1.1]">
            Minh bạch từng cấp học. Không tạo số liệu ảo.
          </h2>
          <p className="text-base text-ink-muted leading-relaxed font-normal">
            Chúng tôi chỉ mở chẩn đoán khi đồ thị tri thức đã được thẩm định sư phạm đầy đủ theo chương trình GDPT 2018.
          </p>
        </div>

        {/* Stage Rail + Detail Panel Layout (Editorial layout, not equal SaaS cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Rail: Typographic Stage Selector (4 cols) */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {(
              [
                { key: "PRESCHOOL", label: "Mầm non", range: "3 – 5 tuổi" },
                { key: "PRIMARY", label: "Tiểu học", range: "Lớp 1 – 5" },
                { key: "LOWER_SECONDARY", label: "THCS", range: "Lớp 6 – 9" },
                { key: "UPPER_SECONDARY", label: "THPT", range: "Lớp 10 – 12" },
              ] as const
            ).map((item) => {
              const selected = activeStage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveStage(item.key)}
                  className={`w-full text-left p-4 sm:p-5 rounded-app transition-all border shrink-0 ${
                    selected
                      ? "bg-surface border-brand shadow-xs text-ink"
                      : "bg-surface/50 border-transparent hover:bg-surface text-ink-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl sm:text-2xl font-bold">
                      {item.label}
                    </span>
                    <span className="text-2xs font-mono font-medium px-2 py-0.5 rounded-pill bg-canvas">
                      {item.range}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail Panel: List Rows with Verified Status (8 cols) */}
          <div className="lg:col-span-8 rounded-marketingWindow border border-line/70 bg-surface p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/50 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-ink">
                  Cấp {stage.title} ({stage.subtitle})
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Cơ sở đối soát: <span className="font-medium text-ink">{stage.sourceStandard}</span>
                </p>
              </div>

              <Link
                href="/curriculum"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
              >
                <span>Xem toàn bộ bản đồ tri thức</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Grade Groups */}
            <div className="space-y-6">
              {stage.grades.map((gradeGroup) => (
                <div key={gradeGroup.gradeName} className="space-y-3">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                    {gradeGroup.gradeName}
                  </h4>

                  <div className="space-y-2.5">
                    {gradeGroup.topics.map((topic) => (
                      <div
                        key={topic.name}
                        className="rounded-app border border-line/50 bg-surfaceStrong p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="text-sm font-semibold text-ink">
                            {topic.name}
                          </div>
                          <p className="text-xs text-ink-muted leading-relaxed">
                            {topic.detail}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {topic.status === "READY" && (
                            <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-brand bg-brand-soft/70 px-3 py-1 rounded-pill">
                              <BookCheck className="h-3 w-3" />
                              Đã có nội dung
                            </span>
                          )}

                          {topic.status === "IN_REVIEW" && (
                            <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-accent bg-accent-soft/70 px-3 py-1 rounded-pill text-amber-900">
                              <Clock className="h-3 w-3" />
                              Đang kiểm duyệt
                            </span>
                          )}

                          {topic.status === "BLOCKED" && (
                            <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-ink-muted bg-canvas px-3 py-1 rounded-pill">
                              <Ban className="h-3 w-3" />
                              Chưa hỗ trợ
                            </span>
                          )}

                          {topic.href && (
                            <Link
                              href={topic.href}
                              className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
                            >
                              <span>Chẩn đoán</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Users, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react";

export function ParentView() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-brand-soft/60 px-3 py-1 text-xs font-semibold text-brand">
          <Users className="h-3.5 w-3.5 text-brand" />
          <span>Góc Nhìn Dành Cho Phụ Huynh</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-ink mt-3">
          Nhận Diện Vướng Mắc Thực Tế — Đồng Hành Cùng Con Đúng Cách
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed font-normal">
          Hệ thống loại bỏ hoàn toàn các chỉ số ảo, xếp hạng so sánh hay phỏng đoán bằng AI. Chúng tôi chỉ cung cấp thông tin trung thực dựa trên cây tri thức đối soát nguồn chính thức.
        </p>
      </div>

      {/* 3 Core Commitments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-app border border-line bg-surface p-5 space-y-2.5 shadow-2xs">
          <div className="text-brand font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Không Xếp Hạng So Sánh</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed font-normal">
            Không tạo áp lực cho con bằng phần trăm điểm ảo hay thứ hạng thi đua. Mỗi đứa trẻ có tiến độ làm chủ kiến thức riêng biệt.
          </p>
        </div>

        <div className="rounded-app border border-line bg-surface p-5 space-y-2.5 shadow-2xs">
          <div className="text-brand font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Ôn Tập Đúng Trọng Tâm</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed font-normal">
            Khi con làm sai bài cộng phân số, giải pháp không phải là làm 100 bài lặp lại, mà là ôn tập lại đúng mắt xích <em>Quy đồng mẫu số</em>.
          </p>
        </div>

        <div className="rounded-app border border-line bg-surface p-5 space-y-2.5 shadow-2xs">
          <div className="text-brand font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Tôn Trọng Sự Riêng Tư</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed font-normal">
            Không yêu cầu số điện thoại để xem kết quả. Không telesale tiếp thị, không quảng cáo khóa học thương mại.
          </p>
        </div>
      </div>

      {/* Example Guide for Parents */}
      <div className="rounded-marketingWindow border border-line bg-surface p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-warm-100 px-2 py-0.5 text-[11px] font-bold text-warm-800 dark:bg-slate-800 dark:text-slate-300">
              Ví dụ minh họa
            </span>
            <h3 className="font-serif text-lg font-bold text-ink">
              Quy Trình Đồng Hành Mẫu Cùng Con (Ví dụ minh họa)
            </h3>
          </div>
          <span className="text-[11px] italic text-ink-muted">
            Học liệu Toán Lớp 6 hiện ở trạng thái DRAFT chờ thẩm định
          </span>
        </div>

        <p className="text-xs text-ink-muted italic leading-relaxed">
          Ví dụ minh họa: Dưới đây là mô hình quy trình đồng hành khi chủ đề hoàn tất thẩm định. Hiện tại ngân hàng câu hỏi Toán Lớp 6 đang ở trạng thái DRAFT chờ phê duyệt sư phạm (0 câu hỏi phát hành, CONTENT_NOT_AVAILABLE), chưa mở khảo sát cho học sinh.
        </p>

        <div className="space-y-3 text-xs text-ink">
          <div className="p-4 rounded-app bg-surfaceStrong border border-line/60 space-y-1">
            <strong className="text-brand font-semibold">1. Khảo sát chẩn đoán có thẩm định (Ví dụ minh họa quy trình):</strong>
            <p className="text-ink-muted leading-relaxed">
              Khi bộ câu hỏi hoàn tất thẩm định và mở chính thức, phụ huynh có thể cùng con thực hiện khảo sát nhận thức ngắn gọn để đồ thị tri thức phản ánh mắt xích đã vững hoặc cần bổ trợ. (Hiện tại: Chủ đề Toán Lớp 6 đang ở trạng thái DRAFT, phòng thi đóng bảo vệ học sinh).
            </p>
          </div>
          <div className="p-4 rounded-app bg-surfaceStrong border border-line/60 space-y-1">
            <strong className="text-brand font-semibold">2. Đọc to phần phân tích mô thức nhầm lẫn:</strong>
            <p className="text-ink-muted leading-relaxed">
              Giúp con nhận diện các ngộ nhận phổ biến đã được chuẩn hóa (ví dụ: &ldquo;Hóa ra mình hay cộng gộp cả tử và mẫu vì chưa chuyển đổi về cùng một đơn vị chia chung&rdquo;).
            </p>
          </div>
          <div className="p-4 rounded-app bg-surfaceStrong border border-line/60 space-y-1">
            <strong className="text-brand font-semibold">3. Tham khảo Trợ lý Phụ huynh (Parent Copilot):</strong>
            <p className="text-ink-muted leading-relaxed">
              Phụ huynh có thể sử dụng prompt đối soát nguồn chuẩn để nhận bộ câu hỏi gợi ý phương pháp đồng hành cùng con mà không làm thay con. Trẻ em không trực tiếp sử dụng hay trò chuyện với AI.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[11px] text-ink-muted">
            Trạng thái học liệu: <em>Toán Lớp 6 (DRAFT) · 0 câu hỏi phát hành · CONTENT_NOT_AVAILABLE</em>
          </p>
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-dark transition"
          >
            <span>Xem danh mục chương trình</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

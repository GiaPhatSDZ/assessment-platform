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
        <h3 className="font-serif text-lg font-bold text-ink">
          Gợi Ý Phụ Huynh Có Thể Làm Cùng Con Tối Nay
        </h3>

        <div className="space-y-3 text-xs text-ink">
          <div className="p-4 rounded-app bg-surfaceStrong border border-line/60 space-y-1">
            <strong className="text-brand font-semibold">1. Khảo sát nhanh 5 phút:</strong>
            <p className="text-ink-muted leading-relaxed">
              Cùng con làm 4 câu hỏi nhận thức môn Toán 6 để xem đồ thị tri thức phản ánh mắt xích nào đã vững và mắt xích nào cần bổ trợ.
            </p>
          </div>
          <div className="p-4 rounded-app bg-surfaceStrong border border-line/60 space-y-1">
            <strong className="text-brand font-semibold">2. Đọc to phần phân tích mô thức nhầm lẫn:</strong>
            <p className="text-ink-muted leading-relaxed">
              Giúp con nhận diện: &ldquo;Hóa ra mình hay cộng gộp cả tử và mẫu vì chưa chuyển đổi về cùng một đơn vị chia chung&rdquo;.
            </p>
          </div>
          <div className="p-4 rounded-app bg-surfaceStrong border border-line/60 space-y-1">
            <strong className="text-brand font-semibold">3. Tham khảo Trợ lý Phụ huynh (Parent Copilot):</strong>
            <p className="text-ink-muted leading-relaxed">
              Phụ huynh có thể sử dụng prompt đối soát nguồn chuẩn để nhận bộ câu hỏi gợi ý phương pháp đồng hành cùng con mà không làm thay con. Trẻ em không trực tiếp sử dụng hay trò chuyện với AI.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            href="/learn/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-dark transition"
          >
            <span>Bắt đầu khảo sát cùng con</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Users, ShieldCheck, HeartHandshake, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";

export function ParentView() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-warm-200 pb-4 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-edu-200 bg-edu-50 px-3 py-0.5 text-xs font-semibold text-edu-800 dark:bg-edu-950/40 dark:text-edu-300">
          <Users className="h-3.5 w-3.5 text-edu-700" />
          <span>Góc Nhìn Dành Cho Phụ Huynh</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
          Hiểu Rõ Lỗ Hổng Thực Sự — Đồng Hành Cùng Con Đúng Cách
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Hệ thống loại bỏ hoàn toàn các chỉ số ảo, xếp hạng so sánh hay phỏng đoán bằng AI. Chúng tôi chỉ cung cấp thông tin trung thực dựa trên cây tri thức.
        </p>
      </div>

      {/* 3 Core Commitments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-warm-200 bg-white p-5 space-y-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-edu-700 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Không Xếp Hạng So Sánh</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Không tạo áp lực cho con bằng phần trăm điểm ảo hay xếp thứ hạng. Mỗi đứa trẻ có tốc độ làm chủ khác nhau.
          </p>
        </div>

        <div className="rounded-2xl border border-warm-200 bg-white p-5 space-y-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-edu-700 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Không Học Thêm Tràn Lan</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Khi con làm sai bài cộng phân số, giải pháp không phải là làm 100 bài tương tự, mà là học lại đúng bước <em>Quy đồng mẫu số</em>.
          </p>
        </div>

        <div className="rounded-2xl border border-warm-200 bg-white p-5 space-y-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-edu-700 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Tôn Trọng Sự Riêng Tư</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Không bắt buộc nhập số điện thoại để xem kết quả. Không telesale, không quảng cáo khóa học thương mại.
          </p>
        </div>
      </div>

      {/* Example Guide for Parents */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Gợi Ý Phụ Huynh Có Thể Làm Cùng Con Tối Nay
        </h3>

        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-warm-50/60 border border-warm-200 dark:bg-slate-800/40 dark:border-slate-800">
            <strong>1. Kiểm tra chẩn đoán 5 phút:</strong> Cùng con làm 4 câu hỏi chẩn đoán Toán 6 để xem cây đồ thị hiển thị nút màu xanh hay màu đỏ.
          </div>
          <div className="p-3.5 rounded-xl bg-warm-50/60 border border-warm-200 dark:bg-slate-800/40 dark:border-slate-800">
            <strong>2. Đọc to phần Phân tích ngộ nhận:</strong> Giúp con nhận ra &ldquo;À, hóa ra mình hay cộng tử với tử, mẫu với mẫu vì chưa hiểu bản chất quy đồng&rdquo;.
          </div>
          <div className="p-3.5 rounded-xl bg-warm-50/60 border border-warm-200 dark:bg-slate-800/40 dark:border-slate-800">
            <strong>3. Cho con thử nghiệm với Google NotebookLM:</strong> Sao chép prompt mẫu và hướng dẫn con đặt câu hỏi cho AI theo từng bước nhỏ.
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Link
            href="/learn/new"
            className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition"
          >
            <span>Bắt đầu kiểm tra cho con ngay</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

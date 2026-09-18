"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
} from "lucide-react";

export function NewDiagnosticWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form selections
  const [learnerName, setLearnerName] = useState("Con tôi / Học sinh");
  const [selectedGrade, setSelectedGrade] = useState("GRADE_6");
  const [selectedSubject, setSelectedSubject] = useState("MATH");
  const [selectedTopic, setSelectedTopic] = useState("NODE-MATH-6-FRAC-03");

  const handleStart = () => {
    // Navigate to the verified vertical slice
    router.push("/diagnostic/math-grade6");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      {/* Step Header */}
      <div className="border-b border-warm-200 pb-4 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Bước {step} / 4</span>
          <span className="font-semibold text-edu-700 dark:text-edu-400">
            {step === 1 && "1. Chọn người học"}
            {step === 2 && "2. Chọn khối lớp"}
            {step === 3 && "3. Chọn môn học"}
            {step === 4 && "4. Chọn chủ đề kiểm tra"}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-warm-200 overflow-hidden dark:bg-slate-800">
          <div
            className="h-full bg-edu-700 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Learner */}
      {step === 1 && (
        <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Ai là người tham gia bài chẩn đoán?
          </h2>
          <p className="text-xs text-slate-500">
            Thông tin này dùng để cá nhân hóa báo cáo và phân tích sư phạm.
          </p>

          <div className="space-y-3 pt-2">
            <input
              type="text"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
              placeholder="Tên học sinh (ví dụ: Bảo Nam)"
              className="w-full rounded-xl border border-warm-300 px-4 py-3 text-sm text-slate-900 focus:border-edu-600 focus:outline-none focus:ring-2 focus:ring-edu-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Grade */}
      {step === 2 && (
        <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Chọn khối lớp theo chương trình Bộ GD&ĐT
          </h2>
          <p className="text-xs text-slate-500">
            Nội dung Lớp 6 (THCS) đang trong quá trình thẩm định đối soát sư phạm (DRAFT).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedGrade("GRADE_6")}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedGrade === "GRADE_6"
                  ? "border-edu-700 bg-edu-50/60 ring-2 ring-edu-600/30 dark:bg-edu-950/40"
                  : "border-warm-200 hover:border-warm-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-edu-700 mb-1">
                <span>Lớp 6 (THCS)</span>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 font-bold">
                  Đang thẩm định (DRAFT)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT).
              </p>
            </button>

            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-warm-50/50 opacity-60 text-left dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>Lớp 7 - 12 & Tiểu học</span>
                <span className="text-[10px] text-slate-500">BLOCKED_BY_EVIDENCE</span>
              </div>
              <p className="text-xs text-slate-400">
                Đang đối soát chuẩn đầu ra quốc gia trước khi mở chẩn đoán.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Subject */}
      {step === 3 && (
        <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Chọn môn học cần chẩn đoán
          </h2>
          <p className="text-xs text-slate-500">
            Chỉ mở chẩn đoán khi nội dung và ngộ nhận sư phạm đã được chuyên gia hoàn tất thẩm định.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedSubject("MATH")}
              className="p-4 rounded-xl border border-edu-700 bg-edu-50/60 ring-2 ring-edu-600/30 text-left dark:bg-edu-950/40"
            >
              <div className="flex items-center justify-between text-xs font-bold text-edu-700 mb-1">
                <span>Toán học</span>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 font-bold">
                  Đang thẩm định (CONTENT_IN_REVIEW)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Toán 6: Số học và Phân số.
              </p>
            </button>

            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-warm-50/50 opacity-60 text-left dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>Khoa học tự nhiên / Tiếng Anh</span>
                <span className="text-[10px] text-slate-500">Chưa hỗ trợ</span>
              </div>
              <p className="text-xs text-slate-400">
                Không sinh bài kiểm tra bừa bãi bằng AI khi chưa có đồ thị tri thức.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Supported Topic Selection */}
      {step === 4 && (
        <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Chọn chủ đề kiến thức mục tiêu
          </h2>
          <p className="text-xs text-slate-500">
            Chủ đề được neo trực tiếp vào văn bản quy chuẩn môn Toán Lớp 6 (Trang 55, TT 32/2018).
          </p>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedTopic("NODE-MATH-6-FRAC-03")}
              className="w-full p-4 rounded-xl border border-edu-700 bg-edu-50/70 ring-2 ring-edu-600/30 text-left dark:bg-edu-950/40"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
                <span>Cộng, trừ hai phân số không cùng mẫu số</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Đang thẩm định (DRAFT)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Bao gồm cây tiên quyết: BCNN → Cộng cùng mẫu số → Quy đồng mẫu số → Phép tính khác mẫu.
              </p>
            </button>

            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-warm-50/50 opacity-60 text-left dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>Phép nhân và phép chia phân số</span>
                <span className="text-[10px] text-slate-500">Đang biên soạn</span>
              </div>
              <p className="text-xs text-slate-400">
                Chưa mở bài kiểm tra cho chủ đề này.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-warm-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại</span>
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition active:scale-[0.98]"
            >
              <span>Vào phòng chẩn đoán</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

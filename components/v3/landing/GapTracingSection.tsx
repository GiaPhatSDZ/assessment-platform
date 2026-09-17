import React from "react";
import { MathText } from "@/components/math/MathText";
import { ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export function GapTracingSection() {
  return (
    <section className="py-16 md:py-20 border-b border-warm-200/80 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-edu-700 dark:text-edu-400 mb-2">
            1. Nguyên lý truy vết lỗ hổng (Gap Tracing)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tại Sao Con Học Thêm Nhiều Nhưng Vẫn Làm Sai Bài Tập?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Các bài kiểm tra truyền thống thường chỉ cho điểm số <em>5/10</em> hoặc kết luận <em>&ldquo;con chưa chăm học&rdquo;</em>. Thực tế, kiến thức toán học được xây dựng như một chuỗi mắt xích liên hoàn. Nếu một mắt xích bên dưới bị hổng, toàn bộ các bài toán bên trên sẽ sụp đổ.
          </p>
        </div>

        {/* Real Example Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-warm-200 bg-warm-50/50 p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900/50 dark:bg-red-950/30">
              <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300">
                <ShieldAlert className="h-4 w-4" />
                <span>Biểu hiện bề mặt của học sinh</span>
              </div>
              <div className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                <MathText text="\\frac{3}{8} + \\frac{5}{12} = \\frac{8}{20}" />
              </div>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                Ngộ nhận: Lấy tử cộng tử, mẫu cộng mẫu. Điểm số bài thi bị 0 điểm.
              </p>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white">Cách giải quyết sai lầm:</div>
              <p>Bắt con làm lại 50 bài tính cộng khác mẫu $\rightarrow$ Con chán nản, sợ học và tiếp tục sai.</p>
              <div className="font-bold text-slate-900 dark:text-white pt-1">Cách AI School V3 giải quyết:</div>
              <p>Duyệt ngược đồ thị tri thức $\rightarrow$ Phát hiện con bị hổng bước <strong>Quy đồng mẫu số</strong> và <strong>BCNN</strong>. Chỉ cần học bù đúng 15 phút là giải quyết dứt điểm.</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Chuỗi mắt xích được phục hồi từng bước:
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30 text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Nút 1: Tìm BCNN(8, 12) = 24</div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px]">Nền tảng số tự nhiên Lớp 6 · Đã kiểm tra đạt</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-red-300 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30 text-xs ring-2 ring-red-300/60">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <div className="font-bold text-red-900 dark:text-red-300">Nút 2: Quy đồng mẫu số các phân số (LỖ HỔNG GỐC RỄ)</div>
                  <div className="text-red-800 dark:text-red-200 text-[11px]">Học sinh chưa biết nhân thừa số phụ để đưa về mẫu chung 24 · Cần học bù ngay</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-warm-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs">
                <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">3</div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Nút 3: Cộng hai phân số cùng mẫu số</div>
                  <div className="text-slate-500 text-[11px]">Kiến thức Lớp 4 (9/24 + 10/24 = 19/24) · Tự động giải được khi xong bước 2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

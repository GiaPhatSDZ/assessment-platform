import Link from "next/link";
import { ArrowRight, BookOpen, Check, ShieldCheck, Sparkles } from "lucide-react";

export function V3VerticalSliceSection() {
  return (
    <section className="border-y border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Lát Cắt Mẫu Chuẩn Hóa Thực Tế (Evidence-First Vertical Slice)</span>
          </div>

          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            “Con đang hổng kiến thức nào, bằng chứng nào chứng minh điều đó, và nên học lại từ đâu?”
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Thay vì một bài trắc nghiệm tính điểm 0–100 mơ hồ, AI School lần theo cây kiến thức tiên quyết chuẩn Bộ GD&ĐT để tìm chính xác điểm nghẽn nhận thức của con.
          </p>
        </div>

        {/* The Slice Demonstration Box */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Toán Học Lớp 6 · Mạch Số & Đại Số
              </span>
              <h3 className="mt-1 font-serif text-xl font-bold text-slate-900 dark:text-white">
                Chuyên Đề: Phân Số & Quy Tắc Quy Đồng (BCNN)
              </h3>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-100/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <span>Căn cứ Thông tư 32/2018/TT-BGDĐT</span>
            </div>
          </div>

          {/* Prerequisite Node Flow */}
          <div className="mt-8">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Chuỗi tri thức tiên quyết được chẩn đoán tự động:
            </h4>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[10px] font-bold text-slate-400">NỀN TẢNG TIỂU HỌC</span>
                <p className="mt-1 font-serif text-sm font-bold text-slate-900 dark:text-white">Cộng cùng mẫu số</p>
                <p className="mt-1 text-xs text-slate-500">Lớp 4 (Giữ nguyên mẫu, cộng tử số)</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">ĐIỂM NGHẼN PHỔ BIẾN</span>
                <p className="mt-1 font-serif text-sm font-bold text-slate-900 dark:text-white">Tìm BCNN</p>
                <p className="mt-1 text-xs text-slate-500">Lớp 6 (Phân tích thừa số nguyên tố)</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">BƯỚC TIÊN QUYẾT</span>
                <p className="mt-1 font-serif text-sm font-bold text-slate-900 dark:text-white">Quy đồng mẫu số</p>
                <p className="mt-1 text-xs text-slate-500">Lớp 6 (Tìm mẫu số chung dương)</p>
              </div>

              <div className="rounded-2xl border-2 border-indigo-600/30 bg-indigo-50/40 p-4 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-950/30">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">MỤC TIÊU BÀI HỌC</span>
                <p className="mt-1 font-serif text-sm font-bold text-indigo-950 dark:text-indigo-100">Cộng khác mẫu số</p>
                <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-300/80">Lớp 6 (Yêu cầu cần đạt chuẩn)</p>
              </div>
            </div>
          </div>

          {/* 3 Pillars of Anti-Slop */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Không thu thập SĐT:</strong> Không telesale, không spam gia đình.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Không phỏng đoán AI:</strong> Lỗ hổng được xác định qua quy tắc toán học minh bạch.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Có Gói học tập & Re-test:</strong> Đưa đúng tài liệu học lại và kiểm tra lại để đóng lỗ hổng.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span>Thời gian chẩn đoán: ~3 phút (4 câu hỏi then chốt)</span>
            </div>

            <Link
              href="/diagnostic/math-grade6"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 active:scale-98"
            >
              <span>Trải Nghiệm Chẩn Đoán Lỗ Hổng Ngay</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

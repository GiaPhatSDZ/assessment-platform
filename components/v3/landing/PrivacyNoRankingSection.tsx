import React from "react";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

export function PrivacyNoRankingSection() {
  return (
    <section className="py-16 md:py-20 border-b border-warm-200/80 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-edu-700 dark:text-edu-400 mb-2">
            7. Bảo vệ quyền riêng tư & Không xếp hạng (Privacy & No Ranking)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Nền Tảng Giáo Dục Thuần Khiết — Tôn Trọng Tuyệt Đối Sự Riêng Tư
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Chúng tôi tin rằng giáo dục là để tiến bộ cá nhân, không phải để tạo ra sự so sánh hay bán khóa học thông qua nỗi sợ hãi của phụ huynh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-warm-200 bg-warm-50/40 p-6 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-edu-50 text-edu-700 dark:bg-edu-950 dark:text-edu-300">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Không thu thập số điện thoại
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có thể làm bài chẩn đoán và nhận toàn bộ báo cáo lỗ hổng kiến thức mà không cần để lại số điện thoại cá nhân.
            </p>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-warm-50/40 p-6 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-edu-50 text-edu-700 dark:bg-edu-950 dark:text-edu-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Không telesale bán hàng
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Không có nhân viên gọi điện mời chào gia sư hay lớp học thêm. Mọi học liệu bổ trợ đều mở và bám sát SGK chuẩn.
            </p>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-warm-50/40 p-6 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-edu-50 text-edu-700 dark:bg-edu-950 dark:text-edu-300">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Không xếp hạng ảo
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Chúng tôi kiên quyết không tạo ra bảng xếp hạng phần trăm (percentile) giả định để so sánh giữa các học sinh.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

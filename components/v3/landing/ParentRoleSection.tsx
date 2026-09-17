import React from "react";
import Link from "next/link";
import { Users, HeartHandshake, ArrowRight } from "lucide-react";

export function ParentRoleSection() {
  return (
    <section className="py-16 md:py-20 border-b border-warm-200/80 bg-warm-50/50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-edu-700 dark:text-edu-400 mb-2">
            6. Vai trò của phụ huynh (Parent Role)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Đồng Hành Cùng Con Bằng Sự Thấu Hiểu, Không Phải Áp Lực
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Phụ huynh không cần phải là chuyên gia toán học để dạy con. Khi biết chính xác con hổng chỗ nào, cha mẹ có thể động viên đúng lúc và giúp con học lại đúng 1 nút kỹ năng nhỏ mà con đang vướng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Trước đây: Bối rối và căng thẳng
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Thấy con bị điểm kém $\rightarrow$ nghĩ con lười học $\rightarrow$ bắt con làm thêm nhiều đề toán $\rightarrow$ con càng làm càng sai $\rightarrow$ gia đình căng thẳng, con mất tự tin.
            </p>
          </div>

          <div className="rounded-2xl border border-edu-200 bg-edu-50/40 p-6 sm:p-8 dark:border-edu-900/40 dark:bg-edu-950/20 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Với AI School V3: Rõ ràng và nhẹ nhàng
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Nhìn vào cây tri thức: <em>&ldquo;Con làm BCNN rất tốt, chỉ cần ôn lại cách nhân thừa số phụ khi quy đồng&rdquo;</em> $\rightarrow$ Con hiểu ra vấn đề, làm đúng bài tập $\rightarrow$ Khôi phục niềm yêu thích học tập.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/parent"
            className="inline-flex items-center gap-2 text-xs font-semibold text-edu-700 hover:text-edu-800 dark:text-edu-400"
          >
            <span>Đọc hướng dẫn chi tiết dành riêng cho cha mẹ</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

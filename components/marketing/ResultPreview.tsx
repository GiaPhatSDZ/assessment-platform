import { landingCopy } from "@/src/content/vi/site-copy";
import { Check, BarChart3 } from "lucide-react";

export function ResultPreview() {
  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Minh bạch & Chuẩn hóa</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              {landingCopy.valueProps.title}
            </h2>
            <div className="mt-8 space-y-5">
              {landingCopy.valueProps.items.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-850/70 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mẫu kết quả minh họa</span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                Toán học xác định 100%
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span>Tư duy phân tích</span>
                  <span className="text-emerald-600 font-bold">85% • Xuất sắc</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span>Giải quyết vấn đề</span>
                  <span className="text-blue-600 font-bold">75% • Vững vàng</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span>Hiểu biết & ứng dụng AI</span>
                  <span className="text-indigo-600 font-bold">70% • Vững vàng</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "70%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span>Khả năng thích nghi</span>
                  <span className="text-amber-600 font-bold">90% • Xuất sắc</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: "90%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

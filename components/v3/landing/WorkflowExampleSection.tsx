import React from "react";
import { CheckCircle2, ShieldAlert, BookOpen, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

export function WorkflowExampleSection() {
  const steps = [
    {
      num: "01",
      title: "Chẩn đoán nhanh (Diagnostic)",
      desc: "Làm 4 câu hỏi nhận thức đo lường chính xác các nút kỹ năng trong cây tri thức.",
      icon: BookOpen,
    },
    {
      num: "02",
      title: "Định vị lỗ hổng gốc rễ (Gap Tracing)",
      desc: "Động cơ tất định duyệt ngược cây tiên quyết, chỉ ra chính xác nút kiến thức nền tảng bị hổng.",
      icon: ShieldAlert,
    },
    {
      num: "03",
      title: "Học bù trọng tâm (Learning Pack)",
      desc: "Nhận ví dụ mẫu chuẩn SGK và sử dụng Prompt Socratic cùng Google NotebookLM để học lại đúng chỗ.",
      icon: RotateCcw,
    },
    {
      num: "04",
      title: "Kiểm tra lại & Khắc phục (Re-test)",
      desc: "Làm bài kiểm tra lại song song để hệ thống thăng hạng và ghi nhận chứng nhận năng lực vững vàng.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-20 border-b border-warm-200/80 bg-warm-50/50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-edu-700 dark:text-edu-400 mb-2">
            4. Quy trình 4 bước khép kín (How It Works)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vòng Lặp Phục Hồi Năng Lực Chuẩn Sư Phạm
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Không tạo ra một ma trận kiểm tra vô tận. Hệ thống chỉ tập trung vào một vòng lặp tinh gọn giúp học sinh vượt qua rào cản nhận thức nhanh nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-warm-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="font-mono text-sm text-edu-700 dark:text-edu-400">{step.num}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-edu-50 text-edu-700 dark:bg-edu-950 dark:text-edu-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/learn/new"
            className="inline-flex items-center gap-2 rounded-xl bg-edu-700 px-7 py-3 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition active:scale-[0.98]"
          >
            <span>Trải nghiệm ngay quy trình 4 bước này</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { siteConfig } from "@/src/config/site";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-serif text-lg tracking-tight">{siteConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/diagnostic/math-grade6"
            className="flex items-center gap-1.5 text-indigo-600 font-semibold hover:text-indigo-700 dark:text-indigo-400"
          >
            <span>Chẩn đoán Toán 6</span>
            <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              V3 Lát Cắt
            </span>
          </Link>
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            Hồ sơ học tập
          </Link>
          <Link
            href="/diagnostic/math-grade6"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Bắt đầu chẩn đoán
          </Link>
        </nav>
      </div>
    </header>
  );
}

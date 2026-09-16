import Link from "next/link";
import { siteConfig } from "@/src/config/site";
import { ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg tracking-tight">{siteConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href={`/assessment/${siteConfig.defaultAssessmentSlug}`} className="hover:text-blue-600 transition-colors">
            Bài đánh giá
          </Link>
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
            Bảng điều khiển
          </Link>
          <Link
            href={`/assessment/${siteConfig.defaultAssessmentSlug}`}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            Bắt đầu
          </Link>
        </nav>
      </div>
    </header>
  );
}

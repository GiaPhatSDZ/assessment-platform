"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { landingCopy } from "@/src/content/vi/site-copy";
import { siteConfig } from "@/src/config/site";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function Hero() {
  const searchParams = useSearchParams();
  const refCode = searchParams?.get ? searchParams.get("ref") : null;
  const targetUrl = refCode
    ? `/assessment/${siteConfig.defaultAssessmentSlug}?ref=${encodeURIComponent(refCode)}`
    : `/assessment/${siteConfig.defaultAssessmentSlug}`;

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{landingCopy.hero.badge}</span>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
          {landingCopy.hero.title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl dark:text-slate-300 leading-relaxed">
          {landingCopy.hero.subtitle}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={targetUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <span>{landingCopy.hero.primaryCta}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {landingCopy.hero.secondaryCta}
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{landingCopy.hero.disclaimerHint}</span>
        </div>
      </div>
    </section>
  );
}

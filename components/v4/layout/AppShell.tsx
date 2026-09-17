import React from "react";
import Link from "next/link";
import { ProductHeader } from "./ProductHeader";
import { ProductFooter } from "./ProductFooter";
import { ArrowLeft } from "lucide-react";

export type ViewportMode = "BRAND" | "FOCUS" | "INSIGHT";

interface AppShellProps {
  children: React.ReactNode;
  mode?: ViewportMode;
  focusTitle?: string;
  focusExitHref?: string;
}

export function AppShell({
  children,
  mode = "BRAND",
  focusTitle,
  focusExitHref = "/learn",
}: AppShellProps) {
  if (mode === "FOCUS") {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-brand-soft selection:text-brand-dark">
        {/* Minimal Focus Header */}
        <header className="border-b border-line/60 bg-surface/80 backdrop-blur-xs py-3 px-4 sm:px-8 sticky top-0 z-40">
          <div className="mx-auto max-w-diagnostic flex items-center justify-between">
            <Link
              href={focusExitHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Thoát ra góc học tập</span>
            </Link>

            {focusTitle && (
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                {focusTitle}
              </span>
            )}

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              <span className="text-2xs font-medium text-ink-muted">Chế độ tập trung</span>
            </div>
          </div>
        </header>

        {/* Task Workspace (Max width 820px, clean, zero marketing distraction) */}
        <main className="flex-1 w-full flex flex-col justify-center py-6 sm:py-10">
          <div className="mx-auto w-full max-w-diagnostic px-4 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  if (mode === "INSIGHT") {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-brand-soft selection:text-brand-dark">
        <ProductHeader />
        <main className="flex-1 w-full py-8 sm:py-12">
          <div className="mx-auto max-w-insight px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <ProductFooter />
      </div>
    );
  }

  // Default BRAND Mode
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-brand-soft selection:text-brand-dark overflow-x-hidden">
      <ProductHeader />
      <main className="flex-1">{children}</main>
      <ProductFooter />
    </div>
  );
}

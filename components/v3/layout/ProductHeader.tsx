"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/src/config/site";
import { GraduationCap, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

export function ProductHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (!pathname) return href === "/";
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-warm-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-edu-700 text-white shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
              {siteConfig.name}
            </span>
            <span className="hidden md:inline-block ml-2 text-[11px] font-medium text-edu-700 bg-edu-50 px-2 py-0.5 rounded-full border border-edu-200/60 dark:bg-edu-950/40 dark:text-edu-300 dark:border-edu-900/40">
              Chuẩn GD&ĐT
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {siteConfig.navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors py-1 ${
                  active
                    ? "text-edu-700 font-semibold border-b-2 border-edu-700 dark:text-edu-400 dark:border-edu-400"
                    : "text-slate-600 hover:text-edu-700 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/learn/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-edu-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-edu-800 transition active:scale-[0.98]"
          >
            <span>Bắt đầu kiểm tra</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          aria-label="Mở menu điều hướng"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-warm-200 bg-white px-4 pt-3 pb-5 space-y-3 dark:border-slate-800 dark:bg-slate-900">
          <nav className="flex flex-col space-y-2">
            {siteConfig.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-edu-50 text-edu-700 font-semibold dark:bg-slate-800 dark:text-edu-400"
                    : "text-slate-700 hover:bg-warm-100 dark:text-slate-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-2">
            <Link
              href="/learn/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-edu-700 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              <span>Bắt đầu kiểm tra kiến thức</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

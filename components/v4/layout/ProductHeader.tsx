"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/src/config/site";
import { ArrowRight, Menu, X } from "lucide-react";

export function ProductHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Học tập", href: "/learn" },
    { label: "Chương trình", href: "/curriculum" },
    { label: "Cách hoạt động", href: "/#gap-story" },
    { label: "Phụ huynh", href: "/parent" },
  ];

  const isActive = (href: string) => {
    if (!pathname) return href === "/";
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/92 backdrop-blur-md border-b border-line/60 shadow-2xs py-3.5"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 sm:h-12">
          {/* Brand Logo with Editorial Serif Touch */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-white font-serif font-bold text-lg shadow-2xs group-hover:bg-brand-dark transition-colors">
              A
            </span>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-ink">
                AI School
              </span>
            </div>
          </Link>

          {/* Center Navigation for Desktop */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-brand font-semibold bg-brand-soft/40"
                      : "text-ink-muted hover:text-ink hover:bg-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-ink-muted hover:text-ink px-3 py-2 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/learn/new"
              className="inline-flex items-center gap-2 rounded-app bg-brand px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white shadow-2xs hover:bg-brand-dark transition-all active:scale-[0.98]"
            >
              <span>Bắt đầu</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              href="/learn/new"
              className="inline-flex items-center rounded-app bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-2xs"
            >
              Bắt đầu
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden pt-4 pb-3 border-t border-line/50 mt-3 space-y-1 bg-surface/98 rounded-app p-3 shadow-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-canvas transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-line/40">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ink-muted"
              >
                Đăng nhập học viên
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

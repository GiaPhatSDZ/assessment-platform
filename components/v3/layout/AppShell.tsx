import React from "react";
import { ProductHeader } from "./ProductHeader";
import { ProductFooter } from "./ProductFooter";

interface AppShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function AppShell({
  children,
  showHeader = true,
  showFooter = true,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50/70 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {showHeader && <ProductHeader />}
      <main className="flex-1">{children}</main>
      {showFooter && <ProductFooter />}
    </div>
  );
}

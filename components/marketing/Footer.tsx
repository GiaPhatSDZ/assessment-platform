import Link from "next/link";
import { siteConfig } from "@/src/config/site";
import { landingCopy } from "@/src/content/vi/site-copy";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span>{siteConfig.name}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            {siteConfig.footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-blue-600 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p>{landingCopy.footer.disclaimer}</p>
          <p>{landingCopy.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

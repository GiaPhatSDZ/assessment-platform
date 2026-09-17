import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { siteConfig } from "@/src/config/site";
import "./globals.css";
import "katex/dist/katex.min.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "kiểm soát lỗ hổng kiến thức",
    "chẩn đoán năng lực học tập",
    "toán lớp 6",
    "chuẩn chương trình bộ giáo dục",
    "cây tri thức tiên quyết",
    "học bù có trọng tâm",
    "ai school",
  ],
  authors: [{ name: "AI School Curriculum Research Group" }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="min-h-screen flex flex-col bg-warm-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-edu-100 selection:text-edu-900">
        {children}
      </body>
    </html>
  );
}

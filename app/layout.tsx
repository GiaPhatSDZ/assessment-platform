import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assessment Studio — Đánh Giá Năng Lực Chuẩn Xác",
  description: "Nền tảng tự đánh giá năng lực nghề nghiệp và sẵn sàng AI với thang đo chuẩn xác, bảo mật và khách quan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://assessment-platform.vercel.app"),
  title: {
    default: "Assessment Studio — Đánh Giá Độ Sẵn Sàng Nghề Nghiệp Trong Kỷ Nguyên AI",
    template: "%s | Assessment Studio",
  },
  description:
    "Nền tảng đánh giá năng lực nghề nghiệp kỷ nguyên AI: Thang đo toán học 4 chiều tất định, bảo mật ẩn danh tuyệt đối và kế hoạch phát triển kỹ năng 6 tuần.",
  keywords: [
    "đánh giá năng lực AI",
    "độ sẵn sàng nghề nghiệp",
    "tư duy phân tích",
    "giải quyết vấn đề",
    "kỹ năng thích ứng",
    "assessment platform",
  ],
  authors: [{ name: "Assessment Studio Core Team" }],
  creator: "Assessment Studio",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    title: "Assessment Studio — Đánh Giá Độ Sẵn Sàng Nghề Nghiệp Trong Kỷ Nguyên AI",
    description:
      "Thực hiện bài đánh giá 10 câu hỏi để khám phá điểm số 4 chiều năng lực chuẩn xác và kế hoạch hành động cá nhân hóa.",
    siteName: "Assessment Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assessment Studio — Đánh Giá Độ Sẵn Sàng Nghề Nghiệp Trong Kỷ Nguyên AI",
    description:
      "Nền tảng đánh giá năng lực nghề nghiệp kỷ nguyên AI với thuật toán tính điểm toán học khách quan.",
  },
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

export interface SiteConfig {
  name: string;
  shortName: string;
  description: string;
  url: string;
  defaultAssessmentSlug: string;
  supportEmail: string;
  locale: "vi";
  navItems: { label: string; href: string }[];
  footerLinks: { label: string; href: string }[];
}

export const siteConfig: SiteConfig = {
  name: "Assessment Studio",
  shortName: "Studio",
  description:
    "Nền tảng mở đánh giá năng lực nghề nghiệp và đo lường mức độ sẵn sàng AI với thuật toán chấm điểm khách quan, chuẩn xác và bảo mật.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  defaultAssessmentSlug: "ai-career-readiness",
  supportEmail: "support@assessment-platform.local",
  locale: "vi",
  navItems: [
    { label: "Trang chủ", href: "/" },
    { label: "Bài đánh giá", href: "/assessment/ai-career-readiness" },
    { label: "Bảng điều khiển", href: "/dashboard" },
  ],
  footerLinks: [
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Điều khoản sử dụng", href: "/terms" },
    { label: "Kiến trúc hệ thống", href: "/admin" },
  ],
};

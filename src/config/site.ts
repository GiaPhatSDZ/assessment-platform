export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  defaultDiagnosticSlug: string;
  supportEmail: string;
  locale: "vi";
  navItems: { label: string; href: string }[];
  footerLinks: { label: string; href: string }[];
}

export const siteConfig: SiteConfig = {
  name: "AI School V3",
  shortName: "AI School",
  tagline: "Hệ Thống Kiểm Soát Lỗ Hổng Kiến Thức Chuẩn Bộ GD&ĐT",
  description:
    "Tìm đúng chỗ con đang hổng, học lại đúng phần cần thiết. Hệ thống lần theo cây tri thức tiên quyết, phát hiện lỗ hổng gốc rễ và cung cấp gói học liệu chuẩn Bộ GD&ĐT.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  defaultDiagnosticSlug: "math-grade6",
  supportEmail: "hotro@aischool.edu.vn",
  locale: "vi",
  navItems: [
    { label: "Trang chủ", href: "/" },
    { label: "Góc học tập", href: "/learn" },
    { label: "Bản đồ chương trình", href: "/curriculum" },
    { label: "Dành cho phụ huynh", href: "/parent" },
  ],
  footerLinks: [
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Điều khoản dịch vụ", href: "/terms" },
    { label: "Bản đồ chương trình", href: "/curriculum" },
    { label: "Dành cho phụ huynh", href: "/parent" },
  ],
};

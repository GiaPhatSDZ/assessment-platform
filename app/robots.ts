import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://assessment-platform.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/assessment/ai-career-readiness", "/privacy", "/terms"],
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/report/*",
          "/api/*",
          "/auth/*",
          "/login",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

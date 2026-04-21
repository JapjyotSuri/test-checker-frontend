import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/series/"],
        disallow: [
          "/api/",
          "/admin/",
          "/review/",
          "/attempts/",
          "/checkers/",
          "/dashboard/",
          "/browse/",
          "/my-tests/",
          "/sign-in",
          "/sign-up",
          "/auth/",
          "/checkout/",
          "/forgot-password",
        ],
      },
      // Special rules for major search engines
      {
        userAgent: ["Googlebot", "Bingbot", "Slurp"],
        allow: ["/", "/series/"],
        disallow: [
          "/api/",
          "/admin/",
          "/review/",
          "/attempts/",
          "/checkers/",
          "/dashboard/",
          "/browse/",
          "/my-tests/",
          "/sign-in",
          "/sign-up",
          "/auth/",
          "/checkout/",
          "/forgot-password",
        ],
      },
    ],
    sitemap: "https://vps.caprepseries.in/sitemap.xml",
  };
}

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
        ],
      },
    ],
    sitemap: "https://vps.caprepseries.in/sitemap.xml",
  };
}

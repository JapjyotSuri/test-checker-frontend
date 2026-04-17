import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/review/", "/attempts/", "/checkers/"],
      },
    ],
    sitemap: "https://vps.caprepseries.in/sitemap.xml",
  };
}

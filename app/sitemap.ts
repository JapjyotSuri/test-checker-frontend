import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://vps.caprepseries.in";
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // Fetch published test series for dynamic sitemap entries
  let testSeries: any[] = [];
  try {
    const res = await fetch(`${API}/test-series?status=PUBLISHED&limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      testSeries = data.testSeries || [];
    }
  } catch (error) {
    console.error("Failed to fetch test series for sitemap", error);
  }

  // Static pages (only public ones)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic test series pages
  const seriesPages: MetadataRoute.Sitemap = testSeries.map((series) => ({
    url: `${baseUrl}/series/${series.id}`,
    lastModified: series.updatedAt
      ? new Date(series.updatedAt)
      : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...seriesPages];
}

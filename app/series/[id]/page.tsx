import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Users } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  try {
    const res = await fetch(`${API}/test-series/${id}`, {
      cache: 'no-store',
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    if (!res.ok) return { title: "Test Series" };

    const data = await res.json();
    const series = data.testSeries;

    return {
      title: `${series.title} - CA Prep Series`,
      description:
        series.description ||
        `Prepare for CA ${series.category} with comprehensive test series on ${series.subject || "various subjects"}`,
      keywords: [
        `CA ${series.category}`,
        series.subject,
        "test series",
        "practice tests",
        "exam preparation",
      ].filter(Boolean),
      openGraph: {
        title: series.title,
        description: series.description,
        type: "website",
        images: series.image_url
          ? [
              {
                url: `https://vps.caprepseries.in${series.image_url}`,
                width: 1200,
                height: 630,
              },
            ]
          : [],
      },
    };
  } catch (error) {
    return { title: "Test Series" };
  }
}

export default async function SeriesDetailPage({ params }: Props) {
  const { id } = await params;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  let series: any = null;

  try {
    const res = await fetch(`${API}/test-series/${id}`, {
      cache: 'no-store',
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    if (res.ok) {
      const data = await res.json();
      series = data.testSeries;
    }
  } catch (error) {
    console.error("Failed to fetch series:", error);
  }

  if (!series) {
    notFound();
  }

  const category = series.category || "FOUNDATION";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* JSON-LD Schema for Series */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: series.title,
            description: series.description,
            provider: {
              "@type": "Organization",
              name: "Ca Prep Series",
              url: "https://vps.caprepseries.in",
            },
            courseCode: series.id,
            subject: series.subject,
            offers: {
              "@type": "Offer",
              price: series.price || "0",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
            image: series.image_url
              ? `https://vps.caprepseries.in${series.image_url}`
              : undefined,
          }),
        }}
      />

      <div className="relative min-h-screen">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Series Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Image */}
            <div className="md:col-span-1">
              {series.image_url && (
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${series.image_url}`}
                  alt={series.title}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              )}
            </div>

            {/* Details */}
            <div className="md:col-span-2">
              <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium mb-4">
                {category}
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">{series.title}</h1>

              {series.subject && (
                <p className="text-lg text-slate-300 mb-6">{series.subject}</p>
              )}

              {series.description && (
                <p className="text-slate-200 mb-8 leading-relaxed">
                  {series.description}
                </p>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {series.price && (
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400">Price</div>
                    <div className="text-2xl font-bold text-white">
                      ₹{series.price}
                    </div>
                  </div>
                )}
                {series.total_tests && (
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Tests
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {series.total_tests}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href="/sign-up"
                className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start Preparing Now
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-slate-800/50 rounded-lg p-8 backdrop-blur-sm border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">About This Series</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Comprehensive Coverage
                  </h3>
                </div>
                <p className="text-slate-300">
                  Complete test coverage for {category} level CA exams
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Realistic Exams
                  </h3>
                </div>
                <p className="text-slate-300">
                  Tests designed to match the actual CA exam pattern and difficulty
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Instant Results
                  </h3>
                </div>
                <p className="text-slate-300">
                  Get detailed performance analysis and feedback immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

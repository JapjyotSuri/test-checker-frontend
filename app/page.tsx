import Link from "next/link";
import { FileText, CheckCircle, Users, ArrowRight } from "lucide-react";

export default async function Home() {
  // DO NOT call auth() here - it causes redirect errors for bots
  // Users will be redirected via middleware if authenticated
  // Homepage should be publicly accessible

  // Fetch published test series to show on the homepage grouped by category
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  type SeriesItem = { id: string; title: string; subject?: string | null; price?: number | string; image_url?: string | null; category?: string | null };
  const grouped: Record<string, SeriesItem[]> = { FOUNDATION: [], INTER: [], FINAL: [] };
  try {
    const res = await fetch(`${API}/test-series?status=PUBLISHED&limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const list: SeriesItem[] = data.testSeries || [];
      for (const s of list) {
        const cat = (s.category || 'FOUNDATION').toUpperCase();
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(s);
      }
    }
  } catch (e) {
    console.warn('Failed to load series for homepage', e);
  }

  return (
    <>
      {/* JSON-LD Structured Data for Google Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "Ca Prep Series",
            alternateName: "caprepseries",
            url: "https://vps.caprepseries.in",
            description:
              "India's trusted online test series platform for CA Foundation, Intermediate & Final exam preparation.",
            sameAs: [],
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              offerCount: Object.values(grouped).flat().length,
            },
          }),
        }}
      />
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Ca Prep Series</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="px-5 py-2.5 text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Streamline Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {" "}
              Test Checking{" "}
            </span>
            Process
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            A comprehensive platform for managing tests, submissions, and
            evaluations. Perfect for educators, institutions, and organizations.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-lg transition-colors flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              For Students
            </h3>
            <p className="text-slate-400">
              Download test papers, submit your answers as PDFs, and track your
              results all in one place.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              For Checkers
            </h3>
            <p className="text-slate-400">
              Review submissions efficiently, provide feedback, and grade papers
              with our intuitive interface.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              For Admins
            </h3>
            <p className="text-slate-400">
              Manage tests, assign checkers, track performance, and generate
              comprehensive reports.
            </p>
          </div>
        </div>

        {/* Test Series Section */}
        <div className="mt-24 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Our Test Series</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Choose from our curated test series designed for CA Foundation, Intermediate, and Final levels.</p>
          </div>

          {['FOUNDATION', 'INTER', 'FINAL'].map((cat) => {
            const label = cat === 'FOUNDATION' ? 'Foundation' : cat === 'INTER' ? 'Intermediate' : 'Final';
            const gradients: Record<string, string> = {
              FOUNDATION: 'from-blue-600 to-cyan-500',
              INTER: 'from-purple-600 to-pink-500',
              FINAL: 'from-amber-500 to-orange-600',
            };
            const bgAccents: Record<string, string> = {
              FOUNDATION: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
              INTER: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
              FINAL: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
            };

            if (!grouped[cat] || grouped[cat].length === 0) return null;

            return (
              <div key={cat} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${bgAccents[cat]}`}>
                    {label}
                  </span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {grouped[cat].map((s) => (
                    <Link
                      key={s.id}
                      href={`/series/${s.id}`}
                      className="group relative bg-slate-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
                    >
                      {/* Image */}
                      <div className="relative h-48 w-full overflow-hidden">
                        {s.image_url ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${s.image_url}`}
                            alt={s.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${gradients[cat]} flex items-center justify-center`}>
                            <FileText className="w-16 h-16 text-white/40" />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                        {/* Price badge */}
                        <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white font-bold text-sm border border-white/20">
                          ₹{s.price}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                          {s.title}
                        </h4>
                        <p className="text-slate-400 text-sm">{s.subject || 'General'}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${bgAccents[cat]}`}>
                            {label}
                          </span>
                          <span className="text-sm text-purple-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            View Details <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
    </>
  );
}

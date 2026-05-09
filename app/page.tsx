import Link from "next/link";
import { BookOpen, Zap, Target, TrendingUp, Award, Users, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default async function Home() {
  // Fetch published test series to show on the homepage grouped by category
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  type SeriesItem = { id: string; title: string; subject?: string | null; price?: number | string; image_url?: string | null; category?: string | null };
  const grouped: Record<string, SeriesItem[]> = { FOUNDATION: [], INTER: [], FINAL: [] };
  try {
    const res = await fetch(`${API}/test-series?status=PUBLISHED&limit=100`, { 
      cache: 'no-store',
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
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
            name: "CA Prep Series",
            alternateName: "caprepseries",
            url: "https://vps.caprepseries.in",
            description:
              "Crack CA with Us - India's most trusted online test series platform for CA Foundation, Intermediate & Final exam preparation.",
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

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white block">CA Prep Series</span>
              <span className="text-xs text-blue-300 font-semibold">Crack CA with Us</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/sign-in"
              className="px-4 sm:px-5 py-2.5 text-slate-300 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-12 sm:pt-20 pb-20 sm:pb-32">
          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-24">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full">
              <span className="text-blue-300 text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                India's #1 CA Test Series Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Crack CA
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                {" "}with Us
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Master your CA exams with our comprehensive test series. Practice with real exam patterns,  and track your progress. Join thousands of successful CA students.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/browse"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl font-semibold border border-slate-700 transition-all"
              >
                Browse Test Series
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">1K+</div>
                <div className="text-xs sm:text-sm text-slate-400">Trusted by students</div>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                <div className="text-2xl sm:text-3xl font-bold text-purple-400">1st</div>
                <div className="text-xs sm:text-sm text-slate-400">Rankers choice</div>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                <div className="text-2xl sm:text-3xl font-bold text-pink-400">5Yrs+</div>
                <div className="text-xs sm:text-sm text-slate-400">Experience</div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 my-20 sm:my-32">
            <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-8 transition-all hover:shadow-xl hover:shadow-blue-500/10">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Comprehensive Coverage
              </h3>
              <p className="text-slate-400">
                Complete test series for CA Foundation, Intermediate, and Final levels with all subjects covered.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 rounded-2xl p-8 transition-all hover:shadow-xl hover:shadow-purple-500/10">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Real Exam Pattern
              </h3>
              <p className="text-slate-400">
                Practice with tests designed exactly like the actual CA exams to build confidence and accuracy.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-pink-500/50 rounded-2xl p-8 transition-all hover:shadow-xl hover:shadow-pink-500/10">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Mentorship with All India Rankers
              </h3>
              <p className="text-slate-400">
                Get personalized guidance from top CA rankers through mentorship sessions and learn proven strategies to excel in your exams.
              </p>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl p-8 sm:p-12 mb-20 sm:mb-32">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center">Why Choose CA Prep Series?</h2>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Expert-Curated Content</h4>
                  <p className="text-slate-400">Created by CA professionals with years of experience</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Affordable Pricing</h4>
                  <p className="text-slate-400">Quality education at prices that fit your budget</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">24/7 Access</h4>
                  <p className="text-slate-400">Study anytime, anywhere at your own pace</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Community Support</h4>
                  <p className="text-slate-400">Connect with thousands of CA aspirants</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Series Section */}
          <div className="mt-20 sm:mt-32">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Our Test Series</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">Choose from our expertly designed test series for each CA level</p>
            </div>

            {['FOUNDATION', 'INTER', 'FINAL'].map((cat) => {
              const label = cat === 'FOUNDATION' ? 'CA Foundation' : cat === 'INTER' ? 'CA Intermediate' : 'CA Final';
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
              const icons: Record<string, React.ReactNode> = {
                FOUNDATION: <BookOpen className="w-5 h-5" />,
                INTER: <Award className="w-5 h-5" />,
                FINAL: <Sparkles className="w-5 h-5" />,
              };

              if (!grouped[cat] || grouped[cat].length === 0) return null;

              return (
                <div key={cat} className="mb-16 sm:mb-24">
                  <div className="flex items-center gap-3 mb-8 sm:mb-12">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 ${bgAccents[cat]}`}>
                      {icons[cat]}
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {grouped[cat].map((s) => (
                      <Link
                        key={s.id}
                        href={`/series/${s.id}`}
                        className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
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
                              <BookOpen className="w-16 h-16 text-white/40" />
                            </div>
                          )}
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                          {/* Price badge */}
                          <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-bold text-sm shadow-lg">
                            ₹{s.price}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                            {s.title}
                          </h4>
                          <p className="text-slate-400 text-sm mb-4">{s.subject || 'Comprehensive Coverage'}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${bgAccents[cat]}`}>
                              {label}
                            </span>
                            <span className="text-sm text-blue-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              Explore <ArrowRight className="w-4 h-4" />
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

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center mt-20 sm:mt-32">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Crack CA?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of successful CA students who have achieved their dreams with CA Prep Series
            </p>
            <Link
              href="/sign-up"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Free Trial Today
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-slate-800 mt-20 sm:mt-32 py-12">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-white font-bold mb-4">CA Prep Series</h4>
                <p className="text-slate-400 text-sm">Crack CA with Us - Your trusted partner in CA exam preparation</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/browse" className="hover:text-white transition">Browse Tests</Link></li>
                  <li><Link href="/sign-up" className="hover:text-white transition">Get Started</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="mailto:support@caprepseries.in" className="hover:text-white transition">Contact Us(89683-71163)</a></li>
                  <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
              <p>&copy; 2024 CA Prep Series. All rights reserved. | Crack CA with Us</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { testSeriesApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { BookOpen, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface TestSeries {
  id: string;
  title: string;
  description: string | null;
  price: string;
  number_of_tests: number;
  actual_test_count?: number;
  subject: string | null;
}

export default function BrowsePage() {
  const { getToken } = useClerkAuth();
  const [series, setSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await testSeriesApi.getAll();
        setSeries(res.data.testSeries || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1e3a8a] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Browse Test Series</h1>
        <p className="text-slate-600 mt-1">Purchase test series to take tests</p>
      </div>

      {series.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No test series available</h3>
          <p className="text-slate-500 mt-2">Check back later.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-[#1e3a8a]/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#1e3a8a]" />
                  </div>
                  {s.subject && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {s.subject}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {s.description || "No description"}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <span>{s.number_of_tests ?? 0} tests</span>
                  <span className="font-semibold text-[#1e3a8a]">₹{s.price}</span>
                </div>
                <Link
                  href={`/checkout/${s.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#f59e0b] hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

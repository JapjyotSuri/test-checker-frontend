"use client";

import { useEffect, useState } from "react";
import { purchasesApi } from "@/lib/api";
import { FolderOpen, Play } from "lucide-react";
import Link from "next/link";

interface MySeries {
  id: string;
  title: string;
  description: string | null;
  number_of_tests: number;
  actual_test_count: number;
  subject: string | null;
  completed_count: string;
}

export default function MyTestsPage() {
  const [series, setSeries] = useState<MySeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await purchasesApi.getMySeries();
        setSeries(res.data.series || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <h1 className="text-2xl font-bold text-slate-800">My Test Series</h1>
        <p className="text-slate-600 mt-1">Your purchased test series and progress</p>
      </div>

      {series.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No test series yet</h3>
          <p className="text-slate-500 mt-2 mb-4">Purchase a test series to start taking tests.</p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] transition-colors"
          >
            Browse Test Series
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {series.map((s) => {
            const total = Number(s.actual_test_count) || Number(s.number_of_tests) || 1;
            const completed = Number(s.completed_count) || 0;
            const progress = total ? Math.round((completed / total) * 100) : 0;
            return (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#1e3a8a]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-6 h-6 text-[#1e3a8a]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{s.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Progress: {completed} / {total} tests completed
                    </p>
                    <div className="mt-2 w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f59e0b] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Link
                  href={`/my-tests/${s.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] transition-colors self-start sm:self-center"
                >
                  <Play className="w-4 h-4" />
                  Take test
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

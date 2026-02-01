"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { testSeriesApi, attemptsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { FileText, Play, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Test {
  id: string;
  title: string;
  description: string | null;
  total_marks: number;
  duration: number | null;
  status: string;
}

export default function MyTestsSeriesPage() {
  const params = useParams();
  const id = params.id as string;
  const { getToken } = useClerkAuth();
  const [series, setSeries] = useState<{ title: string; tests: Test[] } | null>(null);
  const [attemptByTestId, setAttemptByTestId] = useState<Record<string, { id: string; status: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const [seriesRes, attemptsRes] = await Promise.all([
          testSeriesApi.getById(id),
          attemptsApi.getAll(),
        ]);
        setSeries(seriesRes.data.testSeries);
        const byTest: Record<string, { id: string; status: string }> = {};
        (attemptsRes.data.attempts || []).forEach((a: { test: { id: string }; id: string; status: string }) => {
          byTest[a.test.id] = { id: a.id, status: a.status };
        });
        setAttemptByTestId(byTest);
      } catch (e) {
        console.error(e);
        setSeries(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1e3a8a] border-t-transparent" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-600">Series not found.</p>
        <Link href="/my-tests" className="mt-4 inline-block text-[#1e3a8a] font-medium">
          Back to My Tests
        </Link>
      </div>
    );
  }

  const tests = series.tests || [];

  return (
    <div>
      <Link href="/my-tests" className="text-slate-600 hover:text-slate-800 text-sm mb-4 inline-block">
        ← Back to My Tests
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{series.title}</h1>
      <p className="text-slate-600 mb-8">Select a test to take</p>

      {tests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-600">No tests in this series yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => {
            const attempt = attemptByTestId[test.id];
            const attempted = !!attempt;
            const resultPending = attempted && (attempt.status === "PENDING" || attempt.status === "IN_REVIEW");
            return (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    {attempted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{test.title}</h3>
                    <p className="text-sm text-slate-500">
                      {test.total_marks} marks {test.duration ? `• ${test.duration} mins` : ""}
                    </p>
                    {resultPending && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        Result yet to be added
                      </span>
                    )}
                  </div>
                </div>
                {resultPending ? (
                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm cursor-not-allowed">
                    Take test (submitted)
                  </span>
                ) : attempted ? (
                  <Link
                    href="/attempts"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] transition-colors text-sm"
                  >
                    View result
                  </Link>
                ) : (
                  <Link
                    href={`/tests/${test.id}/attempt`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] transition-colors text-sm"
                  >
                    <Play className="w-4 h-4" />
                    Take test
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

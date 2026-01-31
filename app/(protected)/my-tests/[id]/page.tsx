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
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());
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
        const ids = new Set(
          (attemptsRes.data.attempts || []).map((a: { test: { id: string } }) => a.test.id)
        );
        setAttemptedIds(ids);
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
            const attempted = attemptedIds.has(test.id);
            return (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between"
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
                  </div>
                </div>
                <Link
                  href={`/tests/${test.id}/attempt`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] transition-colors text-sm"
                >
                  <Play className="w-4 h-4" />
                  {attempted ? "View / Retry" : "Take test"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

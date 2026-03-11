"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { testSeriesApi, attemptsApi, testsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { FileText, Play, CheckCircle, Eye, Download } from "lucide-react";
import Link from "next/link";

interface Test {
  id: string;
  title: string;
  description: string | null;
  total_marks: number;
  duration: number | null;
  status: string;
  pdf_url?: string;
  pdf_file_name?: string;
}

export default function MyTestsSeriesPage() {
  const params = useParams();
  const id = params.id as string;
  const { getToken } = useClerkAuth();
  const [series, setSeries] = useState<{ title: string; tests: Test[] } | null>(null);
  const [attemptByTestId, setAttemptByTestId] = useState<Record<string, { id: string; status: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:4000";

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

  const openQuestion = (t: Test) => {
    if (!t.pdf_url) return;
    const url = `${API_BASE}${t.pdf_url}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openAnswer = async (testId: string) => {
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await testsApi.getAnswer(testId);
      const url = `${API_BASE}${res.data.downloadUrl}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Answer sheet not available");
    }
  };

  const openChecked = async (attemptId: string) => {
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await attemptsApi.getChecked(attemptId);
      const url = `${API_BASE}${res.data.downloadUrl}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Checked sheet not available");
    }
  };

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
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

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
                <div className="flex items-center gap-2">
                  {attempted && test.pdf_url ? (
                    <button
                      type="button"
                      onClick={() => openQuestion(test)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
                      title="Open question paper"
                    >
                      <Download className="w-4 h-4" />
                      Question
                    </button>
                  ) : null}
                  {attempted && <button
                    type="button"
                    onClick={() => openAnswer(test.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
                    title="Open answer sheet"
                  >
                    <Eye className="w-4 h-4" />
                    Answer
                  </button>}
                  {resultPending ? (
                    <span className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm cursor-not-allowed">
                      Submitted
                    </span>
                  ) : attempted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openChecked(attempt.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Checked
                      </button>
                      <Link
                        href="/attempts"
                        className="flex items-center gap-2 px-3 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] transition-colors text-sm"
                      >
                        View result
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/tests/${test.id}/attempt`}
                      className="flex items-center gap-2 px-3 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] transition-colors text-sm"
                    >
                      <Play className="w-4 h-4" />
                      Take test
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { testsApi, attemptsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { FileText, Download, Plus, Eye } from "lucide-react";
import Link from "next/link";

interface Test {
  id: string;
  title: string;
  description: string | null;
  status: string;
  total_marks: number;
  duration: number | null;
  created_at: string;
  attempt_count: number;
  created_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export default function TestsPage() {
  const { user, isAdmin } = useAuth();
  const { getToken } = useClerkAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [attemptByTestId, setAttemptByTestId] = useState<Record<string, { status: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const [testsRes, attemptsRes] = await Promise.all([
          testsApi.getAll(),
          isAdmin ? Promise.resolve({ data: { attempts: [] } }) : attemptsApi.getAll(),
        ]);
        setTests(testsRes.data.tests);
        const byTest: Record<string, { status: string }> = {};
        (attemptsRes.data.attempts || []).forEach((a: { test: { id: string }; status: string }) => {
          byTest[a.test.id] = { status: a.status };
        });
        setAttemptByTestId(byTest);
      } catch (error) {
        console.error("Failed to fetch tests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1e3a8a] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tests</h1>
          <p className="text-slate-400">
            {isAdmin ? "Manage all tests" : "View and attempt available tests"}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/tests/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Test
          </Link>
        )}
      </div>

      {/* Tests Grid */}
      {tests.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No tests available</h3>
          <p className="text-slate-400">
            {isAdmin
              ? "Create your first test to get started"
              : "Check back later for new tests"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => {
            const attempt = attemptByTestId[test.id];
            const attempted = !!attempt;
            const resultPending =
              attempted && (attempt.status === "PENDING" || attempt.status === "IN_REVIEW");
            const attemptDisabled = attempted && resultPending;
            return (
              <div
                key={test.id}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        test.status === "PUBLISHED"
                          ? "bg-green-500/20 text-green-400"
                          : test.status === "DRAFT"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{test.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {test.description || "No description"}
                  </p>

                  {resultPending && (
                    <span className="inline-block mb-2 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                      Result yet to be added
                    </span>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    <span>Total: {test.total_marks} marks</span>
                    {test.duration && <span>{test.duration} mins</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tests/${test.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    {test.status === "PUBLISHED" && !isAdmin && (
                      attemptDisabled ? (
                        <span className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">
                          <Download className="w-4 h-4" />
                          Attempt (submitted)
                        </span>
                      ) : attempted ? (
                        <Link
                          href="/attempts"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          View result
                        </Link>
                      ) : (
                        <Link
                          href={`/tests/${test.id}/attempt`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Attempt
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


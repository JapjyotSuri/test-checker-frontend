"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { BookOpen, FolderOpen, Award, ClipboardCheck, Users, FileText, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, attemptsApi, purchasesApi, checkersApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading, error, isAdmin, isChecker, isUser, displayName } = useAuth();
  const { getToken } = useClerkAuth();
  const [stats, setStats] = useState<{
    total_revenue?: number;
    total_users?: number;
    total_checkers?: number;
    total_tests?: number;
    pending_attempts?: number;
    completed_attempts?: number;
  } | null>(null);
  type AttemptSummary = {
    id: string;
    test_title?: string;
    first_name?: string;
    last_name?: string;
    status?: string;
    test?: { title: string };
    obtained_marks?: number;
    feedback?: string;
  };

  const [recentAttempts, setRecentAttempts] = useState<AttemptSummary[]>([]);
  const [mySeriesCount, setMySeriesCount] = useState(0);
  const [checkerStats, setCheckerStats] = useState<{
    pending_for_review?: number;
    in_progress?: number;
    completed?: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        if (isAdmin) {
          const res = await adminApi.getDashboard();
          setStats(res.data.stats);
          setRecentAttempts(res.data.recentAttempts || []);
        } else if (isChecker) {
          const res = await checkersApi.getMyStats();
          setCheckerStats(res.data.stats);
        } else if (isUser) {
          const res = await purchasesApi.getMySeries();
          setMySeriesCount((res.data.series || []).length);
          const attemptsRes = await attemptsApi.getAll();
          setRecentAttempts((attemptsRes.data.attempts || []).slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (!authLoading) fetchData();
  }, [authLoading, isAdmin, isChecker, isUser, getToken]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1e3a8a] border-t-transparent" />
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    PENDING: "Pending",
    IN_REVIEW: "Checking",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
  };

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-amber-800 font-medium">Backend connection issue</p>
            <p className="text-amber-700 text-sm">{error}. Ensure backend is running on port 4000.</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back, {displayName}!</h1>
        <p className="text-slate-600">
          {isAdmin
            ? "Manage test series, students, checkers, and view sales."
            : isChecker
            ? "Check submitted tests and track your progress."
            : "Browse test series, take tests, and view your results."}
        </p>
      </div>

      {/* Student: quick cards */}
      {isUser && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/browse"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-[#1e3a8a]/30 hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-[#1e3a8a]/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#1e3a8a]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Browse Test Series</h3>
              <p className="text-sm text-slate-500">Available test series to buy</p>
            </div>
          </Link>
          <Link
            href="/my-tests"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-[#1e3a8a]/30 hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">My Test Series</h3>
              <p className="text-sm text-slate-500">{mySeriesCount} purchased</p>
            </div>
          </Link>
          <Link
            href="/attempts"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-[#1e3a8a]/30 hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Results</h3>
              <p className="text-sm text-slate-500">Recent results with scores</p>
            </div>
          </Link>
        </div>
      )}

      {/* Checker: stats */}
      {isChecker && !isAdmin && checkerStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-slate-500 text-sm">Waiting to check</p>
            <p className="text-2xl font-bold text-amber-600">{checkerStats.pending_for_review ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-slate-500 text-sm">In progress</p>
            <p className="text-2xl font-bold text-[#1e3a8a]">{checkerStats.in_progress ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-slate-500 text-sm">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{checkerStats.completed ?? 0}</p>
          </div>
          <Link
            href="/review"
            className="bg-[#1e3a8a] text-white rounded-xl p-4 flex items-center gap-3 hover:bg-[#1e40af] transition-colors"
          >
            <ClipboardCheck className="w-8 h-8 text-[#f59e0b]" />
            <span className="font-semibold">Check Tests</span>
          </Link>
        </div>
      )}

      {/* Admin: count cards + revenue + activity */}
      {isAdmin && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-[#1e3a8a]" />
                <span className="text-slate-500 text-sm">Students</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.total_users ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-slate-600" />
                <span className="text-slate-500 text-sm">Checkers</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.total_checkers ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="text-slate-500 text-sm">Tests</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.total_tests ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardCheck className="w-5 h-5 text-slate-600" />
                <span className="text-slate-500 text-sm">Attempts</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.pending_attempts ?? 0} pending</p>
            </div>
            <div className="bg-[#1e3a8a] text-white rounded-xl p-4 flex items-center gap-3 col-span-2">
              <div className="w-12 h-12 bg-[#f59e0b] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#1e3a8a]" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Revenue</p>
                <p className="text-2xl font-bold">₹{Number(stats.total_revenue || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent activity</h2>
            {Array.isArray(recentAttempts) && recentAttempts.length === 0 ? (
              <p className="text-slate-500">No recent submissions</p>
            ) : (
              <ul className="space-y-3">
                {Array.isArray(recentAttempts) &&
                  recentAttempts.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-slate-700">{a.test_title} — {a.first_name} {a.last_name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        a.status === "COMPLETED" ? "status-completed" :
                        a.status === "PENDING" ? "status-pending" : "status-checking"
                      }`}>
                        {statusLabel[a.status as string] || a.status}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Student: recent results */}
      {isUser && Array.isArray(recentAttempts) && recentAttempts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent results</h2>
            <ul className="space-y-3">
            {recentAttempts.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-slate-700">{a.test?.title}</span>
                <div className="flex items-center gap-2">
                  {a.obtained_marks != null && (
                    <span className="text-slate-600 font-medium">{a.obtained_marks} marks</span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    a.status === "COMPLETED" ? "status-completed" :
                    a.status === "PENDING" ? "status-pending" : a.status === "IN_REVIEW" ? "status-checking" : "status-rejected"
                  }`}>
                    {statusLabel[a.status as string] || a.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/attempts" className="mt-4 inline-block text-[#1e3a8a] font-medium text-sm">
            View all results →
          </Link>
        </div>
      )}
    </div>
  );
}

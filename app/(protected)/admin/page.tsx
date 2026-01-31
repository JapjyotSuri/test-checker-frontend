"use client";

import { useEffect, useState } from "react";
import { adminApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { Users, FileText, ClipboardCheck, Clock, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

interface Stats {
  total_users: number;
  total_checkers: number;
  total_tests: number;
  total_attempts: number;
  pending_attempts: number;
  completed_attempts: number;
  total_revenue?: number;
}

interface RecentAttempt {
  id: string;
  status: string;
  submitted_at: string;
  test_title: string;
  first_name: string;
  last_name: string;
}

interface RecentTest {
  id: string;
  title: string;
  status: string;
  attempt_count: number;
}

export default function AdminPage() {
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      redirect("/dashboard");
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const response = await adminApi.getDashboard();
        setStats(response.data.stats);
        setRecentAttempts(response.data.recentAttempts);
        setRecentTests(response.data.recentTests);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [getToken, isAdmin]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1e3a8a] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Admin Dashboard</h1>
        <p className="text-slate-600">Overview of your test checking platform</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total_users}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-slate-400 text-sm">Checkers</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total_checkers}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-green-400" />
              <span className="text-slate-400 text-sm">Tests</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total_tests}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-400 text-sm">Attempts</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total_attempts}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-400 text-sm">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending_attempts}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-slate-400 text-sm">Completed</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.completed_attempts}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Attempts */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Submissions</h2>
          {recentAttempts.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{attempt.test_title}</p>
                    <p className="text-sm text-slate-400">
                      by {attempt.first_name} {attempt.last_name}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      attempt.status === "COMPLETED"
                        ? "bg-green-500/20 text-green-400"
                        : attempt.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {attempt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tests */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Tests</h2>
          {recentTests.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No tests created yet</p>
          ) : (
            <div className="space-y-3">
              {recentTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{test.title}</p>
                    <p className="text-sm text-slate-400">{test.attempt_count} attempts</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      test.status === "PUBLISHED"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


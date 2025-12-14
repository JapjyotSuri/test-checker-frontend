"use client";

import { useEffect, useState } from "react";
import { attemptsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { ClipboardCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface Attempt {
  id: string;
  status: string;
  obtained_marks: number | null;
  feedback: string | null;
  submitted_at: string;
  checked_at: string | null;
  test: {
    id: string;
    title: string;
    total_marks: number;
  };
}

const statusConfig = {
  PENDING: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  IN_REVIEW: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20" },
  COMPLETED: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" },
  REJECTED: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
};

export default function AttemptsPage() {
  const { getToken } = useClerkAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const response = await attemptsApi.getAll();
        setAttempts(response.data.attempts);
      } catch (error) {
        console.error("Failed to fetch attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Attempts</h1>
        <p className="text-slate-400">Track your test submissions and results</p>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No attempts yet</h3>
          <p className="text-slate-400 mb-4">Start by attempting a test</p>
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Tests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => {
            const config = statusConfig[attempt.status as keyof typeof statusConfig];
            const StatusIcon = config.icon;

            return (
              <Link
                key={attempt.id}
                href={`/attempts/${attempt.id}`}
                className="block bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${config.bg} rounded-lg flex items-center justify-center`}>
                      <StatusIcon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {attempt.test.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Submitted {new Date(attempt.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.bg} ${config.color} rounded-lg text-sm font-medium`}>
                      <StatusIcon className="w-4 h-4" />
                      {attempt.status}
                    </span>
                    {attempt.obtained_marks !== null && (
                      <p className="mt-2 text-lg font-semibold text-white">
                        {attempt.obtained_marks} / {attempt.test.total_marks}
                      </p>
                    )}
                  </div>
                </div>

                {attempt.feedback && (
                  <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-300">{attempt.feedback}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


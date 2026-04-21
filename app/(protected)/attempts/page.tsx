"use client";

import { useEffect, useState } from "react";
import { attemptsApi } from "@/lib/api";
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

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_REVIEW: "Checking",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

const statusConfig = {
  PENDING: { icon: Clock, label: "Pending", css: "status-pending" },
  IN_REVIEW: { icon: Clock, label: "Checking", css: "status-checking" },
  COMPLETED: { icon: CheckCircle, label: "Completed", css: "status-completed" },
  REJECTED: { icon: XCircle, label: "Rejected", css: "status-rejected" },
};

export default function AttemptsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await attemptsApi.getAll();
        setAttempts(response.data.attempts);
      } catch (error) {
        console.error("Failed to fetch attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1e3a8a] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Results</h1>
        <p className="text-slate-600">Track your test submissions and scores</p>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No attempts yet</h3>
          <p className="text-slate-500 mb-4">Start by taking a test from My Tests</p>
          <Link
            href="/my-tests"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg font-medium transition-colors"
          >
            My Tests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => {
            const config = statusConfig[attempt.status as keyof typeof statusConfig] || statusConfig.PENDING;
            const StatusIcon = config.icon;

            return (
              <Link
                key={attempt.id}
                href={`/attempts/${attempt.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-[#1e3a8a]/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <StatusIcon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {attempt.test.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Submitted {new Date(attempt.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${config.css}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusLabel[attempt.status] || attempt.status}
                    </span>
                    {attempt.obtained_marks !== null && (
                      <p className="mt-2 text-lg font-semibold text-slate-800">
                        {attempt.obtained_marks} / {attempt.test.total_marks}
                      </p>
                    )}
                  </div>
                </div>

                {attempt.feedback && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-600">{attempt.feedback}</p>
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


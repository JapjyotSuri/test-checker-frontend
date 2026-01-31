"use client";

import { useEffect, useState } from "react";
import { attemptsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { ClipboardCheck, CheckCircle, User } from "lucide-react";
import Link from "next/link";

interface Attempt {
  id: string;
  status: string;
  obtained_marks: number | null;
  submitted_at: string;
  checked_at: string | null;
  test: { id: string; title: string; total_marks: number };
  user: { first_name: string; last_name: string };
}

const statusLabel: Record<string, string> = {
  IN_REVIEW: "Checking",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export default function ReviewHistoryPage() {
  const { getToken } = useClerkAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await attemptsApi.getAll();
        const list = res.data.attempts || [];
        setAttempts(list.filter((a: Attempt) => a.status !== "PENDING"));
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
        <h1 className="text-2xl font-bold text-slate-800">History</h1>
        <p className="text-slate-600 mt-1">Tests you have already checked</p>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No checked tests yet</h3>
          <p className="text-slate-500 mt-2">Check tests from the Check Tests page.</p>
          <Link href="/review" className="mt-4 inline-block text-[#1e3a8a] font-medium">
            Go to Check Tests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <Link
              key={attempt.id}
              href={`/review/${attempt.id}`}
              className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-[#1e3a8a]/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{attempt.test.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {attempt.user.first_name} {attempt.user.last_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                      attempt.status === "COMPLETED"
                        ? "status-completed"
                        : attempt.status === "REJECTED"
                        ? "status-rejected"
                        : "status-checking"
                    }`}
                  >
                    {statusLabel[attempt.status] || attempt.status}
                  </span>
                  {attempt.obtained_marks != null && (
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {attempt.obtained_marks} / {attempt.test.total_marks}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

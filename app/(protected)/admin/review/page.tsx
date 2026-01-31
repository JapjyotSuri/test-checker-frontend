"use client";

import { useEffect, useState } from "react";
import { attemptsApi, adminApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { FileCheck, User, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Attempt {
  id: string;
  status: string;
  obtained_marks: number | null;
  feedback: string | null;
  submitted_at: string;
  test: { id: string; title: string; total_marks: number };
  user: { first_name: string; last_name: string; email: string };
  checker: { first_name: string; last_name: string } | null;
}

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_REVIEW: "Checking",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export default function AdminReviewPage() {
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/dashboard");
  }, [authLoading, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await attemptsApi.getAll();
        setAttempts(res.data.attempts || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) fetchData();
  }, [getToken, isAdmin]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1e3a8a] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Review</h1>
        <p className="text-slate-600 mt-1">See any checked test; override marks if needed</p>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No attempts yet</h3>
          <p className="text-slate-500 mt-2">Attempts will appear when students submit tests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{attempt.test.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {attempt.user.first_name} {attempt.user.last_name}
                    {attempt.checker && (
                      <> • Checked by {attempt.checker.first_name} {attempt.checker.last_name}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    attempt.status === "COMPLETED"
                      ? "status-completed"
                      : attempt.status === "PENDING"
                      ? "status-pending"
                      : attempt.status === "IN_REVIEW"
                      ? "status-checking"
                      : "status-rejected"
                  }`}
                >
                  {statusLabel[attempt.status] || attempt.status}
                </span>
                {attempt.obtained_marks != null && (
                  <span className="text-sm font-medium text-slate-700">
                    {attempt.obtained_marks}/{attempt.test.total_marks}
                  </span>
                )}
                <Link
                  href={`/admin/review/${attempt.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1e40af]"
                >
                  <Eye className="w-4 h-4" />
                  View / Override
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

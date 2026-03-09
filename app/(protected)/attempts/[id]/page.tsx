"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { attemptsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { Award, MessageSquare, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_REVIEW: "Checking",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

const statusClass: Record<string, string> = {
  PENDING: "status-pending",
  IN_REVIEW: "status-checking",
  COMPLETED: "status-completed",
  REJECTED: "status-rejected",
};

export default function AttemptResultPage() {
  const params = useParams();
  const id = params.id as string;
  const { getToken } = useClerkAuth();
  const [attempt, setAttempt] = useState<{
    status: string;
    obtained_marks: number | null;
    feedback: string | null;
    submitted_at: string;
    checked_at: string | null;
    checked_pdf_url?: string | null;
    checked_pdf_name?: string | null;
    test: { id: string; title: string; total_marks: number };
    checker: { first_name: string; last_name: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:4000";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await attemptsApi.getById(id);
        setAttempt(res.data.attempt);
      } catch (e) {
        setAttempt(null);
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

  if (!attempt) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-600">Result not found.</p>
        <Link href="/attempts" className="mt-4 inline-block text-[#1e3a8a] font-medium">
          Back to Results
        </Link>
      </div>
    );
  }

  const status = statusLabel[attempt.status] || attempt.status;
  const statusCss = statusClass[attempt.status] || "bg-slate-100 text-slate-800";

  return (
    <div>
      <Link
        href="/attempts"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Results
      </Link>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">{attempt.test.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusCss}`}>
            {status}
          </span>
        </div>

        {attempt.obtained_marks != null && (
          <div className="flex items-center gap-4 p-4 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded-xl mb-6">
            <div className="w-12 h-12 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Score</p>
              <p className="text-2xl font-bold text-slate-800">
                {attempt.obtained_marks} / {attempt.test.total_marks}
              </p>
            </div>
          </div>
        )}

        {attempt.feedback && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Checker feedback
            </h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
              {attempt.feedback}
            </div>
            {attempt.checker && (
              <p className="text-xs text-slate-500 mt-2">
                — {attempt.checker.first_name} {attempt.checker.last_name}
              </p>
            )}
          </div>
        )}

        {attempt.status === "COMPLETED" && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Checked sheet</h2>
            {attempt.checked_pdf_url ? (
              <a
                href={`${API_BASE}${attempt.checked_pdf_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                View checked sheet
              </a>
            ) : (
              <p className="text-sm text-slate-500">Available after checker uploads the checked sheet.</p>
            )}
          </div>
        )}

        <p className="text-sm text-slate-500">
          Submitted: {new Date(attempt.submitted_at).toLocaleString()}
          {attempt.checked_at && (
            <> • Checked: {new Date(attempt.checked_at).toLocaleString()}</>
          )}
        </p>
      </div>
    </div>
  );
}

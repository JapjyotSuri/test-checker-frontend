"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { attemptsApi, adminApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { FileText, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000";

export default function AdminReviewOverridePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [attempt, setAttempt] = useState<{
    id: string;
    status: string;
    obtained_marks: number | null;
    feedback: string | null;
    submitted_pdf_url: string;
    test: { id: string; title: string; total_marks: number };
    user: { first_name: string; last_name: string; email: string };
    checker: { first_name: string; last_name: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/dashboard");
  }, [authLoading, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await attemptsApi.getById(id);
        const a = res.data.attempt;
        setAttempt(a);
        if (a.obtained_marks != null) setMarks(String(a.obtained_marks));
        if (a.feedback) setFeedback(a.feedback);
      } catch (e) {
        setAttempt(null);
      } finally {
        setLoading(false);
      }
    };
    if (id && isAdmin) fetchData();
  }, [id, getToken, isAdmin]);

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = marks === "" ? undefined : parseInt(marks, 10);
    if (m !== undefined && (isNaN(m) || (attempt && (m < 0 || m > attempt.test.total_marks)))) {
      setError(`Marks must be 0–${attempt?.test.total_marks}`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      await adminApi.overrideAttempt(id, {
        obtainedMarks: m,
        feedback: feedback || undefined,
      });
      router.push("/admin/review");
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1e3a8a] border-t-transparent" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-600">Attempt not found.</p>
        <Link href="/admin/review" className="mt-4 inline-block text-[#1e3a8a] font-medium">
          Back to Review
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/review"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Review
      </Link>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">{attempt.test.title}</h1>
          <p className="text-slate-600 text-sm mt-1">
            by {attempt.user.first_name} {attempt.user.last_name} ({attempt.user.email})
            {attempt.checker && (
              <> • Checked by {attempt.checker.first_name} {attempt.checker.last_name}</>
            )}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2">Student&apos;s answer</p>
          <a
            href={`${API_BASE}${attempt.submitted_pdf_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            View PDF
          </a>
        </div>

        <form onSubmit={handleOverride} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Override marks (0–{attempt.test.total_marks})
            </label>
            <input
              type="number"
              min={0}
              max={attempt.test.total_marks}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Override feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save override"}
          </button>
        </form>
      </div>
    </div>
  );
}

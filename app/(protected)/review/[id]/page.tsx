"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { attemptsApi } from "@/lib/api";
import { FileText, MessageSquare, Check, XCircle } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000";

export default function ReviewGradingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [attempt, setAttempt] = useState<{
    id: string;
    status: string;
    obtained_marks: number | null;
    feedback: string | null;
    submitted_pdf_url: string;
    test: { id: string; title: string; total_marks: number };
    user: { first_name: string; last_name: string; email: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkedFile, setCheckedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    if (id) fetchData();
  }, [id]);

  const handleClaim = async () => {
    try {
      await attemptsApi.claim(id);
      const res = await attemptsApi.getById(id);
      setAttempt(res.data.attempt);
    } catch (e) {
      setError("Failed to claim");
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseInt(marks, 10);
    if (isNaN(m) || m < 0 || (attempt && m > attempt.test.total_marks)) {
      setError(`Marks must be 0–${attempt?.test.total_marks}`);
      return;
    }
    if (checkedFile && checkedFile.size > 5 * 1024 * 1024) {
      setError("Checked PDF must be ≤ 5 MB");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let payload: FormData | { obtainedMarks: number; feedback?: string };
      if (checkedFile) {
        const form = new FormData();
        form.append("obtainedMarks", String(m));
        if (feedback) form.append("feedback", feedback);
        form.append("checkedPdf", checkedFile);
        payload = form;
      } else {
        payload = { obtainedMarks: m, feedback: feedback || undefined };
      }
      await attemptsApi.grade(id, payload);
      router.push("/review");
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Feedback is required when rejecting");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await attemptsApi.reject(id, { feedback });
      router.push("/review");
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || "Failed to reject");
    } finally {
      setSubmitting(false);
    }
  };

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
        <p className="text-slate-600">Attempt not found.</p>
        <Link href="/review" className="mt-4 inline-block text-[#1e3a8a] font-medium">
          Back to Check Tests
        </Link>
      </div>
    );
  }

  const maxMarks = attempt.test.total_marks;
  const isClaimed = attempt.status === "IN_REVIEW" || attempt.status === "COMPLETED" || attempt.status === "REJECTED";

  return (
    <div>
      <Link href="/review" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6">
        ← Back to Check Tests
      </Link>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">{attempt.test.title}</h1>
          <p className="text-slate-600 text-sm mt-1">
            by {attempt.user.first_name} {attempt.user.last_name} ({attempt.user.email})
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

        {!isClaimed ? (
          <button
            onClick={handleClaim}
            className="mb-6 px-4 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af]"
          >
            Claim & start checking
          </button>
        ) : (
          <>
            <form onSubmit={handleGrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marks (0–{maxMarks})</label>
                <input
                  type="number"
                  min={0}
                  max={maxMarks}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comment / feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  placeholder="Feedback for the student..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Upload checked sheet (PDF, max 5MB) — optional
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setCheckedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-600"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Submit evaluation
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting || !feedback.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-lg disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

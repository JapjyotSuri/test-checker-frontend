"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { testsApi, attemptsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { FileText, Upload, Clock, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:4000";
const ATTEMPT_DURATION_SECONDS = 2 * 60 * 60; // 2 hours

export default function TestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const { getToken } = useClerkAuth();
  const [test, setTest] = useState<{
    id: string;
    title: string;
    total_marks: number;
    duration: number | null;
    pdf_url: string;
  } | null>(null);
  const [existingAttempt, setExistingAttempt] = useState<{ id: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(ATTEMPT_DURATION_SECONDS);
  const [timerStarted, setTimerStarted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const [testRes, attemptsRes] = await Promise.all([
          testsApi.getById(testId),
          attemptsApi.getAll({ testId }),
        ]);
        setTest(testRes.data.test);
        const attempts = attemptsRes.data.attempts || [];
        if (attempts.length > 0) {
          setExistingAttempt({
            id: attempts[0].id,
            status: attempts[0].status,
          });
        }
      } catch (e) {
        setTest(null);
      } finally {
        setLoading(false);
      }
    };
    if (testId) fetchData();
  }, [testId, getToken]);

  // 2-hour countdown timer (starts when page loads)
  useEffect(() => {
    if (!timerStarted && test && !existingAttempt) {
      setTimerStarted(true);
    }
    if (!timerStarted || existingAttempt || timerSeconds <= 0) return;
    const t = setInterval(() => {
      setTimerSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [timerStarted, existingAttempt, timerSeconds]);

  const formatTimer = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a PDF file");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("testId", testId);
      await attemptsApi.submit(formData);
      router.push("/attempts");
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || "Submit failed");
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

  if (!test) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-600">Test not found.</p>
        <Link href="/my-tests" className="mt-4 inline-block text-[#1e3a8a] font-medium">
          Back to My Tests
        </Link>
      </div>
    );
  }

  const downloadUrl = `${API_BASE}${test.pdf_url}`;

  if (existingAttempt) {
    return (
      <div>
        <Link
          href="/my-tests"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 mb-2">{test.title}</h1>
          <p className="text-amber-700 font-medium mb-4">
            You have already submitted your answer sheet for this test.
          </p>
          <p className="text-slate-600 text-sm mb-4">
            {existingAttempt.status === "PENDING" || existingAttempt.status === "IN_REVIEW"
              ? "Result is yet to be added. We will notify you when it is ready."
              : "View your result in the Results page."}
          </p>
          <Link
            href="/attempts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af]"
          >
            Go to Results
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/my-tests"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1e3a8a]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#1e3a8a]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{test.title}</h1>
              <p className="text-slate-600 text-sm">{test.total_marks} marks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="font-mono font-semibold text-amber-800">
              Time: {formatTimer(timerSeconds)}
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2">Question paper (PDF)</p>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={test.title || "question-paper.pdf"}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] text-white rounded-lg font-medium hover:bg-[#1e40af] transition-colors"
          >
            <Download className="w-5 h-5" />
            Download question paper
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload your answer sheet (PDF)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1e3a8a]/10 file:text-[#1e3a8a] file:font-medium"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting || timerSeconds <= 0}
            className="mt-6 w-full py-3 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {timerSeconds <= 0
              ? "Time's up"
              : submitting
                ? "Submitting…"
                : "Submit answer sheet"}
          </button>
        </form>
      </div>
    </div>
  );
}

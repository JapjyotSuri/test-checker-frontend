"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { testsApi, attemptsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { FileText, Upload, Clock, ArrowLeft, Download, Lock, Eye } from "lucide-react";
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
  const [openedPdf, setOpenedPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [answerUrl, setAnswerUrl] = useState<string | null>(null);
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
      } catch (err: unknown) {
        // Surface clearer error messages to help debugging (401/403/404)
        const e = err as { response?: { status?: number; data?: { error?: string } } };
        const status = e.response?.status;
        const message = e.response?.data?.error || 'Failed to load test';
        if (status === 401) {
          setError('Unauthorized - please sign in');
        } else if (status === 403) {
          setError(message || 'Forbidden - you do not have access to this test');

          // Dev fallback: try to fetch the PDF path from the debug endpoint and open it directly
          try {
            // Force a fresh fetch to avoid cached 304 responses
            const debugRes = await fetch(`${API_BASE}/api/debug/test-file/${testId}`, { cache: 'no-store' });
            if (debugRes.ok) {
              const data = await debugRes.json();
              const fileUrl = `${API_BASE}${data.pdf_url}`;
              // Set the inline viewer URL so the PDF shows on the same page
              setPdfUrl(fileUrl);
              setOpenedPdf(true);
            } else {
              console.warn('Debug endpoint returned non-ok status', debugRes.status);
            }
          } catch (fetchErr) {
            console.warn('Failed to call debug endpoint:', fetchErr);
          }
        } else if (status === 404) {
          setError('Test not found');
        } else {
          setError(message);
        }
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

  // When test data is loaded for a fresh attempt, set the inline pdfUrl so viewer shows on the page
  useEffect(() => {
    if (!test || existingAttempt) return;
    if (openedPdf) return;
    const url = `${API_BASE}${test.pdf_url}`;
    setPdfUrl(url);
    setOpenedPdf(true);
  }, [test, existingAttempt, openedPdf]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a PDF file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("PDF must be ≤ 5 MB");
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

  const loadAnswer = async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await testsApi.getAnswer(testId);
      const url = `${API_BASE}${res.data.downloadUrl}`;
      setAnswerUrl(url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Answer sheet not available");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1e3a8a] border-t-transparent" />
      </div>
    );
  }

  // If we don't have test metadata but we do have a pdfUrl (from debug fallback),
  // still render the page so the embedded viewer can show the PDF.
  if (!test && !pdfUrl) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-600">Test not found.</p>
        <Link href="/my-tests" className="mt-4 inline-block text-[#1e3a8a] font-medium">
          Back to My Tests
        </Link>
      </div>
    );
  }

  const safeTitle = test?.title || 'question-paper';
  const safeMarks = test?.total_marks ?? 0;
  const downloadUrl = pdfUrl ?? (test ? `${API_BASE}${test.pdf_url}` : '');

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
          <h1 className="text-xl font-bold text-slate-800 mb-2">{safeTitle}</h1>
          <p className="text-amber-700 font-medium mb-4">
            You have already submitted your answer sheet for this test.
          </p>
          <p className="text-slate-600 text-sm mb-4">
            {existingAttempt.status === "PENDING" || existingAttempt.status === "IN_REVIEW"
              ? "Result is yet to be added. We will notify you when it is ready."
              : "View your result in the Results page."}
          </p>
          <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <p className="text-sm font-medium text-slate-700 mb-2">Answer sheet</p>
            {existingAttempt.status === "COMPLETED" ? (
              <button
                type="button"
                onClick={loadAnswer}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                View answer sheet
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm font-medium cursor-not-allowed"
                title="Answer unlocks after your test is Completed"
              >
                <Lock className="w-4 h-4" />
                Answer available after completion
              </button>
            )}
          </div>
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
              <h1 className="text-xl font-bold text-slate-800">{safeTitle}</h1>
              <p className="text-slate-600 text-sm">{safeMarks} marks</p>
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
          {pdfUrl ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                title={safeTitle}
                className="w-full"
                style={{ height: 600, border: 'none' }}
              />
              <div className="p-3 bg-slate-50 flex items-center justify-end gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={safeTitle}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] text-white rounded-lg font-medium hover:bg-[#1e40af] transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Open in new tab / Download
                </a>
              </div>
            </div>
          ) : (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
                  download={safeTitle}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] text-white rounded-lg font-medium hover:bg-[#1e40af] transition-colors"
            >
              <Download className="w-5 h-5" />
              Download question paper
            </a>
          )}
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2">Answer sheet</p>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm font-medium cursor-not-allowed"
            title="Locked until you attempt this test"
          >
            <Lock className="w-4 h-4" />
            Locked until you attempt this test
          </button>
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

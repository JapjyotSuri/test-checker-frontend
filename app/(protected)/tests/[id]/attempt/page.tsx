"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { testsApi, attemptsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { FileText, Upload, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000";

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(60);
  const [seconds, setSeconds] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await testsApi.getById(testId);
        setTest(res.data.test);
        const dur = res.data.test.duration;
        if (dur) {
          setMinutes(Math.floor(dur / 60));
          setSeconds(dur % 60);
        }
      } catch (e) {
        setTest(null);
      } finally {
        setLoading(false);
      }
    };
    if (testId) fetchTest();
  }, [testId, getToken]);

  useEffect(() => {
    if (!test?.duration || (minutes === 0 && seconds === 0)) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;
        if (minutes > 0) {
          setMinutes((m) => m - 1);
          return 59;
        }
        clearInterval(t);
        return 0;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [test?.duration]);

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1e3a8a]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#1e3a8a]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{test.title}</h1>
              <p className="text-slate-600 text-sm">{test.total_marks} marks</p>
            </div>
          </div>
          {test.duration && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="font-mono font-semibold text-amber-800">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2">Question paper</p>
          <a
            href={`${API_BASE}${test.pdf_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            View / Download PDF
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload your answer (PDF)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1e3a8a]/10 file:text-[#1e3a8a] file:font-medium"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full py-3 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { testSeriesApi, purchasesApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getToken } = useClerkAuth();
  const [series, setSeries] = useState<{
    id: string;
    title: string;
    description: string | null;
    price: string;
    number_of_tests: number;
    subject: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await testSeriesApi.getById(id);
        setSeries(res.data.testSeries);
      } catch (e) {
        setSeries(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, getToken]);

  const handleConfirm = async () => {
    if (!series) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      await purchasesApi.create({
        testSeriesId: series.id,
        paymentReference: `simple-${Date.now()}`,
      });
      router.push("/my-tests");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || "Purchase failed");
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

  if (!series) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-600">Test series not found.</p>
        <Link href="/browse" className="mt-4 inline-block text-[#1e3a8a] font-medium">
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/browse"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse
      </Link>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#1e3a8a]/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#1e3a8a]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{series.title}</h1>
            <p className="text-slate-600 text-sm">₹{series.price} • {series.number_of_tests} tests</p>
          </div>
        </div>
        <p className="text-slate-600 text-sm mb-6">{series.description || "No description"}</p>
        <p className="text-lg font-semibold text-slate-800 mb-6">Amount: ₹{series.price}</p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full py-3 bg-[#f59e0b] hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-semibold rounded-lg transition-colors"
        >
          {submitting ? "Processing…" : "Confirm purchase"}
        </button>
        <p className="text-xs text-slate-500 mt-4 text-center">
          Simple checkout — no payment gateway. Purchase will be recorded.
        </p>
      </div>
    </div>
  );
}

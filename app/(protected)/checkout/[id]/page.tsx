"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { testSeriesApi, purchasesApi, couponsApi, setAuthToken } from "@/lib/api";
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
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState<number | null>(null);
  const [validating, setValidating] = useState(false);

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
        couponCode: couponPercent ? couponCode.trim().toUpperCase() : undefined,
      });
      router.push("/my-tests");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || "Purchase failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidating(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await couponsApi.validate(couponCode.trim().toUpperCase());
      setCouponPercent(res.data.coupon.discount_percent);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setCouponPercent(null);
      setError(err?.response?.data?.error || "Invalid coupon");
    } finally {
      setValidating(false);
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Coupon code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={validating || !couponCode.trim()}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
            >
              {validating ? "Applying…" : "Apply"}
            </button>
          </div>
          {couponPercent != null && (
            <p className="text-sm text-emerald-700 mt-2">Applied {couponPercent}% off</p>
          )}
        </div>
        <p className="text-lg font-semibold text-slate-800 mb-6">
          Amount: ₹
          {(() => {
            const base = parseFloat(series.price);
            if (couponPercent != null) {
              const disc = Math.round((base * (100 - couponPercent)) ) / 100;
              return disc.toFixed(2);
            }
            return parseFloat(series.price).toFixed(2);
          })()}
        </p>
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

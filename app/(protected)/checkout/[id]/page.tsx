"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { testSeriesApi, purchasesApi, couponsApi } from "@/lib/api";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void> | void;
  notes?: Record<string, string>;
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
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
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await testSeriesApi.getById(id);
        setSeries(res.data.testSeries);
      } catch (e) {
        setSeries(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const loadRazorpayScript = async () => {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) return true;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });

    return !!window.Razorpay;
  };

  const handleConfirm = async () => {
    if (!series) return;
    setSubmitting(true);
    setError(null);
    try {
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

  const handleRazorpayPayment = async () => {
    if (!series) return;
    setError(null);
    setPaying(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError("Failed to load Razorpay checkout");
        setPaying(false);
        return;
      }

      const orderRes = await purchasesApi.createRazorpayOrder({
        testSeriesId: series.id,
        couponCode: couponPercent ? couponCode.trim().toUpperCase() : undefined,
      });

      const order = orderRes.data as {
        orderId: string;
        keyId: string;
        amount: number;
        currency: string;
        seriesTitle: string;
      };

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Ca Prep Series",
        description: order.seriesTitle,
        order_id: order.orderId,
        notes: {
          testSeriesId: series.id,
        },
        theme: { color: "#1e3a8a" },
        modal: {
          ondismiss: () => setPaying(false),
        },
        handler: async (response) => {
          try {
            await purchasesApi.confirmRazorpay({
              testSeriesId: series.id,
              couponCode: couponPercent ? couponCode.trim().toUpperCase() : undefined,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push("/my-tests");
          } catch (e: unknown) {
            const err = e as { response?: { data?: { error?: string } } };
            setError(err?.response?.data?.error || "Payment verification failed");
          } finally {
            setPaying(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Unable to start Razorpay payment");
      setPaying(false);
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
        <div className="space-y-3">
          <button
            onClick={handleRazorpayPayment}
            disabled={paying}
            className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {paying ? "Opening Razorpay..." : "Pay with Razorpay"}
          </button>
          {/* <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full py-3 bg-[#f59e0b] hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-semibold rounded-lg transition-colors"
          >
            {submitting ? "Processing…" : "Confirm purchase (Dev)"}
          </button> */}
          {/* <p className="text-xs text-slate-500 text-center">
            Use Razorpay for live payments. The dev button records a manual purchase.
          </p> */}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { couponsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { Plus, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";

type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  created_at: string;
};

export default function AdminCouponsPage() {
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/dashboard");
  }, [authLoading, isAdmin]);

  const fetchCoupons = async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await couponsApi.getAll();
      setCoupons(res.data.coupons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchCoupons();
  }, [isAdmin, getToken]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const p = parseInt(percent, 10);
    if (!code.trim() || isNaN(p) || p <= 0 || p > 100) {
      setError("Provide code and valid percentage (1–100)");
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      await couponsApi.create({ code: code.trim().toUpperCase(), discountPercent: p, active: true });
      setCode("");
      setPercent("");
      await fetchCoupons();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || "Failed to add coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    setDeleting(id);
    try {
      const token = await getToken();
      setAuthToken(token);
      await couponsApi.delete(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1e3a8a] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Coupons</h1>
        <p className="text-slate-600">Create and manage discount codes</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CODE"
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
          />
          <input
            type="number"
            min={1}
            max={100}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="Discount %"
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {submitting ? "Adding…" : "Add coupon"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Code</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Discount %</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Active</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{c.code}</td>
                <td className="px-6 py-4 text-slate-700">{c.discount_percent}%</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${c.active ? "status-completed" : "status-rejected"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

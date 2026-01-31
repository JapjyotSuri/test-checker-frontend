"use client";

import { useEffect, useState } from "react";
import { adminApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { ShoppingCart, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

interface Purchase {
  id: string;
  user_id?: string;
  amount: string;
  created_at: string;
  payment_reference: string | null;
  first_name: string;
  last_name: string;
  email: string;
  test_series_title: string;
}

export default function AdminSalesPage() {
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/dashboard");
  }, [authLoading, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await adminApi.getSales();
        setPurchases(res.data.purchases || []);
        setTotalRevenue(res.data.totalRevenue ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) fetchData();
  }, [getToken, isAdmin]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1e3a8a] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Sales Report</h1>
        <p className="text-slate-600 mt-1">Purchases and total revenue from test series sales</p>
      </div>

      <div className="bg-[#1e3a8a] text-white rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-white/80 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Student</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Test Series</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                  No purchases yet
                </td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800">
                      {p.first_name} {p.last_name}
                    </span>
                    <p className="text-sm text-slate-500">{p.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{p.test_series_title}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">₹{p.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

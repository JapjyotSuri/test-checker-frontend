"use client";

import { useEffect, useState } from "react";
import { testSeriesApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface TestSeries {
  id: string;
  title: string;
  description: string | null;
  price: string;
  number_of_tests: number;
  actual_test_count?: number;
  subject: string | null;
  status: string;
}

export default function AdminSeriesPage() {
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [series, setSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/dashboard");
  }, [authLoading, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await testSeriesApi.getAll();
        setSeries(res.data.testSeries || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) fetchData();
  }, [getToken, isAdmin]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test series?")) return;
    try {
      const token = await getToken();
      setAuthToken(token);
      await testSeriesApi.delete(id);
      setSeries((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Test Series</h1>
          <p className="text-slate-600 mt-1">Create and edit test series for students to purchase</p>
        </div>
        <Link
          href="/admin/series/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Test Series
        </Link>
      </div>

      {series.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No test series yet</h3>
          <p className="text-slate-500 mt-2 mb-4">Create a test series to sell to students.</p>
          <Link
            href="/admin/series/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af]"
          >
            <Plus className="w-5 h-5" />
            Add First Test Series
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Title</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Subject</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Tests</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Price</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {series.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{s.title}</td>
                  <td className="px-6 py-4 text-slate-600">{s.subject || "—"}</td>
                  <td className="px-6 py-4 text-slate-600">{s.actual_test_count ?? s.number_of_tests}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">₹{s.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        s.status === "PUBLISHED" ? "status-completed" : "status-pending"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Link
                      href={`/admin/series/${s.id}`}
                      className="p-2 text-slate-600 hover:text-[#1e3a8a] hover:bg-[#1e3a8a]/5 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

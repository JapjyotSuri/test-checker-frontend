"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { testSeriesApi, testsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function EditTestSeriesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [numberOfTests, setNumberOfTests] = useState("1");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<{ id: string; title: string }[]>([]);
  const [allTests, setAllTests] = useState<{ id: string; title: string }[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/dashboard");
  }, [authLoading, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const [seriesRes, testsRes] = await Promise.all([
          testSeriesApi.getById(id),
          testsApi.getAll({}),
        ]);
        const s = seriesRes.data.testSeries;
        setTitle(s.title);
        setDescription(s.description || "");
        setPrice(s.price);
        setNumberOfTests(String(s.number_of_tests || 1));
        setSubject(s.subject || "");
        setStatus(s.status || "DRAFT");
        setTests(s.tests || []);
        setSelectedTestIds((s.tests || []).map((t: { id: string }) => t.id));
        setAllTests(testsRes.data.tests || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id && isAdmin) fetchData();
  }, [id, isAdmin, getToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      await testSeriesApi.update(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        numberOfTests: numberOfTests ? parseInt(numberOfTests, 10) : undefined,
        subject: subject.trim() || undefined,
        status,
      });
      await testSeriesApi.linkTests(id, selectedTestIds);
      router.push(`/admin/series/${id}`);
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTest = (testId: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
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
      <Link
        href="/admin/series"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Test Series
      </Link>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-xl">
        <h1 className="text-xl font-bold text-slate-800 mb-6">Edit Test Series</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Test series name *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Number of tests</label>
              <input
                type="number"
                min={1}
                value={numberOfTests}
                onChange={(e) => setNumberOfTests(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Category</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Link tests to this series</label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2">
              {allTests.length === 0 ? (
                <p className="text-slate-500 text-sm">No tests available. Add tests from the series page.</p>
              ) : (
                allTests.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTestIds.includes(t.id)}
                      onChange={() => toggleTest(t.id)}
                      className="rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                    />
                    <span className="text-sm text-slate-700">{t.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

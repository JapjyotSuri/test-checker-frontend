"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { testSeriesApi, testsApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowLeft, Plus, Pencil, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:4000";

type TestInSeries = {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  pdf_url: string;
  pdf_file_name: string;
  total_marks?: number;
  duration?: number | null;
  status: string;
};

export default function SeriesDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [series, setSeries] = useState<{
    id: string;
    title: string;
    number_of_tests: number;
    subject: string | null;
    tests?: TestInSeries[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addSubject, setAddSubject] = useState("");
  const [addPdf, setAddPdf] = useState<File | null>(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editPdf, setEditPdf] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/dashboard");
  }, [authLoading, isAdmin]);

  const fetchSeries = async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await testSeriesApi.getById(id);
      setSeries(res.data.testSeries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && isAdmin) fetchSeries();
  }, [id, isAdmin, getToken]);

  const tests = series?.tests || [];
  const numberAllowed = series?.number_of_tests ?? 0;
  const canAddMore = tests.length < numberAllowed;

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!addTitle.trim()) {
      setAddError("Title is required");
      return;
    }
    if (!addPdf || addPdf.type !== "application/pdf") {
      setAddError("Please select a PDF file");
      return;
    }
    setAddSubmitting(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      const formData = new FormData();
      formData.append("title", addTitle.trim());
      formData.append("subject", addSubject.trim());
      formData.append("pdf", addPdf);
      formData.append("testSeriesId", id);
      await testsApi.create(formData);
      setAddTitle("");
      setAddSubject("");
      setAddPdf(null);
      setShowAddForm(false);
      await fetchSeries();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setAddError(res?.response?.data?.error || "Failed to add test");
    } finally {
      setAddSubmitting(false);
    }
  };

  const startEdit = (t: TestInSeries) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditSubject(t.subject || "");
    setEditPdf(null);
    setEditError(null);
  };

  const handleEditTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditError(null);
    if (!editTitle.trim()) {
      setEditError("Title is required");
      return;
    }
    setEditSubmitting(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("subject", editSubject.trim());
      if (editPdf) formData.append("pdf", editPdf);
      await testsApi.update(editingId, formData);
      setEditingId(null);
      await fetchSeries();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setEditError(res?.response?.data?.error || "Failed to update test");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Delete this test? This cannot be undone.")) return;
    setDeletingId(testId);
    try {
      const token = await getToken();
      setAuthToken(token);
      await testsApi.delete(testId);
      await fetchSeries();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1e3a8a] border-t-transparent" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="text-slate-600">
        <Link href="/admin/series" className="inline-flex items-center gap-2 text-[#1e3a8a] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Test Series
        </Link>
        <p>Series not found.</p>
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

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{series.title}</h1>
          <p className="text-slate-600 mt-1">
            Tests: {tests.length} / {numberAllowed}
            {series.subject && ` · ${series.subject}`}
          </p>
        </div>
        <Link
          href={`/admin/series/${id}/edit`}
          className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
        >
          Edit series
        </Link>
      </div>

      <div className="mb-6">
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            disabled={!canAddMore}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Add test
            {!canAddMore && ` (max ${numberAllowed})`}
          </button>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Add test</h2>
            <form onSubmit={handleAddTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={addSubject}
                  onChange={(e) => setAddSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PDF *</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setAddPdf(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>
              {addError && <p className="text-sm text-red-600">{addError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-4 py-2 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
                >
                  {addSubmitting ? "Adding…" : "Add test"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddError(null);
                    setAddTitle("");
                    setAddSubject("");
                    setAddPdf(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No tests in this series</h3>
          <p className="text-slate-500 mt-2">
            {canAddMore ? "Use the Add test button above to add tests (title, subject, PDF)." : "This series has reached its test limit. Edit the series to increase the number of tests."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Title</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Subject</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">PDF</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  {editingId === t.id ? (
                    <td colSpan={4} className="px-6 py-4 bg-amber-50/50">
                      <form onSubmit={handleEditTest} className="space-y-3 max-w-xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
                            <input
                              type="text"
                              value={editSubject}
                              onChange={(e) => setEditSubject(e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">New PDF (optional)</label>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setEditPdf(e.target.files?.[0] || null)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                          />
                        </div>
                        {editError && <p className="text-sm text-red-600">{editError}</p>}
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={editSubmitting}
                            className="px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded hover:bg-[#1e40af] disabled:opacity-50"
                          >
                            {editSubmitting ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditError(null);
                            }}
                            className="px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-slate-800">{t.title}</td>
                      <td className="px-6 py-4 text-slate-600">{t.subject || "—"}</td>
                      <td className="px-6 py-4">
                        <a
                          href={`${API_BASE}${t.pdf_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1e3a8a] hover:underline text-sm"
                        >
                          {t.pdf_file_name}
                        </a>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(t)}
                          className="p-2 text-slate-600 hover:text-[#1e3a8a] hover:bg-[#1e3a8a]/5 rounded-lg"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTest(t.id)}
                          disabled={deletingId === t.id}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

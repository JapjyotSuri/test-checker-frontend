"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { testSeriesApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function NewTestSeriesPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [numberOfTests, setNumberOfTests] = useState("1");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [category, setCategory] = useState("FOUNDATION");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && !isAdmin) redirect("/dashboard");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Build FormData so we can optionally upload an image
      const payload = new FormData();
      payload.append('title', title.trim());
      if (description.trim()) payload.append('description', description.trim());
      payload.append('price', String(parseFloat(price) || 0));
      payload.append('numberOfTests', String(parseInt(numberOfTests, 10) || 1));
      if (subject.trim()) payload.append('subject', subject.trim());
      payload.append('status', status);
      payload.append('category', category);
      if (imageFile) payload.append('image', imageFile);

      await testSeriesApi.create(payload);
      router.push("/admin/series");
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-xl font-bold text-slate-800 mb-6">Add New Test Series</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Test series name *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
              placeholder="e.g. CA Foundation - Accounting"
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
              placeholder="Brief description of the test series"
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
              placeholder="e.g. Accounting"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
            >
              <option value="FOUNDATION">Foundation</option>
              <option value="INTER">Inter</option>
              <option value="FINAL">Final</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Series image (optional)</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Test Series"}
          </button>
        </form>
      </div>
    </div>
  );
}

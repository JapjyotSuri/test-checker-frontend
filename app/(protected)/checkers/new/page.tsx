"use client";

import { useEffect, useState } from "react";
import { usersApi, checkersApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Users, Mail, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export default function AddCheckerPage() {
  const router = useRouter();
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/checkers");
  }, [authLoading, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await usersApi.getAll({ role: "USER" });
        setStudents(res.data.users || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) fetchData();
  }, [getToken, isAdmin]);

  const handleAddChecker = async (userId: string) => {
    setAdding(userId);
    try {
      const token = await getToken();
      setAuthToken(token);
      await checkersApi.create({ userId });
      router.push("/checkers");
    } catch (e) {
      console.error(e);
      setAdding(null);
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
      <Link
        href="/checkers"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Checkers
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Add Checker</h1>
        <p className="text-slate-600 mt-1">Select a student to promote to Checker. They will be able to check and grade submissions.</p>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No students to add</h3>
          <p className="text-slate-500 mt-2">All students may already be checkers, or no one has signed up yet.</p>
          <Link href="/checkers" className="mt-4 inline-block text-[#1e3a8a] font-medium">
            Back to Checkers
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {u.email}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleAddChecker(u.id)}
                      disabled={adding === u.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      {adding === u.id ? "Adding…" : "Add as Checker"}
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

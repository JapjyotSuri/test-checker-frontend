"use client";

import { useEffect, useState } from "react";
import { usersApi, checkersApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { Users, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
}

export default function AdminStudentsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [makingChecker, setMakingChecker] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await usersApi.getAll({ role: "USER" });
      setUsers(res.data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/dashboard");
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const handleMakeChecker = async (userId: string) => {
    setMakingChecker(userId);
    try {
      await checkersApi.create({ userId });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      console.error(e);
    } finally {
      setMakingChecker(null);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <p className="text-slate-600 mt-1">List of students. Promote any student to Checker from here.</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No students yet</h3>
          <p className="text-slate-500 mt-2">Students will appear after they sign up.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {u.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        u.is_active ? "status-completed" : "status-rejected"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleMakeChecker(u.id)}
                      disabled={makingChecker === u.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      {makingChecker === u.id ? "Adding…" : "Make Checker"}
                    </button>
                    <Link
                      href={`/admin/students/${u.id}`}
                      className="text-[#1e3a8a] font-medium hover:underline text-sm"
                    >
                      View purchases
                    </Link>
                  </td>
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

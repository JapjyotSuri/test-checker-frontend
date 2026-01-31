"use client";

import { useEffect, useState } from "react";
import { usersApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { Users, Mail } from "lucide-react";
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
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) redirect("/dashboard");
  }, [authLoading, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const res = await usersApi.getAll({ role: "USER" });
        setUsers(res.data.users || []);
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
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <p className="text-slate-600 mt-1">List of students; view purchases from user detail</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No students yet</h3>
          <p className="text-slate-500 mt-2">Students will appear after they sign up.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
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
                  <td className="px-6 py-4">
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
      )}
    </div>
  );
}

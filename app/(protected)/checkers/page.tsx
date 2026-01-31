"use client";

import { useEffect, useState } from "react";
import { checkersApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { Users, Plus, Mail, Award } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Checker {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  total_checked: number;
  specialization: string | null;
  qualification: string | null;
  experience: number | null;
}

export default function CheckersPage() {
  const { getToken } = useClerkAuth();
  const { isAdmin, loading: authLoading } = useAuth();
  const [checkers, setCheckers] = useState<Checker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      redirect("/dashboard");
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    const fetchCheckers = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const response = await checkersApi.getAll();
        setCheckers(response.data.checkers);
      } catch (error) {
        console.error("Failed to fetch checkers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchCheckers();
    }
  }, [getToken, isAdmin]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1e3a8a] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Checkers</h1>
          <p className="text-slate-400">Manage your test checkers</p>
        </div>
        <Link
          href="/checkers/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Checker
        </Link>
      </div>

      {checkers.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No checkers yet</h3>
          <p className="text-slate-400 mb-4">Add checkers to start reviewing submissions</p>
          <Link
            href="/checkers/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add First Checker
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checkers.map((checker) => (
            <Link
              key={checker.id}
              href={`/checkers/${checker.id}`}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-lg">
                  {checker.first_name?.[0] || checker.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {checker.first_name} {checker.last_name}
                  </h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" />
                    {checker.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Submissions Checked</span>
                  <span className="text-white font-medium">{checker.total_checked}</span>
                </div>
                {checker.specialization && (
                  <div className="flex items-center gap-1 mt-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-slate-300">{checker.specialization}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { checkersApi } from "@/lib/api";
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
  }, [isAdmin]);

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
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Checkers</h1>
          <p className="text-slate-600">Manage your checkers. Add checkers from the Students list or here.</p>
        </div>
        <Link
          href="/(protected)/checkers/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Checker
        </Link>
      </div>

      {checkers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No checkers yet</h3>
          <p className="text-slate-500 mb-4">Promote students to Checker from Students or Add Checker.</p>
          <Link
            href="/checkers/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Checker
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checkers.map((checker) => (
            <Link
              key={checker.id}
              href={`/checkers/${checker.id}`}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-[#1e3a8a]/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#1e3a8a]/10 rounded-full flex items-center justify-center text-[#1e3a8a] font-bold text-lg">
                  {checker.first_name?.[0] || checker.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 truncate">
                    {checker.first_name} {checker.last_name}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" />
                    {checker.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Submissions Checked</span>
                  <span className="text-slate-800 font-medium">{checker.total_checked}</span>
                </div>
                {checker.specialization && (
                  <div className="flex items-center gap-1 mt-2">
                    <Award className="w-4 h-4 text-[#f59e0b]" />
                    <span className="text-sm text-slate-600">{checker.specialization}</span>
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


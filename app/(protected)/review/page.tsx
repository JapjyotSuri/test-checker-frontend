"use client";

import { useEffect, useState } from "react";
import { attemptsApi, checkersApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { ClipboardCheck, Clock, User, FileText } from "lucide-react";
import Link from "next/link";

interface Attempt {
  id: string;
  status: string;
  submitted_at: string;
  submitted_pdf_url: string;
  test: {
    id: string;
    title: string;
    total_marks: number;
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Stats {
  pending_for_review: number;
  in_progress: number;
  completed: number;
  total: number;
}

export default function ReviewPage() {
  const { isChecker } = useAuth();  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attemptsRes, statsRes] = await Promise.all([
          attemptsApi.getAll({ status: "PENDING" }),
          checkersApi.getMyStats(),
        ]);
        
        setAttempts(attemptsRes.data.attempts);
        setStats(statsRes.data.stats);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isChecker) {
      fetchData();
    }
  }, [isChecker]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Review Submissions</h1>
        <p className="text-slate-400">Check and grade student submissions</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending_for_review}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-sm">In Progress</p>
            <p className="text-2xl font-bold text-blue-400">{stats.in_progress}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Total Reviewed</p>
            <p className="text-2xl font-bold text-purple-400">{stats.total}</p>
          </div>
        </div>
      )}

      {/* Pending Attempts */}
      <h2 className="text-xl font-semibold text-white mb-4">Pending for Review</h2>
      
      {attempts.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No pending submissions</h3>
          <p className="text-slate-400">All caught up! Check back later for new submissions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {attempt.test.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <User className="w-4 h-4" />
                      {attempt.user.first_name} {attempt.user.last_name}
                      <span className="text-slate-600">•</span>
                      <span>{attempt.user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${attempt.submitted_pdf_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View PDF
                  </a>
                  <Link
                    href={`/review/${attempt.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Review
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


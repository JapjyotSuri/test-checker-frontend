"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { FileText, ClipboardCheck, Users, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, clerkUser, loading, error, isAdmin, isChecker, displayName } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-200 font-medium">Backend Connection Issue</p>
            <p className="text-yellow-300/70 text-sm">{error}. Make sure the backend is running on port 4000.</p>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {displayName}!
        </h1>
        <p className="text-slate-400">
          {isAdmin
            ? "Manage your tests, checkers, and view reports."
            : isChecker
            ? "Review pending submissions and track your progress."
            : "View available tests and track your submissions."}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          href="/tests"
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-colors group"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {isAdmin ? "Manage Tests" : "View Tests"}
          </h3>
          <p className="text-sm text-slate-400">
            {isAdmin ? "Create and manage test papers" : "Browse available tests"}
          </p>
        </Link>

        {!isAdmin && (
          <Link
            href="/attempts"
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-colors group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
              <ClipboardCheck className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">My Attempts</h3>
            <p className="text-sm text-slate-400">View your submitted tests</p>
          </Link>
        )}

        {isChecker && (
          <Link
            href="/review"
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-colors group"
          >
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500/30 transition-colors">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Pending Review</h3>
            <p className="text-sm text-slate-400">Check submitted answers</p>
          </Link>
        )}

        {isAdmin && (
          <>
            <Link
              href="/checkers"
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Manage Checkers</h3>
              <p className="text-sm text-slate-400">Add and manage checkers</p>
            </Link>

            <Link
              href="/admin"
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-colors group"
            >
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-colors">
                <ClipboardCheck className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">View Reports</h3>
              <p className="text-sm text-slate-400">Analytics and statistics</p>
            </Link>
          </>
        )}
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-700/50 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {clerkUser?.firstName?.[0] || clerkUser?.emailAddresses?.[0]?.emailAddress?.[0] || "U"}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {clerkUser?.firstName} {clerkUser?.lastName}
            </h3>
            <p className="text-slate-400">{clerkUser?.emailAddresses?.[0]?.emailAddress}</p>
          </div>
          <div className="ml-auto">
            <span className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">
              {user?.role || "USER"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

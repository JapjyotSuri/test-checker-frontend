"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { clsx } from "clsx";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";

const roleLabels: Record<string, string> = {
  USER: "Student",
  CHECKER: "Checker",
  ADMIN: "Admin",
};

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, displayName, logout } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const roleLabel = user ? roleLabels[user.role] || user.role : "Student";

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.replace("/");
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        {/* Static role badge — not clickable, roles cannot be switched */}
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-semibold",
            user?.role === "ADMIN" && "bg-[#1e3a8a] text-white",
            user?.role === "CHECKER" && "bg-[#1e3a8a]/80 text-white",
            (!user?.role || user?.role === "USER") && "bg-amber-100 text-amber-800"
          )}
        >
          {roleLabel}
        </span>

        <span className="text-slate-600 text-sm hidden sm:inline">{displayName}</span>
      </div>

      {/* User avatar + dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-9 h-9 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white font-semibold text-sm hover:bg-[#1e40af] transition-colors"
          aria-label="User menu"
        >
          {displayName.charAt(0).toUpperCase()}
        </button>

        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" aria-hidden onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

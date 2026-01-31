"use client";

import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { clsx } from "clsx";
import { useState } from "react";
import { authApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";

const roleLabels: Record<string, string> = {
  USER: "Student",
  CHECKER: "Checker",
  ADMIN: "Admin",
};

const ALLOW_ROLE_SWITCH = process.env.NEXT_PUBLIC_ALLOW_ROLE_SWITCH === "true";

export function Header() {
  const { user, displayName, refetchUser } = useAuth();
  const { getToken } = useClerkAuth();
  const [switching, setSwitching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const roleLabel = user ? roleLabels[user.role] || user.role : "Student";

  const handleSwitchRole = async (role: "USER" | "CHECKER" | "ADMIN") => {
    if (!user || user.role === role) {
      setDropdownOpen(false);
      return;
    }
    setSwitching(true);
    setDropdownOpen(false);
    try {
      const token = await getToken();
      setAuthToken(token);
      await authApi.switchRole(role);
      await refetchUser();
      window.location.reload(); // Reload so sidebar/nav and all role-based UI update
    } catch (e) {
      console.error("Role switch failed:", e);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {ALLOW_ROLE_SWITCH && user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={switching}
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                user.role === "ADMIN" && "bg-[#1e3a8a] text-white border-[#1e3a8a]",
                user.role === "CHECKER" && "bg-[#1e3a8a]/80 text-white border-[#1e3a8a]/80",
                user.role === "USER" && "bg-amber-100 text-amber-800 border-amber-200",
                "hover:opacity-90 disabled:opacity-50"
              )}
            >
              {roleLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 py-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                  {(["USER", "CHECKER", "ADMIN"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSwitchRole(r)}
                      className={clsx(
                        "w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        user.role === r
                          ? "bg-[#1e3a8a] text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      {roleLabels[r]}
                    </button>
                  ))}
                  <p className="px-3 py-2 text-xs text-slate-500 border-t border-slate-100 mt-1">
                    Switch persona (dev)
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <span
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-semibold",
              user?.role === "ADMIN" && "bg-[#1e3a8a] text-white",
              user?.role === "CHECKER" && "bg-[#1e3a8a]/80 text-white",
              user?.role === "USER" && "bg-amber-100 text-amber-800"
            )}
          >
            {roleLabel}
          </span>
        )}
        <span className="text-slate-600 text-sm hidden sm:inline">
          {displayName}
        </span>
      </div>
      <UserButton
        appearance={{
          elements: { avatarBox: "w-9 h-9" },
        }}
      />
    </header>
  );
}

"use client";

import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { clsx } from "clsx";

const roleLabels: Record<string, string> = {
  USER: "Student",
  CHECKER: "Checker",
  ADMIN: "Admin",
};

export function Header() {
  const { user, displayName } = useAuth();
  const roleLabel = user ? roleLabels[user.role] || user.role : "Student";

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  Award,
  ClipboardCheck,
  History,
  Users,
  ShoppingCart,
  FileCheck,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/lib/hooks/useAuth";

const navConfig = {
  USER: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/browse", label: "Browse Test Series", icon: BookOpen },
    { href: "/my-tests", label: "My Tests", icon: FolderOpen },
    { href: "/attempts", label: "Results", icon: Award },
  ],
  CHECKER: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/review", label: "Check Tests", icon: ClipboardCheck },
    { href: "/review/history", label: "History", icon: History },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/series", label: "Test Series", icon: BookOpen },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/checkers", label: "Checkers", icon: FileCheck },
    { href: "/admin/sales", label: "Sales", icon: ShoppingCart },
    { href: "/admin/review", label: "Review", icon: Settings },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || "USER";
  const items = navConfig[role as keyof typeof navConfig] || navConfig.USER;

  return (
    <aside className="w-64 min-h-screen bg-[#1e3a8a] text-white flex flex-col">
      <div className="p-4 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#f59e0b] rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#1e3a8a]" />
          </div>
          <span className="font-bold text-lg">CA Test Checker</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#f59e0b] text-[#1e3a8a]"
                  : "text-white/90 hover:bg-white/10"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

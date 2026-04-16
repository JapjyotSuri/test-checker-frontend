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
  X,
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
    { href: "/admin/coupons", label: "Coupons", icon: Settings },
    { href: "/admin/review", label: "Review", icon: Settings },
  ],
};

export function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || "USER";
  const items = navConfig[role as keyof typeof navConfig] || navConfig.USER;

  return (
    <aside
      className={clsx(
        "w-64 bg-[#1e3a8a] text-white flex flex-col z-40 transition-transform duration-200",
        "fixed inset-y-0 left-0 transform -translate-x-full",
        open && "translate-x-0",
        "md:static md:translate-x-0 md:min-h-screen"
      )}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#f59e0b] rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#1e3a8a]" />
          </div>
          <span className="font-bold text-lg">Ca Prep Series</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-2 rounded-lg hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
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
              onClick={onClose}
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

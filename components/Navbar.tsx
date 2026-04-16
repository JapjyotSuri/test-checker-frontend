"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks/useAuth";
import { FileText, LayoutDashboard, ClipboardCheck, Users, Settings } from "lucide-react";
import { clsx } from "clsx";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, isAdmin, isChecker } = useAuth();
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: "/tests",
      label: "Tests",
      icon: FileText,
      show: true,
    },
    {
      href: "/attempts",
      label: "My Attempts",
      icon: ClipboardCheck,
      show: !isAdmin,
    },
    {
      href: "/review",
      label: "Review",
      icon: ClipboardCheck,
      show: isChecker,
    },
    {
      href: "/checkers",
      label: "Checkers",
      icon: Users,
      show: isAdmin,
    },
    {
      href: "/admin",
      label: "Admin",
      icon: Settings,
      show: isAdmin,
    },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Ca Prep Series</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-slate-400">
                  {user.first_name || user.email}
                </span>
                <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded text-xs font-medium">
                  {user.role}
                </span>
              </div>
            )}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}


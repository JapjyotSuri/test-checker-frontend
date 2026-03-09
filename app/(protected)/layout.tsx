 "use client";
 
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState } from "react";
import { clsx } from "clsx";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
      <div
        className={clsx(
          "fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />
    </div>
  );
}

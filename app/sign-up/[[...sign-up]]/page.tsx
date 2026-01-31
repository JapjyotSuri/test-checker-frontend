"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] py-8 px-4">
      <div className="w-full max-w-[400px] mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
        <p className="text-sm text-slate-600">
          All new accounts are <strong className="text-amber-800">Students</strong>. You can browse test series, take tests, and view results. An admin can promote you to <strong className="text-[#1e3a8a]">Checker</strong> from the dashboard if needed.
        </p>
        <p className="text-xs text-slate-500 mt-2">
          After sign-up we’ll save your account in our system and take you to the dashboard.
        </p>
      </div>

      <div className="relative w-full max-w-[400px]">
        <SignUp
          forceRedirectUrl="/auth/sync"
          appearance={{
            elements: {
              formButtonPrimary: "bg-[#1e3a8a] hover:bg-[#1e40af]",
              card: "bg-white shadow-lg border border-slate-200",
              headerTitle: "text-slate-800",
              headerSubtitle: "text-slate-600",
              formFieldLabel: "text-slate-700",
              formFieldInput: "bg-white border-slate-300 text-slate-800",
              footerActionLink: "text-[#1e3a8a] hover:text-[#1e40af]",
            },
            variables: {
              colorPrimary: "#1e3a8a",
              colorBackground: "#ffffff",
            },
          }}
        />
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#1e3a8a] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

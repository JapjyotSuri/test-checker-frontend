import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] py-8 px-4">
      <div className="w-full max-w-[400px] mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
        <p className="text-sm text-slate-600">
          Everyone signs up as <strong className="text-amber-800">Student</strong>. An admin can promote you to <strong className="text-[#1e3a8a]">Checker</strong> from the dashboard. Admins are set via the backend (only 2 admins).
        </p>
      </div>

      <div className="relative">
        <SignIn
          forceRedirectUrl="/dashboard"
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
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-[#1e3a8a] font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

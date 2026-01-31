"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { authApi, setAuthToken } from "@/lib/api";
import { Loader2 } from "lucide-react";

/**
 * Page shown right after sign-up. Calls our backend to store the user in the DB, then redirects to dashboard.
 */
export default function AuthSyncPage() {
  const router = useRouter();
  const { getToken } = useClerkAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      try {
        const token = await getToken();
        if (!token) {
          router.replace("/dashboard");
          return;
        }
        setAuthToken(token);
        await authApi.syncUser();
        router.replace("/dashboard");
      } catch (e) {
        console.error("Failed to sync user to backend:", e);
        setError("Could not complete sign-up. Redirecting to dashboard…");
        setTimeout(() => router.replace("/dashboard"), 2000);
      }
    };

    sync();
  }, [getToken, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-[#1e3a8a] animate-spin" />
        <p className="text-slate-700 font-medium">Setting up your account…</p>
        <p className="text-sm text-slate-500">Storing your details in our system</p>
        {error && (
          <p className="text-sm text-amber-600 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}

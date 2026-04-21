"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy Clerk sync page — no longer needed with custom JWT auth.
 * Redirect to dashboard.
 */
export default function AuthSyncPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}

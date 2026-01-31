"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { authApi, setAuthToken } from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/nextjs";

const SIGNUP_ROLE_KEY = "signUpRole";

/**
 * Runs once after redirect from sign-up. If user chose a role at sign-up (stored in localStorage),
 * calls backend to set that role, then clears storage and reloads so sidebar/routes match the role.
 */
export function SignUpRoleHandler() {
  const { refetchUser } = useAuth();
  const { getToken } = useClerkAuth();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current || typeof window === "undefined") return;

    const role = window.localStorage.getItem(SIGNUP_ROLE_KEY) as "USER" | "CHECKER" | "ADMIN" | null;
    if (!role || !["USER", "CHECKER", "ADMIN"].includes(role)) return;

    applied.current = true;

    const apply = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        setAuthToken(token);
        await authApi.setSignupRole(role);
        window.localStorage.removeItem(SIGNUP_ROLE_KEY);
        await refetchUser();
        window.location.reload();
      } catch (e) {
        console.error("Failed to set sign-up role:", e);
        window.localStorage.removeItem(SIGNUP_ROLE_KEY);
      }
    };

    apply();
  }, [getToken, refetchUser]);

  return null;
}

"use client";

import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { setAuthToken, authApi } from "../api";

interface User {
  id: string;
  clerkId: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "USER" | "CHECKER" | "ADMIN";
  is_active: boolean;
}

export function useAuth() {
  const { getToken, isLoaded, isSignedIn } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setUser(null);
        setLoading(false);
        hasFetched.current = false;
        return;
      }

      // Prevent duplicate fetches
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        
        setAuthToken(token);
        const response = await authApi.getMe();
        setUser(response.data.user);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch user from backend:", err?.message || err);
        setError(err?.response?.data?.error || "Failed to connect to backend");
        // Still allow the app to function with Clerk user data
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoaded, isSignedIn, getToken]);

  // Reset fetch flag when sign-in state changes
  useEffect(() => {
    if (!isSignedIn) {
      hasFetched.current = false;
    }
  }, [isSignedIn]);

  return {
    user,
    clerkUser,
    isLoaded,
    isSignedIn,
    loading,
    error,
    isAdmin: user?.role === "ADMIN",
    isChecker: user?.role === "CHECKER" || user?.role === "ADMIN",
    isUser: user?.role === "USER",
    // Fallback to Clerk data if backend fails
    displayName: user?.first_name || clerkUser?.firstName || clerkUser?.emailAddresses?.[0]?.emailAddress || "User",
  };
}

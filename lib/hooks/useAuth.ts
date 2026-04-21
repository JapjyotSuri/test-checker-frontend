"use client";

/**
 * useAuth — thin wrapper around AuthContext.
 * Keeps the same API surface as the old Clerk-based hook so all existing
 * pages continue to work without changes.
 */
export { useAuthContext as useAuth } from "@/lib/context/AuthContext";

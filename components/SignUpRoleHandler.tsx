"use client";

/**
 * Legacy Clerk sign-up role handler — no longer needed with custom JWT auth.
 * New users are created as USER role by default via the OTP verify endpoint.
 * Admins can promote users to CHECKER from the admin dashboard.
 */
export function SignUpRoleHandler() {
  return null;
}

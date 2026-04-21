"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { api, setAuthToken, authApi } from "@/lib/api";
import { tokenStorage } from "@/lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "USER" | "CHECKER" | "ADMIN";
  is_active: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  isAdmin: boolean;
  isChecker: boolean;
  isUser: boolean;
  displayName: string;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns the new access token or null on failure.
 */
async function refreshAccessToken(isLoggingOut?: React.MutableRefObject<boolean>): Promise<string | null> {
  // Don't refresh if we're in the middle of logging out
  if (isLoggingOut?.current) {
    console.log('Refresh blocked: logout in progress');
    return null;
  }
  
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    console.log('No refresh token available');
    return null;
  }

  console.log('Attempting token refresh');
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }
    );
    if (!res.ok) {
      console.log('Token refresh failed:', res.status);
      return null;
    }
    const data = await res.json();
    tokenStorage.setAccessToken(data.accessToken);
    console.log('Token refresh successful');
    return data.accessToken;
  } catch (error) {
    console.log('Token refresh error:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const initialized = useRef(false);
  const isLoggingOut = useRef(false);

  const login = useCallback((accessToken: string, refreshToken: string, userData: AuthUser) => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
    setAuthToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    console.log('Logout initiated');
    // Set logout flag to prevent any refresh attempts
    isLoggingOut.current = true;
    
    // First, clear the user state to prevent any race conditions
    setUser(null);
    setAuthToken(null);
    
    const refreshToken = tokenStorage.getRefreshToken();
    
    // Clear tokens immediately to prevent any refresh attempts
    tokenStorage.clear();
    console.log('Tokens cleared');
    
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
        console.log('Server logout successful');
      }
    } catch (error) {
      console.log('Server logout error (ignored):', error);
    }
    
    // Reset logout flag after a short delay
    setTimeout(() => {
      isLoggingOut.current = false;
      console.log('Logout flag reset');
    }, 1000);
  }, []);

  const refetchUser = useCallback(async () => {
    // Don't refetch if we're logging out
    if (isLoggingOut.current) return;
    
    try {
      const res = await authApi.getMe();
      setUser(res.data.user);
      setError(null);
    } catch {
      // token may have expired — try refresh
      const newToken = await refreshAccessToken(isLoggingOut);
      if (newToken && !isLoggingOut.current) {
        setAuthToken(newToken);
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  }, []);

  // On mount: restore session from stored tokens
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      // Don't initialize if we're logging out
      if (isLoggingOut.current) {
        setLoading(false);
        setIsLoaded(true);
        return;
      }

      const accessToken = tokenStorage.getAccessToken();

      if (!accessToken) {
        // Try refresh token only if we're not logging out
        if (!isLoggingOut.current) {
          const newToken = await refreshAccessToken(isLoggingOut);
          if (newToken && !isLoggingOut.current) {
            setAuthToken(newToken);
            try {
              const res = await authApi.getMe();
              setUser(res.data.user);
            } catch {
              tokenStorage.clear();
            }
          }
        }
        setLoading(false);
        setIsLoaded(true);
        return;
      }

      setAuthToken(accessToken);
      try {
        const res = await authApi.getMe();
        setUser(res.data.user);
        setError(null);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { code?: string } } };
        if (e?.response?.data?.code === 'TOKEN_EXPIRED') {
          // Try to refresh only if we're not logging out
          if (!isLoggingOut.current) {
            const newToken = await refreshAccessToken(isLoggingOut);
            if (newToken && !isLoggingOut.current) {
              setAuthToken(newToken);
              try {
                const res = await authApi.getMe();
                setUser(res.data.user);
              } catch {
                tokenStorage.clear();
                setAuthToken(null);
              }
            } else {
              tokenStorage.clear();
              setAuthToken(null);
            }
          } else {
            tokenStorage.clear();
            setAuthToken(null);
          }
        } else {
          tokenStorage.clear();
          setAuthToken(null);
        }
      }

      setLoading(false);
      setIsLoaded(true);
    };

    init();
  }, []);

  // Axios interceptor: auto-refresh on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          error.response?.data?.code === 'TOKEN_EXPIRED' &&
          !originalRequest._retry &&
          !isLoggingOut.current
        ) {
          originalRequest._retry = true;
          const newToken = await refreshAccessToken(isLoggingOut);
          if (newToken) {
            setAuthToken(newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            tokenStorage.clear();
            setAuthToken(null);
            setUser(null);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    isSignedIn: !!user,
    isLoaded,
    isAdmin: user?.role === "ADMIN",
    isChecker: user?.role === "CHECKER" || user?.role === "ADMIN",
    isUser: user?.role === "USER",
    displayName: user?.first_name || user?.email?.split("@")[0] || "User",
    login,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

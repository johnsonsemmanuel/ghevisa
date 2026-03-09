"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { fetchCsrfCookie } from "./api";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyMfa: (email: string, otp: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  locale?: "en" | "fr";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await fetchCsrfCookie();
    const res = await api.post("/auth/login", { email, password });

    // If MFA is required, throw a structured error the UI can handle
    if (res.data.requires_mfa) {
      const err = new Error("MFA_REQUIRED") as Error & { mfaEmail: string; devOtp?: string };
      err.mfaEmail = res.data.email;
      if (res.data.dev_otp) {
        err.devOtp = res.data.dev_otp;
      }
      throw err;
    }

    const { user: u, token: t } = res.data;
    setUser(u);
    setToken(t);
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
  }, []);

  const verifyMfa = useCallback(async (email: string, otp: string) => {
    await fetchCsrfCookie();
    const res = await api.post("/auth/verify-mfa", { email, token: otp });
    const { user: u, token: t } = res.data;
    setUser(u);
    setToken(t);
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await fetchCsrfCookie();
    const res = await api.post("/auth/register", data);
    // Don't auto-login since email verification is required
    // The response will include user data but no token
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        verifyMfa,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

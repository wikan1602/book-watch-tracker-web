"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as api from "@/lib/api";

type AuthContextValue = {
  user: api.User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  // Lazy-initialized from localStorage directly so the "no stored token"
  // case never needs a synchronous setState from inside the effect below
  // — only true when there's a token to actually go validate.
  const [loading, setLoading] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem(api.TOKEN_KEY),
  );

  useEffect(() => {
    const token = localStorage.getItem(api.TOKEN_KEY);
    if (!token) return;
    api
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(api.TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const applyAuth = useCallback((res: api.AuthResponse) => {
    localStorage.setItem(api.TOKEN_KEY, res.token);
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      applyAuth(await api.login(email, password));
    },
    [applyAuth],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      applyAuth(await api.register(email, password));
    },
    [applyAuth],
  );

  const loginWithToken = useCallback(async (token: string) => {
    localStorage.setItem(api.TOKEN_KEY, token);
    setUser(await api.getMe());
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(api.TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithToken, logout }}
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

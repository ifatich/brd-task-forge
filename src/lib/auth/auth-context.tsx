"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAdminRole: () => void;
  clearAdminRole: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("brd_auth_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      }
      // Check for admin auth intersection
      const adminAuth = localStorage.getItem("brd-admin-auth");
      if (adminAuth === "authenticated" && saved) {
        const parsed = JSON.parse(saved);
        setUser({ ...parsed, role: "admin" });
      }
    } catch { }
    setIsLoading(false);
  }, []);

  const setAdminRole = useCallback(() => {
    setUser((prev) => {
      if (!prev) {
        const adminUser: User = {
          id: "admin-001",
          name: "Administrator",
          email: "admin@brdforge.app",
          role: "admin",
        };
        localStorage.setItem("brd_auth_user", JSON.stringify(adminUser));
        return adminUser;
      }
      const updated = { ...prev, role: "admin" as const };
      localStorage.setItem("brd_auth_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAdminRole = useCallback(() => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, role: "user" as const };
      localStorage.setItem("brd_auth_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.user) {
        const userData = { ...data.user, role: "user" as const };
        setUser(userData);
        localStorage.setItem("brd_auth_user", JSON.stringify(userData));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.user) {
        const userData = { ...data.user, role: "user" as const };
        setUser(userData);
        localStorage.setItem("brd_auth_user", JSON.stringify(userData));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem("brd_auth_user");
      localStorage.removeItem("brd-admin-auth");
    } catch { }
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user, isAdmin, setAdminRole, clearAdminRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

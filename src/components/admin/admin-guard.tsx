"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const { setAdminRole, clearAdminRole } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("brd-admin-auth");
    if (stored === "authenticated") {
      setAdminRole();
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [setAdminRole]);

  const handleLogin = () => {
    if (password === "admin123") {
      localStorage.setItem("brd-admin-auth", "authenticated");
      setAdminRole();
      setIsAdmin(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("brd-admin-auth");
    clearAdminRole();
    setIsAdmin(false);
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-6 space-y-5">
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">Akses Admin</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Masukkan password admin untuk mengakses dashboard.
            </p>
          </div>

          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Password Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Masukkan password..."
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={!password}
            className="w-full rounded-lg bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Masuk
          </button>

          <div className="text-center">
            <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors underline underline-offset-2">
              Kembali ke Dasbor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Admin badge bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-1.5 bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-700 text-white text-[10px]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-[9px] font-medium text-green-300">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
            Admin Mode
          </span>
          <span className="text-zinc-400">Anda memiliki akses penuh</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
        >
          Keluar
        </button>
      </div>
      {children}
    </div>
  );
}

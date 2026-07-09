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
        <div className="animate-spin h-6 w-6 border-2 border-hairline border-t-ink rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-sm rounded-[24px] border border-hairline bg-canvas p-6 space-y-5">
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink/60">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="font-semibold text-base text-ink ">Akses Admin</h2>
            <p className="text-xs text-ink/60 mt-1">
              Masukkan password admin untuk mengakses dashboard.
            </p>
          </div>

          <div>
            <label className="text-xs text-ink/60 block mb-1">Password Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Masukkan password..."
              className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink :ring-white"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={!password}
            className="w-full rounded-full bg-ink px-4 py-2 text-sm font-medium text-canvas hover:bg-ink/80 :bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Masuk
          </button>

          <div className="text-center">
            <Link href="/" className="text-xs text-ink/40 hover:text-ink/60 :text-zinc-300 transition-colors underline underline-offset-2">
              Kembali ke Dasbor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Admin badge bar — sits above the page navbar */}
      <div className="sticky top-0 z-[60] h-8 flex items-center justify-between px-4 bg-ink text-canvas text-[10px]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-[9px] font-medium text-green-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
            Admin Mode
          </span>
          <span className="text-canvas/60">Anda memiliki akses penuh</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-canvas/60 hover:text-canvas transition-colors underline underline-offset-2"
        >
          Keluar
        </button>
      </div>
      {children}
    </div>
  );
}

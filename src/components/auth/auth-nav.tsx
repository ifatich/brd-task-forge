"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export function AuthNav() {
  const { user, logout, isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) return <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="btn-primary-gradient px-4 py-1.5 rounded-lg text-sm font-medium text-white"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[10px] font-semibold text-amber-400 tracking-wide">
          ✦ ADMIN
        </span>
      )}
      <div className="flex items-center gap-2">
        {/* Avatar circle */}
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
          {user?.name}
        </span>
      </div>
      <button
        onClick={logout}
        className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
      >
        Sign Out
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export function AuthNav() {
  const { user, logout, isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) return <div className="h-8 w-20 rounded-lg bg-black/5 animate-pulse" />;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3.5 py-1.5 text-sm font-medium text-ink/60 hover:text-ink transition-colors rounded-lg hover:bg-black/5"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-canvas hover:bg-ink/80 transition-colors"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <span className="inline-flex items-center rounded-full border border-hairline bg-surface-soft px-2.5 py-1 text-[10px] font-semibold text-ink tracking-wide">
          ✦ ADMIN
        </span>
      )}
      <div className="flex items-center gap-2">
        {/* Avatar circle — monochrome */}
        <div className="h-7 w-7 rounded-full bg-ink flex items-center justify-center text-[11px] font-bold text-canvas shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <span className="text-xs text-ink/60 hidden sm:inline font-medium">
          {user?.name}
        </span>
      </div>
      <button
        onClick={logout}
        className="px-3 py-1.5 text-xs font-medium text-ink/60 hover:text-ink transition-colors rounded-lg hover:bg-black/5"
      >
        Sign Out
      </button>
    </div>
  );
}


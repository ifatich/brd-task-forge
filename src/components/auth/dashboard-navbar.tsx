"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { AuthNav } from "./auth-nav";

export function DashboardNavbar() {
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 nav-glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand + Nav */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
                <span className="relative text-white text-sm font-bold">B</span>
              </div>
              <span className="font-semibold text-base text-foreground hidden sm:inline tracking-tight">
                BRD Task Forge
              </span>
            </a>

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink href="/" label="Dashboard" />
              <NavLink href="/upload" label="Upload BRD" />
              {isAdmin && <NavLink href="/admin" label="Admin" isAdmin />}
            </nav>
          </div>

          <AuthNav />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  isAdmin = false,
}: {
  href: string;
  label: string;
  isAdmin?: boolean;
}) {
  const isActive =
    typeof window !== "undefined" && window.location.pathname === href;

  return (
    <a
      href={href}
      className={`
        relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
        ${
          isAdmin
            ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }
      `}
    >
      {label}
      {isAdmin && (
        <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/30">
          ADMIN
        </span>
      )}
    </a>
  );
}

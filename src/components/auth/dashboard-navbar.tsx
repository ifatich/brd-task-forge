"use client";

import Link from "next/link";
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
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-[24px] overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-ink" />
                <span className="relative text-canvas text-sm font-bold">B</span>
              </div>
              <span className="font-semibold text-base text-ink hidden sm:inline tracking-tight">
                BRD Task Forge
              </span>
            </Link>

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
        relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors
        ${isAdmin
          ? "text-ink/60 hover:text-ink hover:bg-black/5"
          : "text-ink/60 hover:text-ink hover:bg-black/5"
        }
      `}
    >
      {label}
      {isAdmin && (
        <span className="ml-1.5 inline-flex items-center rounded-full bg-black/5 px-1.5 py-0.5 text-[9px] font-semibold text-ink/60 border border-hairline">
          ADMIN
        </span>
      )}
    </a>
  );
}

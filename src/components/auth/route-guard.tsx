"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

const PUBLIC_ROUTES = ["/login", "/reset-password"];
const ADMIN_ROUTES = ["/admin"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
    const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

    // Not logged in → redirect to login (unless already on a public route)
    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
      return;
    }

    // Non-admin trying to access admin route
    if (isAdminRoute && !isAdmin) {
      router.replace("/");
      return;
    }

    // Logged-in user trying to access login → redirect to dashboard
    if (isAuthenticated && pathname === "/login") {
      router.replace("/");
      return;
    }
  }, [isAuthenticated, isLoading, isAdmin, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Block rendering on protected routes when not authenticated
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (!isAuthenticated && !isPublic) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAdminRoute && !isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Logged-in user on public routes → redirect to dashboard
  if (isAuthenticated && pathname === "/login") {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}

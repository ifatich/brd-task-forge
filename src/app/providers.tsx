"use client";

import { AuthProvider } from "@/lib/auth/auth-context";
import { RouteGuard } from "@/components/auth/route-guard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RouteGuard>{children}</RouteGuard>
    </AuthProvider>
  );
}

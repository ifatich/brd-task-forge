import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_API_PREFIX = "/api/admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

/**
 * Middleware untuk otorisasi route admin.
 * 
 * - Untuk read (GET): izinkan akses dari origin yang sama (browser admin)
 * - Untuk write (POST/PATCH/DELETE): wajib header "x-admin-key"
 * - Jika tidak valid, mengembalikan 401 Unauthorized
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /api/admin/* routes
  if (!pathname.startsWith(ADMIN_API_PREFIX)) {
    return NextResponse.next();
  }

  // OPTIONS requests (CORS preflight) are always allowed
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  // Read operations (GET) — allow from same origin (browser admin page)
  if (request.method === "GET") {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const isSameOrigin = origin
      ? origin === request.nextUrl.origin
      : referer?.startsWith(request.nextUrl.origin + "/");
    
    if (isSameOrigin) {
      return NextResponse.next();
    }
    
    // External GET still requires key
    const adminKey = request.headers.get("x-admin-key");
    if (!adminKey || adminKey !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized: admin key required" },
        { status: 401 }
      );
    }
  }

  // Write operations (POST, PATCH, DELETE, etc.) — require x-admin-key
  const adminKey = request.headers.get("x-admin-key");
  if (!adminKey || adminKey !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Unauthorized: admin key required" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/admin/:path*",
};

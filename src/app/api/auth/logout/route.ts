import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Logout endpoint — client-side handles clearing localStorage.
 * Added for API completeness and future server-side session support.
 */
export async function POST() {
  return NextResponse.json({ success: true });
}

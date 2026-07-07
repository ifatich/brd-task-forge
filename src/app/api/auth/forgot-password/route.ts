import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Generates a reset token and stores it in the database (via SystemConfig).
 * In production, this would send an email. For now, returns the token directly.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return NextResponse.json({ success: true, message: "Jika email terdaftar, tautan reset akan dikirim." });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token
    await prisma.systemConfig.upsert({
      where: { key: `reset_token_${user.id}` },
      update: { value: JSON.stringify({ token, expiresAt: expiresAt.toISOString() }) },
      create: { key: `reset_token_${user.id}`, value: JSON.stringify({ token, expiresAt: expiresAt.toISOString() }) },
    });

    // In production: send email with reset link
    // For development: return token directly
    console.log(`Reset token for ${email}: ${token}`);

    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, tautan reset akan dikirim.",
      ...(process.env.NODE_ENV === "development" ? { token } : {}),
    });
  } catch (error) {
    console.error("Forgot password failed:", error);
    return NextResponse.json({ error: "Gagal memproses permintaan" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * POST /api/auth/reset-password
 * Body: { email, token, newPassword }
 * Validates reset token and updates password.
 */
export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Token tidak valid atau sudah kadaluarsa" }, { status: 400 });
    }

    // Get stored token
    const stored = await prisma.systemConfig.findUnique({
      where: { key: `reset_token_${user.id}` },
    });

    if (!stored) {
      return NextResponse.json({ error: "Token tidak valid atau sudah kadaluarsa" }, { status: 400 });
    }

    const { token: storedToken, expiresAt } = JSON.parse(stored.value);

    if (token !== storedToken) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
    }

    if (new Date(expiresAt) < new Date()) {
      await prisma.systemConfig.delete({ where: { key: `reset_token_${user.id}` } });
      return NextResponse.json({ error: "Token sudah kadaluarsa" }, { status: 400 });
    }

    // Hash new password
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto
      .pbkdf2Sync(newPassword, salt, 1000, 64, "sha512")
      .toString("hex");

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: `${salt}:${passwordHash}` },
    });

    // Clean up token
    await prisma.systemConfig.delete({ where: { key: `reset_token_${user.id}` } });

    return NextResponse.json({ success: true, message: "Password berhasil direset" });
  } catch (error) {
    console.error("Reset password failed:", error);
    return NextResponse.json({ error: "Gagal mereset password" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * POST /api/auth/login
 * Body: { email, password }
 * 
 * Authenticates a user and returns user data.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Verify password
    const [salt, storedHash] = user.passwordHash.split(":");
    if (!salt || !storedHash) {
      return NextResponse.json({ error: "Akun tidak valid" }, { status: 401 });
    }

    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");

    if (hash !== storedHash) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Gagal masuk" }, { status: 500 });
  }
}

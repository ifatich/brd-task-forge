import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/api-keys
 * Returns all API keys (masked for security).
 */
export async function GET() {
  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Mask keys for security (show only last 4 chars)
    const masked = keys.map((k) => ({
      ...k,
      keyValue: k.keyValue.length > 8
        ? `${k.keyValue.slice(0, 4)}${"*".repeat(k.keyValue.length - 8)}${k.keyValue.slice(-4)}`
        : k.keyValue,
    }));

    return NextResponse.json(masked);
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

/**
 * POST /api/admin/api-keys
 * Body: { provider, label, keyValue, baseUrl?, active? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.provider || !body.keyValue) {
      return NextResponse.json({ error: "Provider and keyValue are required" }, { status: 400 });
    }

    const isActive = body.active !== false;

    const key = await prisma.apiKey.create({
      data: {
        provider: body.provider,
        label: body.label || body.provider,
        keyValue: body.keyValue,
        baseUrl: body.baseUrl || "",
        model: body.model || "",
        active: isActive,
      },
    });

    // If new key is active, deactivate all other keys
    if (isActive) {
      await prisma.apiKey.updateMany({
        where: { id: { not: key.id }, active: true },
        data: { active: false },
      });
    }

    return NextResponse.json({
      ...key,
      keyValue: key.keyValue.length > 8
        ? `${key.keyValue.slice(0, 4)}${"*".repeat(key.keyValue.length - 8)}${key.keyValue.slice(-4)}`
        : key.keyValue,
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create API key:", error);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * GET /api/invitations
 * Query params: projectId, status, email
 */
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId");
    const status = request.nextUrl.searchParams.get("status");
    const email = request.nextUrl.searchParams.get("email");

    const where: Record<string, any> = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (email) where.email = email;

    const invitations = await prisma.invitation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
}

/**
 * POST /api/invitations
 * Body: { email: string, projectId?: string, role?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate token and expiry (7 days)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        email: body.email,
        projectId: body.projectId || null,
        role: body.role || "member",
        token,
        expiresAt,
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Failed to create invitation:", error);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}

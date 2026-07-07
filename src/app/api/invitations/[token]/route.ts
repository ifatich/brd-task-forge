import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/invitations/[token]
 * Verify an invitation by token.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });
    }
    if (invitation.status !== "pending") {
      return NextResponse.json({ error: `Undangan sudah ${invitation.status}` }, { status: 400 });
    }
    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({ where: { token }, data: { status: "expired" } });
      return NextResponse.json({ error: "Undangan sudah kedaluwarsa" }, { status: 400 });
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Failed to verify invitation:", error);
    return NextResponse.json({ error: "Failed to verify invitation" }, { status: 500 });
  }
}

/**
 * PATCH /api/invitations/[token]
 * Body: { action: "accept" | "decline", name?: string }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const body = await request.json();
    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });
    }
    if (invitation.status !== "pending") {
      return NextResponse.json({ error: `Undangan sudah ${invitation.status}` }, { status: 400 });
    }
    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({ where: { token }, data: { status: "expired" } });
      return NextResponse.json({ error: "Undangan sudah kedaluwarsa" }, { status: 400 });
    }

    if (body.action === "accept") {
      // Create team member
      await prisma.teamMember.create({
        data: {
          id: `member-${Date.now()}`,
          name: body.name || invitation.email.split("@")[0],
          email: invitation.email,
          role: invitation.role,
        },
      });

      await prisma.invitation.update({
        where: { token },
        data: { status: "accepted" },
      });

      return NextResponse.json({ success: true, message: "Undangan diterima" });
    }

    if (body.action === "decline") {
      await prisma.invitation.update({
        where: { token },
        data: { status: "declined" },
      });
      return NextResponse.json({ success: true, message: "Undangan ditolak" });
    }

    return NextResponse.json({ error: "Action must be 'accept' or 'decline'" }, { status: 400 });
  } catch (error) {
    console.error("Failed to process invitation:", error);
    return NextResponse.json({ error: "Failed to process invitation" }, { status: 500 });
  }
}

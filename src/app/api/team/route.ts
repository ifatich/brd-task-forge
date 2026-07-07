import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/team
 * Returns all team members with task counts.
 */
export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

/**
 * POST /api/team
 * Body: { name: string, avatar?: string, role?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const member = await prisma.teamMember.create({
      data: {
        // Use name-based ID for simplicity (can be changed to cuid later)
        id: body.id || `member-${Date.now()}`,
        name: body.name,
        avatar: body.avatar || "",
        role: body.role || "",
        email: body.email || "",
      },
    });

    if (body.email && body.password) {
      // Upsert User for authentication
      await prisma.user.upsert({
        where: { email: body.email },
        update: { passwordHash: body.password },
        create: {
          email: body.email,
          passwordHash: body.password,
          name: body.name,
        }
      });
    }

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Failed to create team member:", error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/team/[id]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const member = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { id: true, title: true, status: true, projectId: true } },
      },
    });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to fetch member:", error);
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}

/**
 * PATCH /api/team/[id]
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name: body.name,
        avatar: body.avatar,
        role: body.role,
      },
    });
    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to update member:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

/**
 * DELETE /api/team/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Unassign all tasks before deleting
    await prisma.task.updateMany({
      where: { assigneeId: id },
      data: { assigneeId: null },
    });
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete member:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}

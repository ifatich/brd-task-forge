import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/projects/[id]/team
 * Returns team members who are assigned to tasks in this project,
 * along with their task counts per status.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Get members who have tasks in this project
    const members = await prisma.teamMember.findMany({
      where: {
        tasks: {
          some: { projectId: id },
        },
      },
      include: {
        tasks: {
          where: { projectId: id },
          select: { id: true, title: true, status: true },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Enrich with stats
    const enriched = members.map((m) => {
      const total = m.tasks.length;
      const done = m.tasks.filter((t) => t.status === "done").length;
      const inProgress = m.tasks.filter((t) => t.status === "in-progress").length;
      const todo = m.tasks.filter((t) => t.status === "todo").length;

      return {
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        role: m.role,
        taskCount: total,
        taskStats: { total, done, inProgress, todo },
        tasks: m.tasks,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Failed to fetch project team:", error);
    return NextResponse.json({ error: "Failed to fetch project team" }, { status: 500 });
  }
}

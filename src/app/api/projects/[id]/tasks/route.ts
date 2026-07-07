import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects/[id]/tasks
 * Returns tasks with sub-tasks for the kanban board.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: id },
      include: { subTasks: { orderBy: { order: "asc" }, include: { assigneeMember: true } }, assigneeMember: true },
      orderBy: { order: "asc" },
    });

    const summary = {
      total: tasks.length,
      done: tasks.filter((t) => t.status === "done").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      todo: tasks.filter((t) => t.status === "todo").length,
    };

    return NextResponse.json({ tasks, summary });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

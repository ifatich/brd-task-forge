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
      where: { projectId: id, status: { not: "archived" } },
      include: { subTasks: { orderBy: { order: "asc" }, include: { assigneeMember: true } }, assignees: true },
      orderBy: { order: "asc" },
    });

    const parsedTasks = tasks.map((t) => {
      let sprints = [];
      try { sprints = JSON.parse(t.sprints); } catch(e) {}
      return { ...t, sprints };
    });

    const summary = {
      total: parsedTasks.length,
      done: parsedTasks.filter((t) => t.status === "done").length,
      inProgress: parsedTasks.filter((t) => t.status === "in-progress").length,
      todo: parsedTasks.filter((t) => t.status === "todo").length,
    };

    return NextResponse.json({ tasks: parsedTasks, summary });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

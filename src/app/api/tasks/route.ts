import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/tasks
 * Query params: projectId (optional) — filter by project
 * Returns all tasks with sub-tasks, ordered by project then by order.
 */
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId");

    const where: Record<string, any> = {};
    if (projectId) where.projectId = projectId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        subTasks: { orderBy: { order: "asc" }, include: { assigneeMember: true } },
        project: { select: { id: true, title: true } },
        assigneeMember: true,
      },
      orderBy: [{ projectId: "asc" }, { order: "asc" }],
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let assigneeName = body.assignee || null;
    let assigneeId = body.assigneeId || null;

    // Resolve name from assigneeId if name not provided
    if (assigneeId && !assigneeName) {
      const member = await prisma.teamMember.findUnique({ where: { id: assigneeId } });
      if (member) assigneeName = member.name;
    }

    const task = await prisma.task.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        description: body.description || "",
        goals: JSON.stringify(body.goals || []),
        definitionOfDone: body.definitionOfDone || "",
        status: body.status || "todo",
        priority: body.priority || "medium",
        assignee: assigneeName,
        assigneeId,
        order: body.order ?? 0,
      },
      include: { subTasks: true, assigneeMember: true },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Anggota tim tidak ditemukan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

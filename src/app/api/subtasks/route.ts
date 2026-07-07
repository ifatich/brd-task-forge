import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/subtasks
 * Body: { taskId, title, description, goals, definitionOfDone, elements, order }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.taskId || !body.title) {
      return NextResponse.json({ error: "taskId and title are required" }, { status: 400 });
    }

    // Get current max order for this task
    const maxOrder = await prisma.subTask.aggregate({
      where: { taskId: body.taskId },
      _max: { order: true },
    });

    const subTask = await prisma.subTask.create({
      data: {
        taskId: body.taskId,
        title: body.title,
        description: body.description || "",
        goals: JSON.stringify(body.goals || []),
        definitionOfDone: body.definitionOfDone || "",
        elements: JSON.stringify(body.elements || []),
        done: false,
        order: body.order ?? (maxOrder._max.order ?? -1) + 1,
      },
      include: { assigneeMember: true },
    });

    return NextResponse.json(subTask, { status: 201 });
  } catch (error) {
    console.error("Failed to create sub-task:", error);
    return NextResponse.json({ error: "Failed to create sub-task" }, { status: 500 });
  }
}

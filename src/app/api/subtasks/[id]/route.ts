import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/subtasks/[id]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const subTask = await prisma.subTask.findUnique({
      where: { id },
      include: { task: { select: { id: true, title: true, projectId: true } } },
    });
    if (!subTask) {
      return NextResponse.json({ error: "Sub-task not found" }, { status: 404 });
    }
    return NextResponse.json(subTask);
  } catch (error) {
    console.error("Failed to fetch sub-task:", error);
    return NextResponse.json({ error: "Failed to fetch sub-task" }, { status: 500 });
  }
}

/**
 * PATCH /api/subtasks/[id]
 * Update sub-task fields (done, title, description, goals, DoD, elements, order)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    const data: Record<string, any> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.goals !== undefined) data.goals = JSON.stringify(body.goals);
    if (body.definitionOfDone !== undefined) data.definitionOfDone = body.definitionOfDone;
    if (body.elements !== undefined) data.elements = JSON.stringify(body.elements);
    if (body.done !== undefined) data.done = body.done;
    if (body.order !== undefined) data.order = body.order;
    if (body.assignee !== undefined) data.assignee = body.assignee;
    if (body.assigneeId !== undefined) {
      if (body.assigneeId) {
        const member = await prisma.teamMember.findUnique({ where: { id: body.assigneeId } });
        if (member) data.assignee = member.name;
      } else {
        data.assignee = null;
      }
      data.assigneeId = body.assigneeId;
    }

    const subTask = await prisma.subTask.update({
      where: { id },
      data,
      include: { assigneeMember: true },
    });

    // Auto-update parent task status
    if (body.done !== undefined) {
      const allSubTasks = await prisma.subTask.findMany({ where: { taskId: subTask.taskId } });
      const allDone = allSubTasks.every((st) => st.done);
      const anyDone = allSubTasks.some((st) => st.done);
      const newStatus = allDone ? "done" : anyDone ? "in-progress" : "todo";
      await prisma.task.update({
        where: { id: subTask.taskId },
        data: { status: newStatus },
      });
    }

    return NextResponse.json(subTask);
  } catch (error) {
    console.error("Failed to update sub-task:", error);
    return NextResponse.json({ error: "Failed to update sub-task" }, { status: 500 });
  }
}

/**
 * DELETE /api/subtasks/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.subTask.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete sub-task:", error);
    return NextResponse.json({ error: "Failed to delete sub-task" }, { status: 500 });
  }
}

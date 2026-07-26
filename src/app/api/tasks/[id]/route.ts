import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/tasks/[id]
 * Update task fields OR perform actions:
 * - { action: "toggle-sub-task", subTaskId: "..." } — toggle sub-task done
 * - { action: "complete" } — mark all sub-tasks done, set task to done
 * - { title, description, status, priority, etc. } — direct field update
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    // ── Action: toggle sub-task ──
    if (body.action === "toggle-sub-task" && body.subTaskId) {
      // Toggle the sub-task
      const subTask = await prisma.subTask.findUnique({ where: { id: body.subTaskId } });
      if (!subTask) {
        return NextResponse.json({ error: "Sub-task not found" }, { status: 404 });
      }

      await prisma.subTask.update({
        where: { id: body.subTaskId },
        data: { done: !subTask.done },
      });

      // Recalculate task status based on sub-tasks
      const allSubTasks = await prisma.subTask.findMany({ where: { taskId: id } });
      const allDone = allSubTasks.every((st) => st.done);
      const anyDone = allSubTasks.some((st) => st.done);

      const newStatus = allDone ? "done" : anyDone ? "in-progress" : "todo";
      const task = await prisma.task.update({
        where: { id },
        data: { status: newStatus },
        include: { subTasks: { orderBy: { order: "asc" }, include: { assigneeMember: true } }, assignees: true },
      });

      // Log sub-task toggle
      logActivity(task.projectId, "subtask_toggled", `Sub-task "${subTask.title}" dalam "${task.title}" diubah statusnya`);

      return NextResponse.json(task);
    }

    // ── Action: complete (force done) ──
    if (body.action === "complete") {
      const taskBefore = await prisma.task.findUnique({ where: { id }, include: { subTasks: true } });
      await prisma.subTask.updateMany({
        where: { taskId: id },
        data: { done: true },
      });

      const task = await prisma.task.update({
        where: { id },
        data: { status: "done" },
        include: { subTasks: { orderBy: { order: "asc" }, include: { assigneeMember: true } }, assignees: true },
      });

      // Log completion
      logActivity(task.projectId, "task_completed", `Task "${task.title}" selesai`);
      for (const st of taskBefore?.subTasks || []) {
        if (!st.done) {
          logActivity(task.projectId, "subtask_auto_completed", `Sub-task "${st.title}" otomatis selesai`);
        }
      }

      return NextResponse.json(task);
    }

    // ── Direct field update ──
    const data: Record<string, any> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.status !== undefined) data.status = body.status;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.assignee !== undefined) data.assignee = body.assignee;
    if (body.assignees !== undefined) {
      data.assignees = body.assignees;
    }
    if (body.order !== undefined) data.order = body.order;
    if (body.goals !== undefined) data.goals = JSON.stringify(body.goals);
    if (body.definitionOfDone !== undefined) data.definitionOfDone = body.definitionOfDone;

    const task = await prisma.task.update({
      where: { id },
      data,
        include: { subTasks: { orderBy: { order: "asc" }, include: { assigneeMember: true } }, assignees: true },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

// ── Helper: log project activity ──
async function logActivity(projectId: string, action: string, detail: string) {
  try {
    await prisma.projectLog.create({ data: { projectId, action, detail } });
  } catch {
    // best-effort
  }
}

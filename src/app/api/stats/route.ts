import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/stats
 * Query params: projectId (optional) — filter stats for a specific project
 * 
 * Returns comprehensive progress statistics including task/sub-task/element counts.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const projectFilter = projectId ? { projectId } : {};

    // ── Task stats ──
    const tasks = await prisma.task.findMany({
      where: projectFilter,
      include: {
        subTasks: { select: { id: true, done: true, elements: true } },
        project: { select: { id: true, title: true } },
      },
    });

    // ── Per-project aggregation ──
    const projectMap = new Map<string, {
      project: { id: string; title: string };
      tasks: {
        total: number;
        done: number;
        inProgress: number;
        todo: number;
      };
      subTasks: {
        total: number;
        done: number;
      };
      elements: {
        total: number;
      };
      progress: number;
    }>();

    for (const task of tasks) {
      const pid = task.projectId;
      if (!projectMap.has(pid)) {
        projectMap.set(pid, {
          project: task.project,
          tasks: { total: 0, done: 0, inProgress: 0, todo: 0 },
          subTasks: { total: 0, done: 0 },
          elements: { total: 0 },
          progress: 0,
        });
      }

      const stat = projectMap.get(pid)!;
      stat.tasks.total++;
      if (task.status === "done") stat.tasks.done++;
      else if (task.status === "in-progress") stat.tasks.inProgress++;
      else stat.tasks.todo++;

      for (const st of task.subTasks) {
        stat.subTasks.total++;
        if (st.done) stat.subTasks.done++;
        try {
          const elems = JSON.parse(st.elements || "[]");
          stat.elements.total += Array.isArray(elems) ? elems.length : 0;
        } catch {
          // ignore parse errors
        }
      }

      stat.progress = stat.tasks.total > 0
        ? Math.round((stat.tasks.done / stat.tasks.total) * 100)
        : 0;
    }

    // ── Overall summary ──
    const allTasks = tasks.length;
    const allDone = tasks.filter((t) => t.status === "done").length;
    const allInProgress = tasks.filter((t) => t.status === "in-progress").length;
    const allTodo = tasks.filter((t) => t.status === "todo").length;

    const allSubTasks = tasks.flatMap((t) => t.subTasks);
    const allSubDone = allSubTasks.filter((st) => st.done).length;

    let allElements = 0;
    for (const st of allSubTasks) {
      try {
        const elems = JSON.parse(st.elements || "[]");
        allElements += Array.isArray(elems) ? elems.length : 0;
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      overall: {
        projectCount: projectMap.size,
        tasks: {
          total: allTasks,
          done: allDone,
          inProgress: allInProgress,
          todo: allTodo,
          progress: allTasks > 0 ? Math.round((allDone / allTasks) * 100) : 0,
        },
        subTasks: {
          total: allSubTasks.length,
          done: allSubDone,
        },
        elements: {
          total: allElements,
        },
      },
      projects: Array.from(projectMap.values()).sort(
        (a, b) => b.progress - a.progress
      ),
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}

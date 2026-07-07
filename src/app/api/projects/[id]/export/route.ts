import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/projects/[id]/export
 * Returns CSV report of all tasks, sub-tasks, and elements in a project.
 * Query params: format=csv (default) or format=json
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: id },
      include: { subTasks: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    if (format === "json") {
      return NextResponse.json({ project, tasks });
    }

    // ── Build CSV ──
    const rows: string[] = [];
    rows.push('"Module","Screen / Sub-task","Elemen UI","Status","Priority","Goals","Definition of Done"');

    for (const task of tasks) {
      const taskGoals = safeJson(task.goals);
      const taskDoD = escapeCsv(task.definitionOfDone);

      if (task.subTasks.length === 0) {
        rows.push([
          escapeCsv(task.title),
          "",
          "",
          escapeCsv(task.status),
          escapeCsv(task.priority),
          escapeCsv(taskGoals.join("; ")),
          taskDoD,
        ].join(","));
      }

      for (const st of task.subTasks) {
        const stGoals = safeJson(st.goals);
        const stDoD = escapeCsv(st.definitionOfDone);
        const elements = safeJson(st.elements);

        if (elements.length === 0) {
          rows.push([
            escapeCsv(task.title),
            escapeCsv(st.title),
            "",
            escapeCsv(st.done ? "done" : "todo"),
            "",
            escapeCsv(stGoals.join("; ")),
            stDoD,
          ].join(","));
        }

        for (const el of elements) {
          rows.push([
            escapeCsv(task.title),
            escapeCsv(st.title),
            escapeCsv(el),
            escapeCsv(st.done ? "done" : "todo"),
            escapeCsv(task.priority),
            escapeCsv(stGoals.join("; ")),
            stDoD,
          ].join(","));
        }
      }
    }

    const csv = rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${project.title.replace(/[^a-zA-Z0-9]/g, "_")}_laporan.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export project:", error);
    return NextResponse.json({ error: "Failed to export project" }, { status: 500 });
  }
}

function escapeCsv(val: string): string {
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
}

function safeJson(str: string): string[] {
  try {
    const parsed = JSON.parse(str || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

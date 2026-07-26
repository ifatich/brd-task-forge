import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { filterTasksByLatestSprint } from "@/lib/sprint-utils";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mock_user_id")?.value || "admin-001";
    
    // Is admin? (For mock purpose, assume admin-001 can see everything)
    const isAdmin = userId === "admin-001";

    const projects = await prisma.project.findMany({
      where: isAdmin ? {} : {
        OR: [
          { userId: userId },
          { tasks: { some: { assignees: { some: { id: userId } } } } },
        ]
      },
      include: {
        tasks: {
          where: isAdmin ? { status: { not: "archived" } } : { status: { not: "archived" }, assignees: { some: { id: userId } } },
          select: { id: true, status: true, sprints: true, assignee: true, assignees: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = projects.map((p) => {
      const latestSprintTasks = filterTasksByLatestSprint(p.tasks, p.sprints);
      const total = latestSprintTasks.length;
      const done = latestSprintTasks.filter((t) => t.status === "done").length;
      const inProgress = latestSprintTasks.filter((t) => t.status === "in-progress").length;
      const todo = latestSprintTasks.filter((t) => t.status === "todo").length;
      let parsedSprints = [];
      try { parsedSprints = JSON.parse(p.sprints); } catch (e) {}
      
      const allAssignees = new Set<string>();
      p.tasks.forEach((t: any) => {
        if (t.assignee) {
          t.assignee.split(",").forEach((a: string) => {
            const trimmed = a.trim();
            if (trimmed) allAssignees.add(trimmed);
          });
        }
        if (t.assignees) {
          t.assignees.forEach((a: {name: string}) => {
            if (a.name) allAssignees.add(a.name);
          });
        }
      });

      return {
        ...p,
        sprints: parsedSprints,
        assignees: Array.from(allAssignees),
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
        taskSummary: { total, done, inProgress, todo },
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mock_user_id")?.value || "admin-001";
    const body = await request.json();
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description || "",
        status: body.status || "draft",
        fileUrl: body.fileUrl || "",
        userId: userId,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

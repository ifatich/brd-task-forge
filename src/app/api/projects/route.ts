import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mock_user_id")?.value || "admin-001";
    
    // Is admin? (For mock purpose, assume admin-001 can see everything)
    const isAdmin = userId === "admin-001";

    const projects = await prisma.project.findMany({
      where: isAdmin ? {} : {
        OR: [
          { userId: userId }, // Owner
          { tasks: { some: { assigneeId: userId } } }, // Assigned to at least one task
        ]
      },
      include: {
        tasks: {
          where: isAdmin ? {} : { assigneeId: userId },
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = projects.map((p) => {
      const total = p.tasks.length;
      const done = p.tasks.filter((t) => t.status === "done").length;
      const inProgress = p.tasks.filter((t) => t.status === "in-progress").length;
      const todo = p.tasks.filter((t) => t.status === "todo").length;
      return {
        ...p,
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
    const body = await request.json();
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description || "",
        status: body.status || "draft",
        fileUrl: body.fileUrl || "",
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

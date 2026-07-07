import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mock_user_id")?.value || "admin-001";

    const baseProject = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!baseProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwnerOrAdmin = userId === "admin-001" || baseProject.userId === userId;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { 
        tasks: { 
          where: isOwnerOrAdmin ? {} : { 
            OR: [
              { assigneeId: userId },
              { subTasks: { some: { assigneeId: userId } } }
            ]
          },
          include: { 
            subTasks: { 
              where: isOwnerOrAdmin ? {} : {
                OR: [
                  { assigneeId: userId },
                  { task: { assigneeId: userId } }
                ]
              },
              orderBy: { order: "asc" }, 
              include: { assigneeMember: true } 
            }, 
            assigneeMember: true 
          }, 
          orderBy: { order: "asc" } 
        } 
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Add computed taskSummary + progress (same as list endpoint)
    const total = project.tasks.length;
    const done = project.tasks.filter((t) => t.status === "done").length;
    const inProgress = project.tasks.filter((t) => t.status === "in-progress").length;
    const todo = project.tasks.filter((t) => t.status === "todo").length;

    const enriched = {
      ...project,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      taskSummary: { total, done, inProgress, todo },
    };

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const project = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
      },
    });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}

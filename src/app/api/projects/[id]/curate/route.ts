import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { tasks } = await request.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "Invalid tasks payload" }, { status: 400 });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Use a transaction to ensure atomic replacement
    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing tasks (SubTasks will be cascade deleted)
      await tx.task.deleteMany({
        where: { projectId },
      });

      // 2. Insert new curated tasks
      for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        await tx.task.create({
          data: {
            projectId,
            title: t.title,
            description: t.description || "",
            goals: typeof t.goals === 'string' ? t.goals : JSON.stringify(t.goals || []),
            definitionOfDone: t.definitionOfDone || "",
            status: "todo",
            priority: t.priority || "medium",
            order: i,
            subTasks: {
              create: (t.subTasks || []).map((st: any, si: number) => ({
                title: st.title,
                description: st.description || "",
                goals: typeof st.goals === 'string' ? st.goals : JSON.stringify(st.goals || []),
                definitionOfDone: st.definitionOfDone || "",
                elements: typeof st.elements === 'string' ? st.elements : JSON.stringify(st.elements || []),
                done: false,
                order: si,
              })),
            },
          },
        });
      }
    });

    // Fetch updated tasks for response
    const updatedTasks = await prisma.task.findMany({
      where: { projectId },
      include: { subTasks: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "Tugas berhasil dikurasi",
      tasks: updatedTasks,
    });
  } catch (error: any) {
    console.error("Curation error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan hasil kurasi" },
      { status: 500 }
    );
  }
}

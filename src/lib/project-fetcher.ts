import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { filterTasksByLatestSprint } from "@/lib/sprint-utils";

export async function getProjectForUser(id: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mock_user_id")?.value || "admin-001";
    
    const baseProject = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!baseProject) return null;

    const isOwnerOrAdmin = userId === "admin-001" || baseProject.userId === userId;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { 
        tasks: { 
          where: isOwnerOrAdmin ? { status: { not: "archived" } } : { 
            status: { not: "archived" },
            OR: [
              { assignees: { some: { id: userId } } },
              { subTasks: { some: { assigneeId: userId } } }
            ]
          },
          include: { 
            subTasks: { 
              where: isOwnerOrAdmin ? {} : {
                OR: [
                  { assigneeId: userId },
                  { task: { assignees: { some: { id: userId } } } }
                ]
              },
              orderBy: { order: "asc" }, 
              include: { assigneeMember: true } 
            }, 
            assignees: true 
          }, 
          orderBy: { order: "asc" } 
        } 
      },
    });

    if (!project) return null;

    const latestSprintTasks = filterTasksByLatestSprint(project.tasks, project.sprints);

    const total = latestSprintTasks.length;
    const done = latestSprintTasks.filter((t: any) => t.status === "done").length;
    const inProgress = latestSprintTasks.filter((t: any) => t.status === "in-progress").length;
    const todo = latestSprintTasks.filter((t: any) => t.status === "todo").length;

    let parsedSprints = [];
    try { parsedSprints = JSON.parse(project.sprints); } catch (e) {}

    const enriched = {
      ...project,
      sprints: parsedSprints,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      taskSummary: { total, done, inProgress, todo },
    };

    return JSON.parse(JSON.stringify(enriched));
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function getDiagramForProject(projectId: string) {
  try {
    const diagram = await prisma.moduleDiagram.findFirst({
      where: { projectId },
    });

    if (!diagram) return null;

    return {
      id: diagram.id,
      projectId: diagram.projectId,
      mermaidSyntax: diagram.mermaidSyntax,
      modules: JSON.parse(diagram.modules || "[]"),
      subDiagrams: JSON.parse(diagram.subDiagrams || "[]"),
      nodeDetails: JSON.parse(diagram.nodeDetails || "{}"),
      createdAt: diagram.createdAt,
      updatedAt: diagram.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching diagram:", error);
    return null;
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDiagramsForTasks } from "@/lib/ai-processor";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch project and current tasks
    const project = await prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const tasksData = await prisma.task.findMany({
      where: { projectId: id },
      include: { subTasks: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    if (!tasksData.length) {
      return NextResponse.json({ error: "No tasks found to generate diagrams" }, { status: 400 });
    }

    // Convert tasks to the format expected by the AI processor (similar to ai-processor output format)
    const formattedTasks = tasksData.map(t => ({
      title: t.title,
      description: t.description,
      goals: t.goals && typeof t.goals === 'string' ? JSON.parse(t.goals) : (t.goals || []),
      definitionOfDone: t.definitionOfDone,
      priority: t.priority,
      subTasks: t.subTasks.map(st => ({
        title: st.title,
        description: st.description,
        goals: st.goals && typeof st.goals === 'string' ? JSON.parse(st.goals) : (st.goals || []),
        definitionOfDone: st.definitionOfDone,
        elements: st.elements && typeof st.elements === 'string' ? JSON.parse(st.elements) : (st.elements || []),
      }))
    }));

    // 2. Generate new diagrams
    const result = await generateDiagramsForTasks(project.title, formattedTasks);

    // 3. Update the database
    // Update ERD and Flow in Project
    await prisma.project.update({
      where: { id },
      data: {
        erdMermaid: result.erdMermaid,
        flowMermaid: result.flowMermaid,
      }
    });

    // Update or create ModuleDiagram
    const existingDiagram = await prisma.moduleDiagram.findFirst({
      where: { projectId: id }
    });

    let moduleDiagram;
    if (existingDiagram) {
      moduleDiagram = await prisma.moduleDiagram.update({
        where: { id: existingDiagram.id },
        data: {
          mermaidSyntax: result.mermaidSyntax,
          modules: JSON.stringify(result.modules),
          nodeDetails: JSON.stringify(result.nodeDetails),
        }
      });
    } else {
      moduleDiagram = await prisma.moduleDiagram.create({
        data: {
          projectId: id,
          mermaidSyntax: result.mermaidSyntax,
          modules: JSON.stringify(result.modules),
          subDiagrams: "[]",
          nodeDetails: JSON.stringify(result.nodeDetails),
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Diagrams regenerated successfully",
      erdMermaid: result.erdMermaid,
      flowMermaid: result.flowMermaid,
      moduleDiagram
    });

  } catch (error: any) {
    console.error("Diagram regeneration error:", error);
    return NextResponse.json({ error: error.message || "Failed to regenerate diagrams" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enrichWithKnowledge } from "@/lib/knowledge";
import { hasAiConfig, processWithAi } from "@/lib/ai-processor";

interface ProcessResult {
  projectName: string;
  tasks: any[];
  modules: any[];
  mermaidSyntax: string;
  nodeDetails: Record<string, any>;
  drafts: any[];
  reasoning: string;
  erdMermaid?: string;
  flowMermaid?: string;
}

/**
 * POST /api/process
 * Body: { projectId: string }
 * 
 * Memproses teks BRD yang sudah diekstrak menjadi:
 * - Tasks (module) dengan sub-tasks (screen)
 * - Diagram Mermaid syntax
 * - Node details (goals, DoD)
 * 
 * Jika API key AI terkonfigurasi, gunakan AI (OpenAI/Anthropic/Gemini).
 * Jika tidak, gunakan simulated processor berbasis keyword.
 */
export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const text = project.description || "";

    // Enrich with active knowledge files
    const enrichedText = await enrichWithKnowledge(text);

    const result: ProcessResult = await processWithAi(enrichedText);

    // Save tasks + sub-tasks
    for (let i = 0; i < result.tasks.length; i++) {
      const t = result.tasks[i];
      await prisma.task.create({
        data: {
          projectId,
          title: t.title,
          description: t.description,
          goals: JSON.stringify(t.goals),
          definitionOfDone: t.definitionOfDone,
          status: "todo",
          priority: t.priority || "medium",
          order: i,
          subTasks: {
            create: t.subTasks.map((st: any, si: number) => ({
              title: st.title,
              description: st.description || "",
              goals: JSON.stringify(st.goals || []),
              definitionOfDone: st.definitionOfDone || "",
              elements: JSON.stringify(st.elements || []),
              done: false,
              order: si,
            })),
          },
        },
      });
    }

    // Auto-log the processing
    try {
      await prisma.projectLog.create({
        data: {
          projectId,
          action: "processing_completed",
          detail: `AI processing completed: ${result.tasks.length} tasks generated with ${result.tasks.reduce((s: number, t: any) => s + t.subTasks.length, 0)} sub-tasks`,
        },
      });
    } catch { /* log best-effort */ }

    // Save/update diagram data
    const existingDiagram = await prisma.moduleDiagram.findFirst({ where: { projectId } });
    if (existingDiagram) {
      await prisma.moduleDiagram.update({
        where: { id: existingDiagram.id },
        data: {
          mermaidSyntax: result.mermaidSyntax,
          modules: JSON.stringify(result.modules),
          nodeDetails: JSON.stringify(result.nodeDetails),
        },
      });
    } else {
      await prisma.moduleDiagram.create({
        data: {
          projectId,
          mermaidSyntax: result.mermaidSyntax,
          modules: JSON.stringify(result.modules),
          subDiagrams: "[]",
          nodeDetails: JSON.stringify(result.nodeDetails),
        },
      });
    }

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "active",
        title: project.title || result.projectName,
        drafts: JSON.stringify(result.drafts || []),
        reasoning: result.reasoning || "",
        erdMermaid: result.erdMermaid || "",
        flowMermaid: result.flowMermaid || "",
      },
    });

    // Fetch the created data to return to frontend
    const createdTasks = await prisma.task.findMany({
      where: { projectId },
      include: { subTasks: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    const diagram = await prisma.moduleDiagram.findFirst({
      where: { projectId },
    });

    return NextResponse.json({
      success: true,
      projectId,
      projectName: project.title || result.projectName,
      tasks: createdTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        goals: JSON.parse(t.goals || "[]"),
        definitionOfDone: t.definitionOfDone,
        status: t.status,
        priority: t.priority,
        order: t.order,
        subTasks: t.subTasks.map((st) => ({
          id: st.id,
          title: st.title,
          description: st.description,
          goals: JSON.parse(st.goals || "[]"),
          definitionOfDone: st.definitionOfDone,
          elements: JSON.parse(st.elements || "[]"),
          done: st.done,
          order: st.order,
        })),
      })),
      diagram: diagram
        ? {
            id: diagram.id,
            mermaidSyntax: diagram.mermaidSyntax,
            modules: JSON.parse(diagram.modules || "[]"),
            nodeDetails: JSON.parse(diagram.nodeDetails || "{}"),
          }
        : null,
      summary: {
        taskCount: createdTasks.length,
        moduleCount: result.tasks.length,
        screenCount: createdTasks.reduce((sum, t) => sum + t.subTasks.length, 0),
        elementCount: createdTasks.reduce(
          (sum, t) => sum + t.subTasks.reduce((s, st) => {
            try { return s + JSON.parse(st.elements || "[]").length; } catch { return s; }
          }, 0),
          0,
        ),
      },
      drafts: result.drafts,
      reasoning: result.reasoning,
      erdMermaid: result.erdMermaid,
      flowMermaid: result.flowMermaid,
    });
  } catch (error) {
    console.error("AI processing failed:", error);
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}



import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * POST /api/pipeline/confirm
 * Body: { projectName, tasks, diagram, extractedText, fileName, fileBuffer }
 * 
 * Creates the project, saves file to disk, creates tasks/sub-tasks/diagram.
 * Called after user reviews and confirms the AI-generated preview.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectName, tasks, diagram, extractedText, fileName, fileBuffer, drafts, reasoning, erdMermaid, flowMermaid } = body;

    if (!projectName || !tasks || !diagram) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save the PDF file to disk
    let fileUrl = "";
    if (fileName && fileBuffer) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = path.join(uploadDir, safeName);
        await writeFile(filePath, Buffer.from(fileBuffer));
        fileUrl = `/uploads/${safeName}`;
      } catch (err) {
        console.error("Failed to save file:", err);
      }
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        title: projectName,
        description: extractedText || "",
        status: "active",
        fileUrl,
        drafts: drafts ? JSON.stringify(drafts) : "",
        reasoning: reasoning || "",
        erdMermaid: erdMermaid || "",
        flowMermaid: flowMermaid || "",
      },
    });

    // Create tasks with sub-tasks
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      await prisma.task.create({
        data: {
          projectId: project.id,
          title: t.title,
          description: t.description || "",
          goals: JSON.stringify(t.goals || []),
          definitionOfDone: t.definitionOfDone || "",
          status: "todo",
          priority: t.priority || "medium",
          order: i,
          subTasks: {
            create: (t.subTasks || []).map((st: any, si: number) => ({
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

    // Save diagram
    await prisma.moduleDiagram.create({
      data: {
        projectId: project.id,
        mermaidSyntax: diagram.mermaidSyntax || "",
        modules: JSON.stringify(diagram.modules || []),
        subDiagrams: "[]",
        nodeDetails: JSON.stringify(diagram.nodeDetails || {}),
      },
    });

    // Fetch the created data for response
    const createdTasks = await prisma.task.findMany({
      where: { projectId: project.id },
      include: { subTasks: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    const savedDiagram = await prisma.moduleDiagram.findFirst({
      where: { projectId: project.id },
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      projectName: project.title,
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
      diagram: savedDiagram
        ? {
          mermaidSyntax: savedDiagram.mermaidSyntax,
          modules: JSON.parse(savedDiagram.modules || "[]"),
          nodeDetails: JSON.parse(savedDiagram.nodeDetails || "{}"),
        }
        : null,
      summary: {
        taskCount: createdTasks.length,
        screenCount: createdTasks.reduce((sum, t) => sum + t.subTasks.length, 0),
      },
    });
  } catch (error) {
    console.error("Confirm save failed:", error);
    return NextResponse.json({ error: "Failed to save project data" }, { status: 500 });
  }
}

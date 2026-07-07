import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enrichWithKnowledge } from "@/lib/knowledge";
import { hasAiConfig, processWithAi } from "@/lib/ai-processor";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * POST /api/pipeline
 * Body: FormData with "file" (PDF) and optional "notes"
 * Query: ?preview=true (default) — process & return data WITHOUT saving anything to DB
 *        ?preview=false — legacy: process & save everything
 * 
 * Pipeline: upload PDF → extract text → AI process → return full result
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const url = new URL(request.url);
    const preview = url.searchParams.get("preview") !== "false";

    // ── 1. Process file in-memory ──
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const notes = (formData.get("notes") as string) || "";
    const title = fileName.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");

    // ── 2. Extract text ──
    let extractedText = notes ? `Catatan: ${notes}\n\n` : "";
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const pdfjsDir = path.resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build");
      pdfjs.GlobalWorkerOptions.workerSrc = path.join(pdfjsDir, "pdf.worker.mjs");
      const data = new Uint8Array(buffer);
      const doc = await pdfjs.getDocument({
        data,
        standardFontDataUrl: path.resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts") + "/",
      }).promise;
      extractedText = `--- Metadata ---\nJudul: ${title}\nJumlah Halaman: ${doc.numPages}\n\n--- Konten ---\n\n`;

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        extractedText += `[Halaman ${i}]\n${pageText}\n\n`;
      }

      if (notes) extractedText += `\n--- Catatan ---\n${notes}\n`;
    } catch (extractError) {
      console.error("Extraction failed, proceeding with notes only:", extractError);
    }

    // ── 3. Process using AI ──
    const text = await enrichWithKnowledge(extractedText);

    const aiResult = await processWithAi(text);
    const tasksData = aiResult.tasks;
    const mermaidSyntax = aiResult.mermaidSyntax;
    const nodeDetails = aiResult.nodeDetails;

    // ── 4. Save to DB (only when NOT preview) ──
    let projectId: string | null = null;

    if (!preview) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      const project = await prisma.project.create({
        data: {
          title,
          description: extractedText,
          status: "active",
          fileUrl: `/uploads/${fileName}`,
          drafts: JSON.stringify(aiResult.drafts || []),
          reasoning: aiResult.reasoning || "",
          erdMermaid: aiResult.erdMermaid || "",
          flowMermaid: aiResult.flowMermaid || "",
        },
      });
      projectId = project.id;

      for (let i = 0; i < tasksData.length; i++) {
        const t = tasksData[i];
        await prisma.task.create({
          data: {
            projectId: project.id,
            title: t.title,
            description: t.description,
            goals: JSON.stringify(t.goals),
            definitionOfDone: t.definitionOfDone,
            status: "todo",
            priority: t.priority,
            order: i,
            subTasks: {
              create: t.subTasks.map((st: any, si: number) => ({
                title: st.title,
                description: st.description,
                goals: JSON.stringify(st.goals),
                definitionOfDone: st.definitionOfDone,
                elements: JSON.stringify(st.elements),
                done: false,
                order: si,
              })),
            },
          },
        });
      }

      await prisma.moduleDiagram.create({
        data: {
          projectId: project.id,
          mermaidSyntax,
          modules: JSON.stringify(tasksData.map((t: any) => ({ name: t.title, screens: t.subTasks.map((st: any) => st.title) }))),
          subDiagrams: "[]",
          nodeDetails: JSON.stringify(nodeDetails),
        },
      });
    }

    // ── 5. Build response ──
    const tasks = tasksData.map((t, i) => ({
      id: preview ? `preview-task-${i}` : t.id,
      title: t.title,
      description: t.description,
      goals: t.goals,
      definitionOfDone: t.definitionOfDone,
      status: "todo",
      priority: t.priority,
      order: i,
      subTasks: t.subTasks.map((st: any, si: number) => ({
        id: preview ? `preview-subtask-${i}-${si}` : st.id,
        title: st.title,
        description: st.description,
        goals: st.goals,
        definitionOfDone: st.definitionOfDone,
        elements: st.elements,
        done: false,
        order: si,
      })),
    }));

    return NextResponse.json({
      success: true,
      preview,
      projectId, // null when preview, real ID when saved
      previewId: preview ? `preview-${Date.now()}` : undefined,
      projectName: title,
      extractedText,
      fileName,
      fileBuffer: preview ? Array.from(buffer) : undefined,
      tasks,
      diagram: {
        mermaidSyntax,
        modules: tasksData.map((t: any) => ({ name: t.title, screens: t.subTasks.map((st: any) => st.title) })),
        nodeDetails,
      },
      summary: {
        taskCount: tasksData.length,
        screenCount: tasksData.reduce((sum: number, t: any) => sum + t.subTasks.length, 0),
        elementCount: tasksData.reduce((sum: number, t: any) =>
          sum + t.subTasks.reduce((s: number, st: any) => s + (st.elements?.length || 0), 0), 0),
      },
      drafts: aiResult.drafts,
      reasoning: aiResult.reasoning,
      erdMermaid: aiResult.erdMermaid,
      flowMermaid: aiResult.flowMermaid,
    });
  } catch (error) {
    console.error("Pipeline failed:", error);
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}


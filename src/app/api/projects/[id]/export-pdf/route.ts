import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/projects/[id]/export-pdf
 * Returns a PDF report of all tasks, sub-tasks, and elements in a project.
 */
export async function GET(
  _request: Request,
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

    // Dynamic import for ESM compatibility
    const { default: JsPDF } = await import("jspdf");
    await import("jspdf-autotable");

    const doc = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // ── Title ──
    doc.setFontSize(18);
    doc.text(`Laporan Proyek: ${project.title}`, 14, 20);

    doc.setFontSize(10);
    doc.text(`Status: ${project.status} | Total Tugas: ${tasks.length} | Dibuat: ${new Date(project.createdAt).toLocaleDateString("id-ID")}`, 14, 28);

    // ── Tasks table ──
    let yPos = 35;
    const pageHeight = 200;

    for (let ti = 0; ti < tasks.length; ti++) {
      const task = tasks[ti];

      // Check if we need a new page
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      // ── Task header ──
      doc.setFillColor(24, 24, 27); // zinc-900
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.rect(14, yPos, doc.internal.pageSize.width - 28, 8, "F");
      const taskStatus = task.status === "done" ? "✅" : task.status === "in-progress" ? "🔄" : "⬜";
      doc.text(`${taskStatus} ${task.title} (${task.priority})`, 16, yPos + 6);
      yPos += 11;

      // Task description
      if (task.description) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(splitText(doc, task.description, 250), 18, yPos);
        yPos += 5;
      }

      // Goals & DoD
      const goals = safeJson(task.goals);
      if (goals.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(`Goals: ${goals.join(", ")}`, 18, yPos);
        yPos += 5;
      }
      if (task.definitionOfDone) {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(`DoD: ${task.definitionOfDone}`, 18, yPos);
        yPos += 5;
      }

      // ── Sub-tasks ──
      for (let si = 0; si < task.subTasks.length; si++) {
        const st = task.subTasks[si];

        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFillColor(st.done ? 220 : 245, st.done ? 252 : 245, st.done ? 231 : 245);
        doc.rect(20, yPos, doc.internal.pageSize.width - 34, 6, "F");

        doc.setFontSize(10);
        doc.setTextColor(st.done ? 22 : 0, st.done ? 101 : 0, st.done ? 52 : 0);
        doc.text(`${st.done ? "✓" : "○"} ${st.title}`, 22, yPos + 4);
        yPos += 8;

        // Elements
        const elements = safeJson(st.elements);
        if (elements.length > 0) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Elemen UI: ${elements.join(", ")}`, 24, yPos);
          yPos += 4;
        }
      }

      yPos += 4;
    }

    // ── Footer with summary ──
    const totalDone = tasks.filter((t) => t.status === "done").length;
    const totalInProgress = tasks.filter((t) => t.status === "in-progress").length;
    const totalTodo = tasks.filter((t) => t.status === "todo").length;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Ringkasan: ✅ ${totalDone} Selesai | 🔄 ${totalInProgress} Diproses | ⬜ ${totalTodo} Belum | Total ${tasks.length} Tugas`,
      14,
      doc.internal.pageSize.height - 10
    );

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${project.title.replace(/[^a-zA-Z0-9]/g, "_")}_laporan.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to export PDF:", error);
    return NextResponse.json({ error: "Failed to export PDF" }, { status: 500 });
  }
}

function splitText(doc: any, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function safeJson(str: string): string[] {
  try {
    const parsed = JSON.parse(str || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

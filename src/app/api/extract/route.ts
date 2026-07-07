import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project?.fileUrl) {
      return NextResponse.json({ error: "Project or file not found" }, { status: 404 });
    }

    const filePath = join(process.cwd(), "public", project.fileUrl);
    const pdfBuffer = await readFile(filePath);

    // Extract text using pdfjs-dist (Node.js build)
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjsLib.getDocument({ data: pdfBuffer.buffer }).promise;
    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str || "").join(" ") + "\n\n";
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { description: text.substring(0, 500), status: "active" },
    });

    return NextResponse.json({ text, pages: doc.numPages });
  } catch (error) {
    console.error("Extraction failed:", error);
    return NextResponse.json({ error: "Failed to extract PDF text" }, { status: 500 });
  }
}

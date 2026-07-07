import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/admin/knowledge/upload
 * Upload a .md file as a knowledge file.
 * Body: FormData with "file" (.md) and optional "type"
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate file extension
    if (!file.name.endsWith(".md")) {
      return NextResponse.json({ error: "Only .md files are allowed" }, { status: 400 });
    }

    const type = (formData.get("type") as string) || "Instruksi";
    if (!["Prompt", "Skill", "Instruksi"].includes(type)) {
      return NextResponse.json({ error: "Type must be Prompt, Skill, or Instruksi" }, { status: 400 });
    }

    // Read file content
    const content = await file.text();
    const name = file.name.replace(/\.md$/i, "");

    const knowledgeFile = await prisma.knowledgeFile.create({
      data: {
        name,
        type,
        content,
        active: true,
      },
    });

    return NextResponse.json(knowledgeFile, { status: 201 });
  } catch (error) {
    console.error("Failed to upload knowledge file:", error);
    return NextResponse.json({ error: "Failed to upload knowledge file" }, { status: 500 });
  }
}

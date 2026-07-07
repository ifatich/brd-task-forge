import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/knowledge
 * Returns all knowledge files.
 */
export async function GET() {
  try {
    const files = await prisma.knowledgeFile.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(files);
  } catch (error) {
    console.error("Failed to fetch knowledge files:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge files" }, { status: 500 });
  }
}

/**
 * POST /api/admin/knowledge
 * Body: { name, type, content, active? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }

    const file = await prisma.knowledgeFile.create({
      data: {
        name: body.name,
        type: body.type || "Instruksi",
        content: body.content,
        active: body.active !== false,
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error("Failed to create knowledge file:", error);
    return NextResponse.json({ error: "Failed to create knowledge file" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/admin/knowledge/[id]
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, any> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.type !== undefined) data.type = body.type;
    if (body.content !== undefined) data.content = body.content;
    if (body.active !== undefined) data.active = body.active;

    const file = await prisma.knowledgeFile.update({ where: { id }, data });
    return NextResponse.json(file);
  } catch (error) {
    console.error("Failed to update knowledge file:", error);
    return NextResponse.json({ error: "Failed to update knowledge file" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/knowledge/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.knowledgeFile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete knowledge file:", error);
    return NextResponse.json({ error: "Failed to delete knowledge file" }, { status: 500 });
  }
}

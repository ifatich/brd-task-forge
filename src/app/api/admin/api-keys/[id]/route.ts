import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/api-keys/[id]
 * Returns the full API key details (unmasked).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const key = await prisma.apiKey.findUnique({ where: { id } });
    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }
    // Return unmasked for edit modal
    return NextResponse.json(key);
  } catch (error) {
    console.error("Failed to fetch API key:", error);
    return NextResponse.json({ error: "Failed to fetch API key" }, { status: 500 });
 }
}

/**
 * PATCH /api/admin/api-keys/[id]
 * Toggle active status or update fields.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, any> = {};
    if (body.active !== undefined) data.active = body.active;
    if (body.label !== undefined) data.label = body.label;
    if (body.keyValue !== undefined) data.keyValue = body.keyValue;
    if (body.baseUrl !== undefined) data.baseUrl = body.baseUrl;
    if (body.model !== undefined) data.model = body.model;

    const key = await prisma.apiKey.update({ where: { id }, data });

    // If activating this key, deactivate all other keys
    if (body.active === true) {
      await prisma.apiKey.updateMany({
        where: { id: { not: id }, active: true },
        data: { active: false },
      });
    }

    return NextResponse.json(key);
  } catch (error) {
    console.error("Failed to update API key:", error);
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/api-keys/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.apiKey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/projects/[id]/logs
 * Returns project logs/activity history.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const logs = await prisma.projectLog.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/logs
 * Create a new log entry. Body: { action: string, detail?: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const log = await prisma.projectLog.create({
      data: {
        projectId: id,
        action: body.action,
        detail: body.detail || "",
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to create log:", error);
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects/[id]/diagram
 * Returns the module diagram data for a project.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const diagram = await prisma.moduleDiagram.findFirst({
      where: { projectId: id },
    });

    if (!diagram) {
      return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: diagram.id,
      projectId: diagram.projectId,
      mermaidSyntax: diagram.mermaidSyntax,
      modules: JSON.parse(diagram.modules || "[]"),
      subDiagrams: JSON.parse(diagram.subDiagrams || "[]"),
      nodeDetails: JSON.parse(diagram.nodeDetails || "{}"),
      createdAt: diagram.createdAt,
      updatedAt: diagram.updatedAt,
    });
  } catch (error) {
    console.error("Failed to fetch diagram:", error);
    return NextResponse.json({ error: "Failed to fetch diagram" }, { status: 500 });
  }
}

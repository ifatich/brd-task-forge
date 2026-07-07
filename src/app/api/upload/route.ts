import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const notes = (formData.get("notes") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Save file to local uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    // Create a draft project
    const project = await prisma.project.create({
      data: {
        title: file.name.replace(".pdf", "").replace(/[-_]/g, " "),
        description: notes || `BRD document: ${file.name}`,
        status: "draft",
        fileUrl,
      },
    });

    return NextResponse.json({
      project,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    }, { status: 201 });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EXECUTION_MODE_KEY = "execution_mode";

/**
 * GET /api/admin/execution-mode
 * Returns current execution mode: "local" or "production".
 * Defaults to "local" if not set.
 */
export async function GET() {
  try {
    let config = await prisma.systemConfig.findUnique({
      where: { key: EXECUTION_MODE_KEY },
    });

    if (!config) {
      config = await prisma.systemConfig.create({
        data: { key: EXECUTION_MODE_KEY, value: "local" },
      });
    }

    return NextResponse.json({ mode: config.value });
  } catch (error) {
    console.error("Failed to fetch execution mode:", error);
    return NextResponse.json({ error: "Failed to fetch execution mode" }, { status: 500 });
  }
}

/**
 * POST /api/admin/execution-mode
 * Body: { mode: "local" | "production" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.mode || !["local", "production"].includes(body.mode)) {
      return NextResponse.json({ error: "Mode must be 'local' or 'production'" }, { status: 400 });
    }

    const config = await prisma.systemConfig.upsert({
      where: { key: EXECUTION_MODE_KEY },
      update: { value: body.mode },
      create: { key: EXECUTION_MODE_KEY, value: body.mode },
    });

    return NextResponse.json({ mode: config.value });
  } catch (error) {
    console.error("Failed to update execution mode:", error);
    return NextResponse.json({ error: "Failed to update execution mode" }, { status: 500 });
  }
}

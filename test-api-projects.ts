import { NextResponse } from "next/server";
import { prisma } from "./src/lib/db";

async function main() {
  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        where: {
          status: { not: "archived" },
        },
        include: { assignees: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const riplay = projects.find(p => p.title === "RIPLAY BRI");
  console.log(JSON.stringify(riplay, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { prisma } from "./src/lib/db";

async function main() {
  const project = await prisma.project.findFirst({ where: { title: "RIPLAY BRI" } });
  if (!project) return;
  const tasks = await prisma.task.findMany({ where: { projectId: project.id } });
  
  for (const t of tasks) {
    if (t.title === "Review" || t.title === "Revisi" || t.title.startsWith("Present")) {
       console.log(`Task: ${t.title} | Status: ${t.status} | IsArchived: ${t.isArchived}`);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

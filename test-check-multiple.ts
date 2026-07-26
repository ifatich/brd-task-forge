import { prisma } from "./src/lib/db";
async function main() {
  const p = await prisma.project.findFirst({ where: { title: "RIPLAY BRI" } });
  const tasks = await prisma.task.findMany({ where: { projectId: p?.id, title: "Revisi" } });
  console.log(tasks);
}
main().catch(console.error).finally(() => prisma.$disconnect());

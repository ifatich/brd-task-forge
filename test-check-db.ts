import { prisma } from "./src/lib/db";
async function main() {
  const projects = await prisma.project.findMany({
    include: { tasks: { include: { subTasks: true } } },
    take: 3,
    orderBy: { createdAt: 'desc' }
  });
  console.dir(projects, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());

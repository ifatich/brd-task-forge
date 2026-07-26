import { prisma } from "./src/lib/db";
async function main() {
  const p = await prisma.project.findFirst({
    where: { title: "Uncategorized" },
    include: { tasks: { include: { subTasks: true } } }
  });
  console.dir(p, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());

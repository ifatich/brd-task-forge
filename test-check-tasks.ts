import { prisma } from "./src/lib/db";
async function main() {
  const t = await prisma.task.findMany({
    where: { title: { contains: 'backlog' } }
  });
  console.dir(t, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());

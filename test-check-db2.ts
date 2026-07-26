import { prisma } from "./src/lib/db";
async function main() {
  const p = await prisma.project.findMany({
    select: { title: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.dir(p, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());

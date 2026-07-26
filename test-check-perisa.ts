import { prisma } from "./src/lib/db";
async function main() {
  const p = await prisma.project.findMany({
    where: { title: { in: ['PERISA', 'E-Rumdin', 'Digital Project', 'POJ'] } },
    select: { title: true, createdAt: true, _count: { select: { tasks: true } } }
  });
  console.dir(p, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());

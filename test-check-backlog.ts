import { prisma } from "./src/lib/db";
async function main() {
  const p = await prisma.project.findMany({
    where: { title: { contains: 'backlog' } }
  });
  console.dir(p, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());

import { prisma } from "./src/lib/db";
async function main() {
  const p = await prisma.project.findMany({
    select: { title: true }
  });
  console.log("All projects:", p.map(x => x.title).join(", "));
}
main().catch(console.error).finally(() => prisma.$disconnect());

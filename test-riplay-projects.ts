import { prisma } from "./src/lib/db"
async function main() {
  const ps = await prisma.project.findMany({
    where: { title: { contains: "RIPLAY" } },
    include: { tasks: true }
  });
  console.log(`Found ${ps.length} projects`);
  ps.forEach(p => {
     console.log(`Project ID: ${p.id} | Title: "${p.title}" | Sprints: ${p.sprints}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());

import { prisma } from "./src/lib/db"
async function main() {
  const p = await prisma.project.findFirst({
    where: { title: { contains: "RIPLAY" } },
    include: { tasks: true }
  });
  console.log("Project:", p?.title);
  if (p) {
     p.tasks.forEach(t => console.log(`- Task: "${t.title}" | Status: ${t.status} | Goals: ${t.goals}`));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

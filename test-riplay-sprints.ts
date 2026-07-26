import { prisma } from "./src/lib/db"
async function main() {
  const p = await prisma.project.findFirst({
    where: { title: { contains: "RIPLAY" } },
    include: { tasks: true }
  });
  console.log("Project Sprints:", p?.sprints);
  if (p) {
     p.tasks.forEach(t => console.log(`- Task: "${t.title}" | Sprints: ${t.sprints}`));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

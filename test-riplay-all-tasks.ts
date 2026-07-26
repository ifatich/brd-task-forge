import { prisma } from "./src/lib/db"
async function main() {
  const p = await prisma.project.findFirst({
    where: { title: { contains: "RIPLAY" } },
    include: { tasks: true }
  });
  console.log("Project:", p?.title);
  if (p) {
     p.tasks.forEach(t => console.log(`- Task ID: ${t.id} | Title: "${t.title}" | Sprints: ${t.sprints} | Status: ${t.status} | IsArchived: ${t.status === "archived"}`));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

import { prisma } from "./src/lib/db";
async function main() {
  const tenMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  const projects = await prisma.project.findMany({
    where: { createdAt: { gte: tenMinsAgo } },
    include: { tasks: { include: { subTasks: true } } }
  });
  console.log("Recent projects created:", projects.length);
  projects.forEach(p => console.log("-", p.title));
}
main().catch(console.error).finally(() => prisma.$disconnect());

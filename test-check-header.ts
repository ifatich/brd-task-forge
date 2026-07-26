import { prisma } from "./src/lib/db";
async function main() {
  const p = await prisma.project.findFirst({ where: { title: "Project Name" } });
  console.log("Project Name project:", !!p);
}
main().catch(console.error).finally(() => prisma.$disconnect());

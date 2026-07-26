import { prisma } from "./src/lib/db";
async function main() {
  const count = await prisma.project.count();
  console.log("Total Projects:", count);
}
main().catch(console.error).finally(() => prisma.$disconnect());

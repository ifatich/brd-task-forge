import { prisma } from "./src/lib/db";
async function main() {
  await prisma.project.updateMany({
    where: {
      NOT: {
        title: {
          contains: 'backlog'
        }
      }
    },
    data: {
      status: 'active'
    }
  });
  console.log("Updated projects to active");
}
main().catch(console.error).finally(() => prisma.$disconnect());

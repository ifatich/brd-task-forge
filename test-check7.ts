import { prisma } from "./src/lib/db"
async function main() {
  const p = await prisma.project.findFirst({
    where: { title: { contains: "Website Corporate POJ" } }
  });
  console.log("Project:", p?.title);
  console.log("Status:", p?.status);
  console.log("Sprints:", p?.sprints);
}
main().finally(() => process.exit(0))

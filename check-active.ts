import { prisma } from "./src/lib/db"
async function main() {
  const activeProjects = await prisma.project.findMany({
    where: { status: "active" },
    select: { title: true, sprints: true, tasks: { select: { id: true } } }
  })
  console.log(`There are ${activeProjects.length} active projects:`)
  for (const p of activeProjects) {
    console.log(`- ${p.title} (Tasks: ${p.tasks.length}, Sprints: ${p.sprints})`)
  }
}
main().finally(() => process.exit(0))

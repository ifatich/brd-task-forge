import { prisma } from "./src/lib/db"
import { filterTasksByLatestSprint } from "./src/lib/sprint-utils"

async function main() {
  const p = await prisma.project.findFirst({
    where: { title: { contains: "KITA PEGADAIAN" } },
    include: { tasks: { where: { status: { not: "archived" } } } }
  })
  if (!p) return console.log("Project not found")
  
  const latestTasks = filterTasksByLatestSprint(p.tasks)
  console.log(`Total tasks in project: ${p.tasks.length}`)
  console.log(`Latest sprint tasks: ${latestTasks.length}`)
  console.log(`Latest sprint tasks titles:`, latestTasks.map(t => t.title))
}
main().finally(() => process.exit(0))

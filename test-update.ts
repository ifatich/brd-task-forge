import { prisma } from "./src/lib/db"
async function main() {
  try {
    const res = await prisma.task.updateMany({
      where: { id: { notIn: ["test"] } },
      data: { status: "archived" }
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
main()

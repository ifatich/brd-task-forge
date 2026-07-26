import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as dotenv from "dotenv";

dotenv.config(); // Load .env file

const url = process.env.TURSO_DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Menghubungkan ke database:", url.startsWith("file:") ? "Local SQLite" : "Turso");
  console.log("Mulai menghapus semua data Project...");

  // Karena onDelete: Cascade digunakan pada schema:
  // Menghapus project akan otomatis menghapus:
  // - Task
  // - SubTask
  // - ModuleDiagram
  // - ProjectLog
  const deletedProjects = await prisma.project.deleteMany();
  
  // Hapus invitation yang tertaut dengan project (bila ada)
  const deletedInvitations = await prisma.invitation.deleteMany({
    where: {
      projectId: {
        not: null
      }
    }
  });

  console.log(`✅ Berhasil menghapus ${deletedProjects.count} Project beserta semua data terkaitnya (Task, SubTask, Module Diagram, Logs).`);
  if (deletedInvitations.count > 0) {
    console.log(`✅ Berhasil menghapus ${deletedInvitations.count} Invitation yang tertaut dengan project.`);
  }
  
  console.log("✅ Data lain (User, TeamMember, ApiKey, SystemConfig, KnowledgeFile) berhasil dipertahankan.");
}

main()
  .catch((e) => {
    console.error("Terjadi kesalahan:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

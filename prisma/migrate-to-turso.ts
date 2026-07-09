import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || tursoUrl.startsWith("file:")) {
    console.error("❌ TURSO_DATABASE_URL belum diatur ke cloud (masih mengarah ke file lokal atau kosong).");
    console.error("Silakan atur TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN di file .env terlebih dahulu.");
    process.exit(1);
  }

  console.log("Menghubungkan ke Lokal (dev.db)...");
  // 1. Client Lokal
  const localAdapter = new PrismaLibSql({
    url: "file:./dev.db"
  });
  const localPrisma = new PrismaClient({ adapter: localAdapter });

  console.log(`Menghubungkan ke Turso (${tursoUrl})...`);
  // 2. Client Turso
  const tursoAdapter = new PrismaLibSql({
    url: tursoUrl,
    authToken: tursoAuthToken
  });
  const tursoPrisma = new PrismaClient({ adapter: tursoAdapter });

  // Eksekusi schema dari SQL (untuk Turso yang masih kosong)
  const { createClient } = require("@libsql/client");
  const fs = require("fs");
  const path = require("path");

  console.log("Menyiapkan tabel di Turso (execute SQL Schema)...");
  try {
    const sqlPath = path.join(__dirname, "turso-schema.sql");
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, "utf-8");
      const libsqlClient = createClient({ url: tursoUrl, authToken: tursoAuthToken });
      await libsqlClient.executeMultiple(sql);
      console.log("✅ Tabel berhasil disiapkan di Turso!");
    } else {
      console.log("⚠️ File turso-schema.sql tidak ditemukan, mencoba lanjut tanpa execute schema...");
    }
  } catch (e) {
    console.log("⚠️ Gagal menjalankan SQL schema (mungkin tabel sudah ada), lanjut ke migrasi data...", e instanceof Error ? e.message : String(e));
  }

  console.log("\nMembaca data dari lokal...");
  
  // Baca data dari lokal
  const users = await localPrisma.user.findMany();
  const teamMembers = await localPrisma.teamMember.findMany();
  const apiKeys = await localPrisma.apiKey.findMany();
  const configs = await localPrisma.systemConfig.findMany();
  const knowledgeFiles = await localPrisma.knowledgeFile.findMany();

  console.log(`Ditemukan di lokal: ${users.length} Users, ${teamMembers.length} Team Members, ${apiKeys.length} API Keys, ${configs.length} Configs, ${knowledgeFiles.length} Knowledge Files.`);

  console.log("\nMulai menyalin data ke Turso...");
  
  try {
    if (users.length > 0) {
      await tursoPrisma.user.createMany({ data: users });
      console.log(`✅ Migrasi ${users.length} Users berhasil.`);
    }
    if (teamMembers.length > 0) {
      await tursoPrisma.teamMember.createMany({ data: teamMembers });
      console.log(`✅ Migrasi ${teamMembers.length} Team Members berhasil.`);
    }
    if (apiKeys.length > 0) {
      await tursoPrisma.apiKey.createMany({ data: apiKeys });
      console.log(`✅ Migrasi ${apiKeys.length} API Keys berhasil.`);
    }
    if (configs.length > 0) {
      await tursoPrisma.systemConfig.createMany({ data: configs });
      console.log(`✅ Migrasi ${configs.length} Configs berhasil.`);
    }
    if (knowledgeFiles.length > 0) {
      await tursoPrisma.knowledgeFile.createMany({ data: knowledgeFiles });
      console.log(`✅ Migrasi ${knowledgeFiles.length} Knowledge Files berhasil.`);
    }
    console.log("\n🎉 Semua data berhasil dimigrasikan ke Turso!");
    console.log("⚠️  PENTING: Pastikan Anda sudah menjalankan perintah pembuatan tabel (prisma db push) ke Turso sebelumnya.");
  } catch (error) {
    console.error("\n❌ Gagal melakukan migrasi. Pastikan skema database Turso sudah disiapkan.");
    console.error("💡 Solusi: Ubah DATABASE_URL di .env menjadi URL Turso, jalankan `npx prisma db push`, lalu jalankan script ini lagi.");
    console.error("Error Detail:", error);
  } finally {
    await localPrisma.$disconnect();
    await tursoPrisma.$disconnect();
  }
}

main();

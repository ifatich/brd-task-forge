import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prismaClient: PrismaClient;

if (globalForPrisma.prisma) {
  prismaClient = globalForPrisma.prisma;
} else {
  const url = process.env.TURSO_DATABASE_URL || "file:./dev.db";
  
  // Jika menggunakan local file, tidak perlu adapter LibSQL
  if (url.startsWith("file:")) {
    prismaClient = new PrismaClient({
      datasources: { db: { url } },
    });
  } else {
    // Jika menggunakan Turso (libsql://), gunakan adapter + authToken
    const libsql = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSql(libsql);
    prismaClient = new PrismaClient({ adapter });
  }
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

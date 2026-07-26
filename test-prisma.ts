import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const config = { url: process.env.DATABASE_URL || "file:./dev.db" };
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

prisma.$connect().then(() => console.log("OK")).catch(e => console.error(e));

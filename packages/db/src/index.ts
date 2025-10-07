// /packages/db/index.ts

import { PrismaClient, TestCaseResult } from "@prisma/client";

// ✅ Singleton pattern to avoid multiple Prisma instances in development
const prismaClientSingleton = () => new PrismaClient();

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// ✅ Use existing Prisma instance in development, else create a new one
const db: ReturnType<typeof prismaClientSingleton> = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db;
}

// ✅ Export Prisma Client and Enum for use in other packages
export { db, TestCaseResult };
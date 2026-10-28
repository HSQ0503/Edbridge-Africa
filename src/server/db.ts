import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { pgConfig } from "./pg-config";

// Reuse one client across dev hot reloads so each reload doesn't open a new connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pgConfig()) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

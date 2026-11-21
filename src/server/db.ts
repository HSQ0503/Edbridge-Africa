import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { pgConfig } from "./pg-config";

// Reuse one client across dev hot reloads so each reload doesn't open a new connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pgConfig()) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Postgres reports a missing table as 42P01; Prisma wraps it as P2021. Used where code may run before its migration.
export function isMissingTable(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const { code, message } = error as { code?: unknown; message?: unknown };
  return code === "P2021" || code === "42P01" || (typeof message === "string" && /relation .* does not exist|table .* does not exist/i.test(message));
}

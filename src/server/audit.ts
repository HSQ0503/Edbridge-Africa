import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./db";

export type AuditEventInput = {
  // null when the actor is a member of the public or a system script
  actorId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  detail?: Record<string, string | number | boolean | string[]>;
};

const GENESIS_HASH = "0".repeat(64);
// Any constant works; it just has to be the same everywhere the chain is extended.
const CHAIN_LOCK_KEY = 8_430_001;

// Each entry hashes the previous one, so editing or removing any row breaks every hash after it.
export async function appendAuditEvent(tx: Prisma.TransactionClient, event: AuditEventInput) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${CHAIN_LOCK_KEY})`;
  const previous = await tx.auditEvent.findFirst({ orderBy: { id: "desc" }, select: { hash: true } });
  const prevHash = previous?.hash ?? GENESIS_HASH;
  const occurredAt = new Date();
  const detail = event.detail ? JSON.stringify(event.detail) : null;
  const hash = createHash("sha256")
    .update(
      JSON.stringify([
        prevHash,
        occurredAt.toISOString(),
        event.actorId,
        event.action,
        event.targetType ?? null,
        event.targetId ?? null,
        detail,
      ]),
    )
    .digest("hex");

  await tx.auditEvent.create({
    data: {
      occurredAt,
      actorId: event.actorId,
      action: event.action,
      targetType: event.targetType,
      targetId: event.targetId,
      detail,
      prevHash,
      hash,
    },
  });
}

export function recordAuditEvent(event: AuditEventInput) {
  return prisma.$transaction((tx) => appendAuditEvent(tx, event));
}

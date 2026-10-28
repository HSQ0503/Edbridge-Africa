import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { appendAuditEvent } from "./audit";
import { encryptJson } from "./crypto";
import { prisma } from "./db";
import { inboxFor } from "./inboxes";
import { alertInboxStaff } from "./notify";

export type IntakeKind = "volunteer" | "contact" | "report" | "support-application";

const referencePrefixes: Record<IntakeKind, string> = {
  volunteer: "VOL",
  contact: "ENQ",
  report: "REP",
  "support-application": "APP",
};

function createReference(kind: IntakeKind) {
  const code = randomBytes(4).toString("hex").toUpperCase();
  return `EBA-${referencePrefixes[kind]}-${code.slice(0, 4)}-${code.slice(4)}`;
}

type IntakeResult = { ok: true; reference: string } | { ok: false };

export async function recordSubmission(kind: IntakeKind, data: Record<string, unknown>): Promise<IntakeResult> {
  const reference = createReference(kind);
  const inbox = inboxFor(kind, data);

  try {
    await prisma.$transaction(async (tx) => {
      // Safeguarding concerns live in their own schema under their own key (PLAN.md §8.5), even when routed
      // to a conflict inbox.
      if (kind === "report" && data.reportType === "safeguarding") {
        await tx.concern.create({
          data: {
            reference,
            inbox,
            anonymous: !data.fullName && !data.phone && !data.email,
            payload: encryptJson("safeguarding", data, reference),
          },
        });
      } else {
        await tx.submission.create({
          data: { reference, form: kind, inbox, payload: encryptJson("intake", data, reference) },
        });
      }
      await appendAuditEvent(tx, { actorId: null, action: "submission.received", targetType: inbox, targetId: reference });
    });
  } catch (error) {
    // Message only: submitted values can include children's details and must never reach logs.
    console.error(`[intake] could not store ${kind} submission: ${error instanceof Error ? error.message : "unknown error"}`);
    return { ok: false };
  }

  after(() => alertInboxStaff(inbox).catch(() => console.error("[notify] alert failed")));
  return { ok: true, reference };
}

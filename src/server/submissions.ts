import { appendAuditEvent, recordAuditEvent } from "./audit";
import { decryptJson } from "./crypto";
import { prisma } from "./db";
import { isIntakeKind, type Inbox, type SubmissionStatus } from "./inboxes";
import type { IntakeKind } from "./intake";
import type { Staff } from "./staff";

// Every function checks access itself rather than trusting the page that called it (PLAN.md §3.1).
function canOpen(staff: Staff, inbox: Inbox) {
  return staff.inboxes.includes(inbox);
}

// An inbox can hold both safeguarding concerns (their own schema and key) and ordinary submissions: a conflict
// inbox receives every kind of report about the person it protects.
export type SubmissionSummary = {
  reference: string;
  form: IntakeKind;
  status: SubmissionStatus;
  receivedAt: Date;
};

const LIST_LIMIT = 200;

export async function countNewByInbox(staff: Staff) {
  const where = { status: "new", inbox: { in: staff.inboxes } } as const;
  const [submissions, concerns] = await Promise.all([
    prisma.submission.groupBy({ by: ["inbox"], where, _count: true }),
    prisma.concern.groupBy({ by: ["inbox"], where, _count: true }),
  ]);
  const counts: Partial<Record<Inbox, number>> = {};
  for (const row of [...submissions, ...concerns]) counts[row.inbox] = (counts[row.inbox] ?? 0) + row._count;
  return counts;
}

export async function listSubmissions(staff: Staff, inbox: Inbox): Promise<SubmissionSummary[]> {
  if (!canOpen(staff, inbox)) return [];
  const query = {
    where: { inbox },
    orderBy: { receivedAt: "desc" },
    take: LIST_LIMIT,
  } as const;

  const [concerns, submissions] = await Promise.all([
    prisma.concern.findMany({ ...query, select: { reference: true, status: true, receivedAt: true } }),
    prisma.submission.findMany({ ...query, select: { reference: true, status: true, receivedAt: true, form: true } }),
  ]);
  return [
    ...concerns.map((concern) => ({ ...concern, form: "report" as const })),
    ...submissions.map((submission) => ({
      ...submission,
      form: isIntakeKind(submission.form) ? submission.form : "contact",
    })),
  ]
    .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())
    .slice(0, LIST_LIMIT);
}

export type SubmissionDetail = SubmissionSummary & {
  answers: Record<string, unknown>;
  safeguarding: boolean;
  anonymous?: boolean;
};

// Opening a record decrypts it, so every successful open is written to the audit log.
// A reference from another inbox is treated as missing, not forbidden.
export async function openSubmission(staff: Staff, inbox: Inbox, reference: string): Promise<SubmissionDetail | null> {
  if (!canOpen(staff, inbox)) return null;

  let detail: SubmissionDetail | null = null;
  const concern = await prisma.concern.findFirst({ where: { reference, inbox } });
  if (concern) {
    detail = {
      reference: concern.reference,
      form: "report",
      status: concern.status,
      receivedAt: concern.receivedAt,
      safeguarding: true,
      anonymous: concern.anonymous,
      answers: decryptJson("safeguarding", concern.payload, concern.reference) as Record<string, unknown>,
    };
  } else {
    const submission = await prisma.submission.findFirst({ where: { reference, inbox } });
    if (submission && isIntakeKind(submission.form)) {
      detail = {
        reference: submission.reference,
        form: submission.form,
        status: submission.status,
        receivedAt: submission.receivedAt,
        safeguarding: false,
        answers: decryptJson("intake", submission.payload, submission.reference) as Record<string, unknown>,
      };
    }
  }

  if (detail) await recordAuditEvent({ actorId: staff.id, action: "submission.viewed", targetType: inbox, targetId: reference });
  return detail;
}

export async function setSubmissionStatus(staff: Staff, inbox: Inbox, reference: string, status: SubmissionStatus) {
  if (!canOpen(staff, inbox)) return false;

  return prisma.$transaction(async (tx) => {
    const data = { status, updatedBy: staff.id };
    const concerns = await tx.concern.updateMany({ where: { reference, inbox }, data });
    const updated = concerns.count || (await tx.submission.updateMany({ where: { reference, inbox }, data })).count;
    if (!updated) return false;
    await appendAuditEvent(tx, {
      actorId: staff.id,
      action: "submission.status_changed",
      targetType: inbox,
      targetId: reference,
      detail: { status },
    });
    return true;
  });
}

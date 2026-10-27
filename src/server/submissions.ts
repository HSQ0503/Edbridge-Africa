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

export type SubmissionSummary = {
  reference: string;
  form: IntakeKind;
  status: SubmissionStatus;
  receivedAt: Date;
};

const LIST_LIMIT = 200;

export async function countNewByInbox(staff: Staff) {
  const counts: Partial<Record<Inbox, number>> = {};
  const grouped = await prisma.submission.groupBy({
    by: ["inbox"],
    where: { status: "new", inbox: { in: staff.inboxes.filter((inbox) => inbox !== "safeguarding") } },
    _count: true,
  });
  for (const row of grouped) counts[row.inbox] = row._count;
  if (canOpen(staff, "safeguarding")) counts.safeguarding = await prisma.concern.count({ where: { status: "new" } });
  return counts;
}

export async function listSubmissions(staff: Staff, inbox: Inbox): Promise<SubmissionSummary[]> {
  if (!canOpen(staff, inbox)) return [];
  const query = {
    select: { reference: true, status: true, receivedAt: true },
    orderBy: { receivedAt: "desc" },
    take: LIST_LIMIT,
  } as const;

  if (inbox === "safeguarding") {
    const concerns = await prisma.concern.findMany(query);
    return concerns.map((concern) => ({ ...concern, form: "report" }));
  }
  const submissions = await prisma.submission.findMany({ ...query, where: { inbox }, select: { ...query.select, form: true } });
  return submissions.map((submission) => ({
    ...submission,
    form: isIntakeKind(submission.form) ? submission.form : "contact",
  }));
}

export type SubmissionDetail = SubmissionSummary & { answers: Record<string, unknown>; anonymous?: boolean };

// Opening a record decrypts it, so every successful open is written to the audit log.
export async function openSubmission(staff: Staff, inbox: Inbox, reference: string): Promise<SubmissionDetail | null> {
  if (!canOpen(staff, inbox)) return null;

  let detail: SubmissionDetail | null = null;
  if (inbox === "safeguarding") {
    const concern = await prisma.concern.findUnique({ where: { reference } });
    if (concern) {
      detail = {
        reference: concern.reference,
        form: "report",
        status: concern.status,
        receivedAt: concern.receivedAt,
        anonymous: concern.anonymous,
        answers: decryptJson("safeguarding", concern.payload, concern.reference) as Record<string, unknown>,
      };
    }
  } else {
    const submission = await prisma.submission.findUnique({ where: { reference } });
    // A reference from another inbox is treated as missing, not forbidden.
    if (submission && submission.inbox === inbox && isIntakeKind(submission.form)) {
      detail = {
        reference: submission.reference,
        form: submission.form,
        status: submission.status,
        receivedAt: submission.receivedAt,
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
    const { count } =
      inbox === "safeguarding"
        ? await tx.concern.updateMany({ where: { reference }, data })
        : await tx.submission.updateMany({ where: { reference, inbox }, data });
    if (count === 0) return false;
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

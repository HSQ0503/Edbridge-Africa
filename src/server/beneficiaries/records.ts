import { randomBytes } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import type { AssistanceStatus, BeneficiaryStatus, CaseNoteKind, DecisionOutcome } from "@/generated/prisma/enums";
import { ageBands, beneficiaryCode, decisionOnlyStatuses, decisionStatus, exitStatuses, householdCode, isRegion } from "@/lib/beneficiaries";
import { priorityBand } from "@/lib/assessment-form";
import { appendAuditEvent, recordAuditEvent } from "../audit";
import { decryptJson, encryptJson } from "../crypto";
import { prisma } from "../db";
import type { Staff } from "../staff";
import { can } from "./access";

// Every function checks permission itself rather than trusting the page that called it (PLAN.md §3.1), and every read
// or change of a record is written to the audit log by id, never by name.

type Tx = Prisma.TransactionClient;

// UUIDv7 made here rather than by the database, so a row's own id can be bound into its ciphertext before insert.
export function newId() {
  const bytes = randomBytes(16);
  bytes.writeUIntBE(Date.now(), 0, 6);
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Free text is sealed to its beneficiary and row (`kind` names both, like "note:<id>"), so ciphertext can't be moved
// to another person's record or another row.
export function sealText(beneficiaryId: string, kind: string, value: unknown) {
  return encryptJson("beneficiary", value, `${beneficiaryId}:${kind}`);
}

export function openText<T>(beneficiaryId: string, kind: string, payload: string) {
  return decryptJson("beneficiary", payload, `${beneficiaryId}:${kind}`) as T;
}

export async function staffNames(ids: (string | null | undefined)[]) {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  const users = unique.length ? await prisma.user.findMany({ where: { id: { in: unique } }, select: { id: true, name: true } }) : [];
  const names = new Map(users.map((user) => [user.id, user.name]));
  return (id: string | null | undefined) => (id ? (names.get(id) ?? "A former staff member") : null);
}

// Staff who can be a beneficiary's case officer: anyone who works on records.
export function listCaseOfficers() {
  return prisma.user.findMany({
    where: { beneficiaryAccess: { some: { role: { in: ["registrar", "assessor", "approver"] } } } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export function listProgrammes({ activeOnly }: { activeOnly: boolean }) {
  return prisma.programme.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
    select: { id: true, name: true, active: true, _count: { select: { enrolments: true } } },
  });
}

// ─── List and search ─────────────────────────────────────────────────────────

export type BeneficiaryFilters = {
  query?: string;
  status?: BeneficiaryStatus;
  region?: string;
  gender?: string;
  ageBand?: string;
  programmeId?: string;
  priority?: string;
};

export const PAGE_SIZE = 50;

function dateYearsAgo(years: number, today = new Date()) {
  return new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
}

function filterWhere(filters: BeneficiaryFilters): Prisma.BeneficiaryWhereInput {
  const where: Prisma.BeneficiaryWhereInput = {};
  const query = filters.query?.trim();
  if (query) {
    where.OR = [
      { fullName: { contains: query, mode: "insensitive" } },
      { code: { contains: query, mode: "insensitive" } },
      { household: { code: { contains: query, mode: "insensitive" } } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.region) where.region = filters.region;
  if (filters.gender) where.gender = filters.gender;
  if (filters.programmeId) where.enrolments = { some: { programmeId: filters.programmeId } };
  const band = ageBands.find((candidate) => candidate.value === filters.ageBand);
  if (band) {
    // Age between min and max means born after (max + 1) years ago and on or before min years ago.
    where.dateOfBirth = { gt: dateYearsAgo(band.max + 1), lte: dateYearsAgo(band.min) };
  }
  if (filters.priority) {
    const bounds = { critical: [80, 100], high: [65, 79], moderate: [45, 64], lower: [0, 44] }[filters.priority];
    if (bounds) where.priorityScore = { gte: bounds[0], lte: bounds[1] };
  }
  return where;
}

export async function listBeneficiaries(staff: Staff, filters: BeneficiaryFilters, page = 1) {
  if (!can(staff, "view")) return { rows: [], total: 0 };
  const where = filterWhere(filters);
  const [rows, total] = await Promise.all([
    prisma.beneficiary.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        code: true,
        fullName: true,
        dateOfBirth: true,
        dobEstimated: true,
        gender: true,
        region: true,
        district: true,
        status: true,
        priorityScore: true,
      },
    }),
    prisma.beneficiary.count({ where }),
  ]);
  // The search text itself isn't logged: it is often a child's name.
  await recordAuditEvent({
    actorId: staff.id,
    action: "beneficiary.listed",
    targetType: "beneficiary",
    detail: {
      results: rows.length,
      searched: Boolean(filters.query?.trim()),
      filters: Object.entries(filters)
        .filter(([key, value]) => key !== "query" && value)
        .map(([key]) => key),
    },
  });
  return { rows, total };
}

// Spec: "Automated reminders for pending assessments and reviews".
export async function listReminders(staff: Staff) {
  if (!can(staff, "view")) return { drafts: [], reviews: [] };
  const today = new Date();
  const soon = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 7));
  const [drafts, reviews] = await Promise.all([
    can(staff, "assess")
      ? prisma.assessment.findMany({
          where: { status: "draft", assessedBy: staff.id },
          orderBy: { updatedAt: "asc" },
          take: 20,
          select: { id: true, updatedAt: true, beneficiary: { select: { id: true, code: true } } },
        })
      : [],
    prisma.caseNote.findMany({
      where: { nextReviewOn: { lte: soon }, beneficiary: { status: { notIn: exitStatuses } } },
      orderBy: { nextReviewOn: "asc" },
      take: 20,
      distinct: ["beneficiaryId"],
      select: { nextReviewOn: true, beneficiary: { select: { id: true, code: true, caseOfficerId: true } } },
    }),
  ]);
  // A review counts as done once a newer note exists without asking for another.
  const latest = await prisma.caseNote.findMany({
    where: { beneficiaryId: { in: reviews.map((review) => review.beneficiary.id) } },
    orderBy: { createdAt: "desc" },
    distinct: ["beneficiaryId"],
    select: { beneficiaryId: true, nextReviewOn: true },
  });
  const due = reviews.filter((review) =>
    latest.some((note) => note.beneficiaryId === review.beneficiary.id && note.nextReviewOn?.getTime() === review.nextReviewOn?.getTime()),
  );
  return { drafts, reviews: due };
}

// ─── Registration ────────────────────────────────────────────────────────────

export type HouseholdInput = {
  guardianName: string;
  guardianPhone?: string;
  guardianAltPhone?: string;
  guardianOccupation?: string;
  guardianEmployment?: string;
  guardianAddress?: string;
  emergencyContact?: string;
  primaryCaregiver?: string;
  membersCount?: number;
  dependantsCount?: number;
  childrenCount?: number;
  childrenInSchool?: number;
  childrenOutOfSchool?: number;
  incomeSource?: string;
  incomeRange?: string;
  housing?: string;
  circumstances: string[];
  circumstancesOther?: string;
};

export type BeneficiaryInput = {
  fullName: string;
  dateOfBirth: Date;
  dobEstimated: boolean;
  gender: string;
  nationality?: string;
  region: string;
  district?: string;
  community?: string;
  residentialLocation?: string;
  contactNumber?: string;
  categories: string[];
  categoryOther?: string;
  referralSource?: string;
  consentDate: Date;
  consentMethod: string;
  childAssent?: string;
  guardianRelationship?: string;
  caseOfficerId?: string;
};

// Same name and either the same date of birth or the same community: worth a second look before registering.
export function findPossibleDuplicates(input: Pick<BeneficiaryInput, "fullName" | "dateOfBirth" | "community">, excludeId?: string) {
  const sameName = { fullName: { equals: input.fullName.trim(), mode: "insensitive" as const } };
  return prisma.beneficiary.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      OR: [
        { ...sameName, dateOfBirth: input.dateOfBirth },
        ...(input.community ? [{ ...sameName, community: { equals: input.community.trim(), mode: "insensitive" as const } }] : []),
      ],
    },
    take: 5,
    select: { id: true, code: true },
  });
}

export function findHousehold(code: string) {
  return prisma.household.findUnique({ where: { code: code.trim().toUpperCase() }, select: { id: true, code: true } });
}

async function nextNumber(tx: Tx, table: "beneficiary" | "household") {
  const [{ next }] = await tx.$queryRawUnsafe<{ next: bigint }[]>(
    `SELECT nextval(pg_get_serial_sequence('app.${table}', 'number')) AS next`,
  );
  return Number(next);
}

export async function recordStatusChange(
  tx: Tx,
  staff: Staff,
  beneficiaryId: string,
  fromStatus: BeneficiaryStatus | null,
  toStatus: BeneficiaryStatus,
  details: Record<string, string>,
) {
  const id = newId();
  await tx.statusChange.create({
    data: { id, beneficiaryId, fromStatus, toStatus, changedBy: staff.id, details: sealText(beneficiaryId, `status:${id}`, details) },
  });
  await appendAuditEvent(tx, {
    actorId: staff.id,
    action: "beneficiary.status_changed",
    targetType: "beneficiary",
    targetId: beneficiaryId,
    detail: { from: fromStatus ?? "none", to: toStatus },
  });
}

export async function registerBeneficiary(
  staff: Staff,
  input: BeneficiaryInput,
  household: { existingId: string } | { create: HouseholdInput } | null,
) {
  if (!can(staff, "register") || !isRegion(input.region)) throw new Error("Not allowed");
  return prisma.$transaction(async (tx) => {
    let householdId: string | null = null;
    if (household && "existingId" in household) householdId = household.existingId;
    if (household && "create" in household) {
      const number = await nextNumber(tx, "household");
      const created = await tx.household.create({
        data: { ...household.create, number, code: householdCode(number), createdBy: staff.id },
        select: { id: true },
      });
      householdId = created.id;
      await appendAuditEvent(tx, { actorId: staff.id, action: "household.created", targetType: "household", targetId: created.id });
    }

    const number = await nextNumber(tx, "beneficiary");
    const registeredAt = new Date();
    const beneficiary = await tx.beneficiary.create({
      data: {
        ...input,
        number,
        code: beneficiaryCode(input.region as Parameters<typeof beneficiaryCode>[0], registeredAt, number),
        householdId,
        createdAt: registeredAt,
        createdBy: staff.id,
      },
      select: { id: true },
    });
    await appendAuditEvent(tx, { actorId: staff.id, action: "beneficiary.created", targetType: "beneficiary", targetId: beneficiary.id });
    await recordStatusChange(tx, staff, beneficiary.id, null, "newly_registered", {});
    return beneficiary.id;
  });
}

function changedFields<T extends Record<string, unknown>>(before: T, after: Partial<T>) {
  return Object.keys(after).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
}

export async function updateBeneficiary(
  staff: Staff,
  id: string,
  input: BeneficiaryInput,
  household: { existingId: string } | { create: HouseholdInput } | { update: HouseholdInput } | null,
) {
  if (!can(staff, "register")) return false;
  const before = await prisma.beneficiary.findUnique({ where: { id }, include: { household: true } });
  if (!before) return false;

  await prisma.$transaction(async (tx) => {
    let householdId = before.householdId;
    if (household && "existingId" in household) householdId = household.existingId;
    if (household && "create" in household) {
      const number = await nextNumber(tx, "household");
      householdId = (
        await tx.household.create({
          data: { ...household.create, number, code: householdCode(number), createdBy: staff.id },
          select: { id: true },
        })
      ).id;
      await appendAuditEvent(tx, { actorId: staff.id, action: "household.created", targetType: "household", targetId: householdId });
    }
    if (household && "update" in household && before.household) {
      const fields = changedFields(before.household, household.update);
      if (fields.length) {
        await tx.household.update({ where: { id: before.household.id }, data: { ...household.update, updatedBy: staff.id } });
        await appendAuditEvent(tx, {
          actorId: staff.id,
          action: "household.updated",
          targetType: "household",
          targetId: before.household.id,
          detail: { fields },
        });
      }
    }

    const fields = changedFields(before, { ...input, householdId });
    await tx.beneficiary.update({ where: { id }, data: { ...input, householdId, updatedBy: staff.id } });
    await appendAuditEvent(tx, { actorId: staff.id, action: "beneficiary.updated", targetType: "beneficiary", targetId: id, detail: { fields } });
  });
  return true;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export type StatusDetails = { reason?: string; outcomes?: string; outstandingNeeds?: string; followUp?: string; alumniConsent?: string };

// Opening the edit form shows the whole record, so it's audited like any other view; saving reads it again unaudited.
export async function getBeneficiaryForEdit(staff: Staff, id: string, { audit }: { audit: boolean }) {
  if (!can(staff, "register")) return null;
  const record = await prisma.beneficiary.findUnique({ where: { id }, include: { household: true } });
  if (record && audit) {
    await recordAuditEvent({ actorId: staff.id, action: "beneficiary.viewed", targetType: "beneficiary", targetId: id, detail: { for: "edit" } });
  }
  return record;
}

export async function openBeneficiary(staff: Staff, id: string) {
  if (!can(staff, "view")) return null;
  const record = await prisma.beneficiary.findUnique({
    where: { id },
    include: {
      household: {
        include: {
          beneficiaries: { where: { id: { not: id } }, select: { id: true, code: true, fullName: true, status: true } },
        },
      },
      assessments: {
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, totalScore: true, recommendation: true, safeguardingFlag: true, assessedBy: true, createdAt: true, submittedAt: true },
      },
      decisions: { orderBy: { decidedAt: "desc" } },
      statusChanges: { orderBy: { changedAt: "desc" } },
      notes: { orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }] },
      enrolments: { include: { programme: { select: { id: true, name: true } } }, orderBy: { enrolledAt: "asc" } },
      assistance: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!record) return null;

  const nameOf = await staffNames([
    record.caseOfficerId,
    record.createdBy,
    ...record.assessments.map((assessment) => assessment.assessedBy),
    ...record.decisions.map((decision) => decision.decidedBy),
    ...record.statusChanges.map((change) => change.changedBy),
    ...record.notes.map((note) => note.createdBy),
    ...record.assistance.flatMap((item) => [item.createdBy, item.authorizedBy]),
    ...record.enrolments.map((enrolment) => enrolment.enrolledBy),
  ]);

  await recordAuditEvent({ actorId: staff.id, action: "beneficiary.viewed", targetType: "beneficiary", targetId: id });
  return {
    ...record,
    nameOf,
    decisions: record.decisions.map((decision) => ({ ...decision, reason: openText<string>(id, `decision:${decision.id}`, decision.reason) })),
    statusChanges: record.statusChanges.map((change) => ({
      ...change,
      details: change.details ? openText<StatusDetails>(id, `status:${change.id}`, change.details) : {},
    })),
    notes: record.notes.map((note) => ({ ...note, body: openText<string>(id, `note:${note.id}`, note.body) })),
  };
}

// ─── Decisions, status, notes, programmes, assistance ────────────────────────

export type ActionResult = { ok: true } | { ok: false; error: string; field?: string };

export async function recordDecision(staff: Staff, id: string, outcome: DecisionOutcome, reason: string): Promise<ActionResult> {
  if (!can(staff, "decide")) return { ok: false, error: "Not allowed" };
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id },
    select: {
      status: true,
      assessments: { where: { status: "submitted" }, orderBy: { submittedAt: "desc" }, take: 1, select: { id: true, assessedBy: true, totalScore: true } },
    },
  });
  if (!beneficiary) return { ok: false, error: "Not found" };
  const assessment = beneficiary.assessments[0];
  if (!assessment) return { ok: false, error: "Submit an assessment before recording a decision", field: "outcome" };
  // Separation of duties (PLAN.md §4.4): the assessor can't approve their own recommendation.
  if (assessment.assessedBy === staff.id) {
    return { ok: false, error: "You completed the latest assessment, so another approver must make this decision", field: "outcome" };
  }

  const band = assessment.totalScore === null ? null : priorityBand(assessment.totalScore).value;
  const isOverride =
    (outcome === "approved" && band === "lower") || (outcome === "not_selected" && (band === "critical" || band === "high"));
  const toStatus = decisionStatus[outcome];

  await prisma.$transaction(async (tx) => {
    const decisionId = newId();
    const decision = await tx.selectionDecision.create({
      data: {
        id: decisionId,
        beneficiaryId: id,
        assessmentId: assessment.id,
        outcome,
        reason: sealText(id, `decision:${decisionId}`, reason),
        scoreAtDecision: assessment.totalScore,
        isOverride,
        decidedBy: staff.id,
      },
      select: { id: true },
    });
    await appendAuditEvent(tx, {
      actorId: staff.id,
      action: "beneficiary.decision_recorded",
      targetType: "beneficiary",
      targetId: id,
      detail: { decision: decision.id, outcome, override: isOverride },
    });
    if (beneficiary.status !== toStatus) {
      await tx.beneficiary.update({ where: { id }, data: { status: toStatus, updatedBy: staff.id } });
      await recordStatusChange(tx, staff, id, beneficiary.status, toStatus, { reason: `Selection decision: ${reason}` });
    }
  });
  return { ok: true };
}

export async function changeStatus(staff: Staff, id: string, toStatus: BeneficiaryStatus, details: StatusDetails): Promise<ActionResult> {
  if (!can(staff, "decide")) return { ok: false, error: "Not allowed" };
  // Selection outcomes only come from a recorded decision, which carries the assessor ≠ approver check.
  if (decisionOnlyStatuses.includes(toStatus)) {
    return { ok: false, error: "Record a selection decision to approve, wait-list or not select someone", field: "status" };
  }
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id },
    select: { status: true, decisions: { where: { outcome: "approved" }, select: { id: true }, take: 1 } },
  });
  if (!beneficiary) return { ok: false, error: "Not found" };
  if (beneficiary.status === toStatus) return { ok: false, error: "Choose a different status", field: "status" };
  if (toStatus === "active" && beneficiary.decisions.length === 0) {
    return { ok: false, error: "Only someone approved for support can become an active beneficiary", field: "status" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.beneficiary.update({ where: { id }, data: { status: toStatus, updatedBy: staff.id } });
    await recordStatusChange(
      tx,
      staff,
      id,
      beneficiary.status,
      toStatus,
      Object.fromEntries(Object.entries(details).filter(([, value]) => value)) as Record<string, string>,
    );
  });
  return { ok: true };
}

export async function addCaseNote(
  staff: Staff,
  id: string,
  note: { kind: CaseNoteKind; body: string; occurredOn: Date; nextReviewOn?: Date },
): Promise<ActionResult> {
  if (!can(staff, "note")) return { ok: false, error: "Not allowed" };
  if (!(await prisma.beneficiary.count({ where: { id } }))) return { ok: false, error: "Not found" };
  await prisma.$transaction(async (tx) => {
    const noteId = newId();
    const created = await tx.caseNote.create({
      data: { ...note, id: noteId, beneficiaryId: id, body: sealText(id, `note:${noteId}`, note.body), createdBy: staff.id },
      select: { id: true },
    });
    await appendAuditEvent(tx, {
      actorId: staff.id,
      action: "beneficiary.note_added",
      targetType: "beneficiary",
      targetId: id,
      detail: { note: created.id, kind: note.kind },
    });
  });
  return { ok: true };
}

export async function setProgrammes(staff: Staff, id: string, programmeIds: string[]): Promise<ActionResult> {
  if (!can(staff, "decide")) return { ok: false, error: "Not allowed" };
  const current = await prisma.programmeEnrolment.findMany({ where: { beneficiaryId: id }, select: { programmeId: true } });
  const currentIds = current.map((enrolment) => enrolment.programmeId);
  const added = programmeIds.filter((programmeId) => !currentIds.includes(programmeId));
  const removed = currentIds.filter((programmeId) => !programmeIds.includes(programmeId));
  // Only active programmes can be joined; leaving an inactive one is fine.
  if (added.length && (await prisma.programme.count({ where: { id: { in: added }, active: true } })) !== added.length) {
    return { ok: false, error: "Choose from the programmes shown", field: "programmes" };
  }
  await prisma.$transaction(async (tx) => {
    await tx.programmeEnrolment.deleteMany({ where: { beneficiaryId: id, programmeId: { in: removed } } });
    await tx.programmeEnrolment.createMany({ data: added.map((programmeId) => ({ beneficiaryId: id, programmeId, enrolledBy: staff.id })) });
    await appendAuditEvent(tx, {
      actorId: staff.id,
      action: "beneficiary.programmes_changed",
      targetType: "beneficiary",
      targetId: id,
      detail: { added, removed },
    });
  });
  return { ok: true };
}

export type AssistanceInput = {
  category: string;
  description?: string;
  valuePesewas?: number;
  fundingSource?: string;
  status: AssistanceStatus;
  approvedOn?: Date;
  providedOn?: Date;
};

// Calendar dates are stored as UTC midnight.
function today() {
  return new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
}

// Recording a request is open to assessors; approving or delivering assistance needs an approver, who is recorded.
function needsApprover(status: AssistanceStatus) {
  return status === "approved" || status === "delivered";
}

export async function addAssistance(staff: Staff, id: string, input: AssistanceInput): Promise<ActionResult> {
  if (!can(staff, "recordAssistance")) return { ok: false, error: "Not allowed" };
  if (needsApprover(input.status) && !can(staff, "approveAssistance")) {
    return { ok: false, error: "Only an approver can record approved or delivered assistance", field: "status" };
  }
  if (!(await prisma.beneficiary.count({ where: { id } }))) return { ok: false, error: "Not found" };
  await prisma.$transaction(async (tx) => {
    const created = await tx.assistanceRecord.create({
      data: {
        ...input,
        beneficiaryId: id,
        authorizedBy: needsApprover(input.status) ? staff.id : null,
        // Dates default to today when the record is created already approved or delivered.
        approvedOn: input.approvedOn ?? (needsApprover(input.status) ? today() : undefined),
        providedOn: input.providedOn ?? (input.status === "delivered" ? today() : undefined),
        createdBy: staff.id,
      },
      select: { id: true },
    });
    await appendAuditEvent(tx, {
      actorId: staff.id,
      action: "beneficiary.assistance_added",
      targetType: "beneficiary",
      targetId: id,
      detail: { assistance: created.id, status: input.status },
    });
  });
  return { ok: true };
}

export async function updateAssistanceStatus(staff: Staff, id: string, assistanceId: string, status: AssistanceStatus): Promise<ActionResult> {
  if (!can(staff, "recordAssistance")) return { ok: false, error: "Not allowed" };
  if (needsApprover(status) && !can(staff, "approveAssistance")) {
    return { ok: false, error: "Only an approver can approve or deliver assistance" };
  }
  const record = await prisma.assistanceRecord.findFirst({
    where: { id: assistanceId, beneficiaryId: id },
    select: { status: true, approvedOn: true, providedOn: true },
  });
  if (!record) return { ok: false, error: "Not found" };
  // Undoing an approval is an approver's call too.
  if (needsApprover(record.status) && !can(staff, "approveAssistance")) {
    return { ok: false, error: "Only an approver can change approved or delivered assistance" };
  }
  await prisma.$transaction(async (tx) => {
    await tx.assistanceRecord.update({
      where: { id: assistanceId },
      data: {
        status,
        updatedBy: staff.id,
        authorizedBy: needsApprover(status) ? staff.id : null,
        ...(needsApprover(status) && !record.approvedOn && { approvedOn: today() }),
        ...(status === "delivered" && !record.providedOn && { providedOn: today() }),
      },
    });
    await appendAuditEvent(tx, {
      actorId: staff.id,
      action: "beneficiary.assistance_status_changed",
      targetType: "beneficiary",
      targetId: id,
      detail: { assistance: assistanceId, status },
    });
  });
  return { ok: true };
}

// ─── Programmes ──────────────────────────────────────────────────────────────

export async function saveProgramme(staff: Staff, programme: { id?: string; name: string; active: boolean }): Promise<ActionResult> {
  if (!can(staff, "manageProgrammes")) return { ok: false, error: "Not allowed" };
  const clash = await prisma.programme.findFirst({
    where: { name: { equals: programme.name, mode: "insensitive" }, id: programme.id ? { not: programme.id } : undefined },
    select: { id: true },
  });
  if (clash) return { ok: false, error: "There is already a programme with this name", field: "name" };
  const saved = programme.id
    ? await prisma.programme.update({ where: { id: programme.id }, data: { name: programme.name, active: programme.active }, select: { id: true } })
    : await prisma.programme.create({ data: { name: programme.name, active: programme.active }, select: { id: true } });
  await recordAuditEvent({
    actorId: staff.id,
    action: programme.id ? "programme.updated" : "programme.created",
    targetType: "programme",
    targetId: saved.id,
    detail: { name: programme.name, active: programme.active },
  });
  return { ok: true };
}

export { exitStatuses };

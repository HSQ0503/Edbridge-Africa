import type { Prisma } from "@/generated/prisma/client";
import { ageBands, ageOn, assistanceCategories, formatGhs, assistanceStatusLabels, genderLabels, regionOptions, statusLabels } from "@/lib/beneficiaries";
import { educationStatuses, priorityBand, priorityBands } from "@/lib/assessment-form";
import { recordAuditEvent } from "../audit";
import { prisma } from "../db";
import type { Staff } from "../staff";
import { can } from "./access";

// Aggregates only: no names, IDs or free text (PLAN.md §13). Staff who can't open records see counts under 5 as "<5",
// so a child can't be picked out of a small group.
export type ReportFilters = { region?: string; programmeId?: string; from?: Date; to?: Date };
export type ReportRow = { label: string; count: number };
export type ReportTable = { title: string; rows: ReportRow[]; valueLabel?: string };

export const SMALL_CELL = 5;

// Educational statuses that count as out of school (BMS indicator: children returned to school).
const OUT_OF_SCHOOL = ["out_of_school", "never_enrolled", "dropped_out"];

function tally<T>(items: T[], keyOf: (item: T) => string | null, labels: { value: string; label: string }[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item) ?? "";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const rows = labels.map(({ value, label }) => ({ label, count: counts.get(value) ?? 0 }));
  const unknown = [...counts.entries()].filter(([key]) => !labels.some((option) => option.value === key)).reduce((sum, [, count]) => sum + count, 0);
  if (unknown) rows.push({ label: "Not recorded", count: unknown });
  return rows;
}

const options = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));

export async function buildReport(staff: Staff, filters: ReportFilters, { audit = true } = {}) {
  if (!can(staff, "viewReports")) return null;
  const where: Prisma.BeneficiaryWhereInput = {};
  if (filters.region) where.region = filters.region;
  if (filters.programmeId) where.enrolments = { some: { programmeId: filters.programmeId } };
  if (filters.from || filters.to) where.createdAt = { gte: filters.from, lt: filters.to };

  const [beneficiaries, programmes, assistance] = await Promise.all([
    prisma.beneficiary.findMany({
      where,
      select: {
        status: true,
        gender: true,
        region: true,
        dateOfBirth: true,
        educationStatus: true,
        priorityScore: true,
        accessibilityNeeds: true,
        assessments: { where: { status: "submitted" }, select: { id: true }, take: 1 },
        decisions: { where: { outcome: "approved" }, select: { id: true }, take: 1 },
      },
    }),
    prisma.programme.findMany({
      orderBy: { name: "asc" },
      select: { name: true, _count: { select: { enrolments: { where: { beneficiary: where } } } } },
    }),
    prisma.assistanceRecord.findMany({ where: { beneficiary: where }, select: { category: true, status: true, valuePesewas: true } }),
  ]);

  const today = new Date();
  const delivered = assistance.filter((item) => item.status === "delivered");
  const totals = {
    registered: beneficiaries.length,
    assessed: beneficiaries.filter((item) => item.assessments.length > 0).length,
    approved: beneficiaries.filter((item) => item.decisions.length > 0).length,
    active: beneficiaries.filter((item) => item.status === "active").length,
    accessibilityNeeds: beneficiaries.filter((item) => item.accessibilityNeeds).length,
    outOfSchool: beneficiaries.filter((item) => item.educationStatus && OUT_OF_SCHOOL.includes(item.educationStatus)).length,
    graduated: beneficiaries.filter((item) => item.status === "graduated").length,
    deliveredCount: delivered.length,
    deliveredValuePesewas: delivered.reduce((sum, item) => sum + (item.valuePesewas ?? 0), 0),
  };

  const tables: ReportTable[] = [
    { title: "By status", rows: tally(beneficiaries, (item) => item.status, options(statusLabels)) },
    { title: "By region", rows: tally(beneficiaries, (item) => item.region, regionOptions).filter((row) => row.count > 0) },
    { title: "By gender", rows: tally(beneficiaries, (item) => item.gender, options(genderLabels)) },
    {
      title: "By age",
      rows: tally(
        beneficiaries,
        (item) => {
          const age = ageOn(item.dateOfBirth, today);
          return ageBands.find((band) => age >= band.min && age <= band.max)?.value ?? null;
        },
        ageBands.map(({ value, label }) => ({ value, label })),
      ),
    },
    {
      title: "By educational status (latest assessment)",
      rows: tally(beneficiaries, (item) => item.educationStatus, educationStatuses),
    },
    {
      title: "By priority band (latest assessment)",
      rows: tally(
        beneficiaries,
        (item) => (item.priorityScore === null ? null : priorityBand(item.priorityScore).value),
        priorityBands.map(({ value, label }) => ({ value, label })),
      ),
    },
    { title: "Programme participation", rows: programmes.map((programme) => ({ label: programme.name, count: programme._count.enrolments })) },
    {
      title: "Assistance records by type",
      rows: tally(assistance, (item) => item.category, assistanceCategories).filter((row) => row.count > 0),
    },
    { title: "Assistance records by status", rows: tally(assistance, (item) => item.status, options(assistanceStatusLabels)) },
  ];

  // Records staff already see names, so suppression would only hide numbers from them.
  const suppress = !can(staff, "view");
  if (audit) {
    await recordAuditEvent({
      actorId: staff.id,
      action: "beneficiary.report_viewed",
      targetType: "report",
      detail: { suppressed: suppress, filters: Object.keys(filters).filter((key) => filters[key as keyof ReportFilters]) },
    });
  }
  return { totals, tables, suppress };
}

// A money total over a handful of records could reveal what one child received.
export function showMoney(pesewas: number, records: number, suppress: boolean) {
  return suppress && records > 0 && records < SMALL_CELL ? `Hidden (fewer than ${SMALL_CELL} records)` : formatGhs(pesewas);
}

export function showCount(count: number, suppress: boolean) {
  return suppress && count > 0 && count < SMALL_CELL ? `<${SMALL_CELL}` : count.toLocaleString("en-GH");
}


import { getStaff } from "@/server/staff";
import { can } from "@/server/beneficiaries/access";
import { recordAuditEvent } from "@/server/audit";
import { prisma } from "@/server/db";
import { buildReport, showCount, showMoney } from "@/server/beneficiaries/reports";
import { readReportFilters } from "../filters";

// Opens in Excel or Google Sheets. Aggregates only, like the page, and every download is audited.
const cell = (value: string | number) => {
  const text = String(value);
  // Quote everything, and stop a spreadsheet from treating text as a formula.
  return `"${(/^[=+\-@\t\r]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
};

function notFound() {
  return new Response("Not found", { status: 404 });
}

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff?.mfaEnabled || !can(staff, "viewReports")) return notFound();
  const filters = readReportFilters(Object.fromEntries(new URL(request.url).searchParams));
  const report = await buildReport(staff, filters, { audit: false });
  if (!report) return notFound();

  const { totals, tables, suppress } = report;
  const programmeName = filters.programmeId
    ? (await prisma.programme.findUnique({ where: { id: filters.programmeId }, select: { name: true } }))?.name
    : undefined;
  const lines: (string | number)[][] = [
    ["EdBridge Africa beneficiary report", new Date().toISOString().slice(0, 10)],
    [
      "Filters",
      [
        filters.region && `region: ${filters.region}`,
        filters.programmeId && `programme: ${programmeName ?? filters.programmeId}`,
        filters.from && `registered from ${filters.from.toISOString().slice(0, 10)}`,
        filters.to && `to ${new Date(filters.to.getTime() - 1).toISOString().slice(0, 10)}`,
      ]
        .filter(Boolean)
        .join("; ") || "none",
    ],
    [],
    ["Summary", "Count"],
    ["Registered", showCount(totals.registered, suppress)],
    ["Assessed", showCount(totals.assessed, suppress)],
    ["Approved for support", showCount(totals.approved, suppress)],
    ["Active beneficiaries", showCount(totals.active, suppress)],
    ["Out of school when assessed", showCount(totals.outOfSchool, suppress)],
    ["Needing accessibility support", showCount(totals.accessibilityNeeds, suppress)],
    ["Graduated", showCount(totals.graduated, suppress)],
    ["Assistance delivered", showMoney(totals.deliveredValuePesewas, totals.deliveredCount, suppress)],
    ...tables.flatMap((table) => [[], [table.title, "Count"], ...table.rows.map((row) => [row.label, showCount(row.count, suppress)])]),
  ];
  await recordAuditEvent({ actorId: staff.id, action: "beneficiary.report_exported", targetType: "report", detail: { suppressed: suppress, filters: Object.keys(filters).filter((key) => filters[key as keyof typeof filters]) } });

  return new Response(`﻿${lines.map((line) => line.map(cell).join(",")).join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="edbridge-beneficiary-report-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

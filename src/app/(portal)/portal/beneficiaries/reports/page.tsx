import type { Metadata } from "next";
import { buttonClass } from "@/components/button-link";
import { regionOptions } from "@/lib/beneficiaries";
import { requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { listProgrammes } from "@/server/beneficiaries/records";
import { buildReport, showCount, showMoney, SMALL_CELL } from "@/server/beneficiaries/reports";
import { StaffBar } from "../../staff-bar";
import { readReportFilters } from "./filters";

export const instant = false;

export const metadata: Metadata = { title: "Beneficiary reports" };

const fieldClass =
  "mt-2 block min-h-12 w-full rounded-lg border border-field bg-surface px-3 py-2.5 text-ink transition-colors duration-150 hover:border-ink";

export default async function ReportsPage({ searchParams }: PageProps<"/portal/beneficiaries/reports">) {
  const staff = await requireBeneficiaryPermission("viewReports");
  const params = await searchParams;
  const filters = readReportFilters(params);
  const [report, programmes] = await Promise.all([buildReport(staff, filters), listProgrammes({ activeOnly: false })]);
  if (!report) return null;
  const { totals, tables, suppress } = report;
  const query = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1] !== ""),
  ).toString();

  const stats: [string, string][] = [
    ["Registered", showCount(totals.registered, suppress)],
    ["Assessed", showCount(totals.assessed, suppress)],
    ["Approved for support", showCount(totals.approved, suppress)],
    ["Active beneficiaries", showCount(totals.active, suppress)],
    ["Out of school when assessed", showCount(totals.outOfSchool, suppress)],
    ["Needing accessibility support", showCount(totals.accessibilityNeeds, suppress)],
    ["Graduated", showCount(totals.graduated, suppress)],
    ["Assistance delivered", showMoney(totals.deliveredValuePesewas, totals.deliveredCount, suppress)],
  ];

  return (
    <>
      <StaffBar staff={staff} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Beneficiary reports</h1>
        <a href={`/portal/beneficiaries/reports/export${query ? `?${query}` : ""}`} className={buttonClass("secondary")}>
          Download as a spreadsheet (CSV)
        </a>
      </div>
      <p className="mt-3 max-w-3xl text-muted">
        Totals only, with no names or IDs.{" "}
        {suppress
          ? `Counts from 1 to ${SMALL_CELL - 1} show as “<${SMALL_CELL}” so nobody can be identified from a small group.`
          : "Use your browser's print option to save a PDF."}{" "}
        Safeguarding records are never included.
      </p>

      <form className="mt-6 grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_1fr_auto_auto_auto] lg:items-end print:hidden">
        <div>
          <label htmlFor="region" className="block font-medium">
            Region
          </label>
          <select id="region" name="region" defaultValue={filters.region ?? ""} className={`${fieldClass} cursor-pointer`}>
            <option value="">All regions</option>
            {regionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="programme" className="block font-medium">
            Programme
          </label>
          <select id="programme" name="programme" defaultValue={filters.programmeId ?? ""} className={`${fieldClass} cursor-pointer`}>
            <option value="">All programmes</option>
            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="block font-medium">
            Registered from
          </label>
          <input id="from" name="from" type="date" defaultValue={typeof params.from === "string" ? params.from : ""} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="to" className="block font-medium">
            to
          </label>
          <input id="to" name="to" type="date" defaultValue={typeof params.to === "string" ? params.to : ""} className={fieldClass} />
        </div>
        <button type="submit" className={buttonClass("primary", "cursor-pointer")}>
          Show
        </button>
      </form>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-surface p-5">
            <dt className="text-base text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {tables.map((table) => {
          const total = table.rows.reduce((sum, row) => sum + row.count, 0);
          return (
            <section key={table.title} aria-labelledby={`table-${table.title}`}>
              <h2 id={`table-${table.title}`} className="text-xl font-bold">
                {table.title}
              </h2>
              {table.rows.length === 0 || total === 0 ? (
                <p className="mt-3 text-muted">Nothing recorded yet.</p>
              ) : (
                <table className="mt-3 w-full text-left text-base">
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        <span className="sr-only">Category</span>
                      </th>
                      <th scope="col" className="w-20 py-2 text-right font-semibold">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row) => (
                      <tr key={row.label} className="border-b border-line">
                        <th scope="row" className="py-2 pr-4 font-normal">
                          <span className="block">{row.label}</span>
                          {/* A plain bar for scanning; the number beside it is the data. */}
                          <span aria-hidden="true" className="mt-1 block h-1.5 rounded-full bg-brand-tint">
                            <span className="block h-full rounded-full bg-brand" style={{ width: `${total ? (row.count / total) * 100 : 0}%` }} />
                          </span>
                        </th>
                        <td className="py-2 text-right tabular-nums">{showCount(row.count, suppress)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

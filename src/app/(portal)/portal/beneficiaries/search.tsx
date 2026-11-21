"use client";

import Link from "next/link";
import { useActionState } from "react";
import { buttonClass } from "@/components/button-link";
import { ageBands, genderLabels, genderOptions, regionOptions, statusLabels, statusOptions } from "@/lib/beneficiaries";
import { priorityBand, priorityBands } from "@/lib/assessment-form";
import { searchAction, type SearchState } from "./actions";

const selectClass =
  "mt-2 block min-h-12 w-full cursor-pointer rounded-lg border border-field bg-surface px-3 py-2.5 text-ink transition-colors duration-150 hover:border-ink";

function Filter({ name, label, options }: { name: string; label: string; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label htmlFor={`filter-${name}`} className="block font-medium">
        {label}
      </label>
      <select id={`filter-${name}`} name={name} defaultValue="" className={selectClass}>
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function BeneficiarySearch({ initial, programmes }: { initial: SearchState; programmes: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(searchAction, initial);
  const filtered = Object.keys(state.filters).length > 0;

  return (
    <>
      <search>
        <form action={action} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="filter-query" className="block font-medium">
                Name, beneficiary ID or household number
              </label>
              <input
                id="filter-query"
                name="query"
                type="search"
                autoComplete="off"
                className="mt-2 block min-h-12 w-full rounded-lg border border-field bg-surface px-3 py-2.5 text-ink transition-colors duration-150 hover:border-ink"
              />
            </div>
            <button type="submit" disabled={pending} className={buttonClass("primary", "cursor-pointer disabled:opacity-70")}>
              {pending ? "Searching…" : "Search"}
            </button>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold text-brand underline">Filter by status, place, age or programme</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Filter name="status" label="Status" options={statusOptions} />
              <Filter name="region" label="Region" options={regionOptions} />
              <Filter name="gender" label="Gender" options={genderOptions} />
              <Filter name="ageBand" label="Age" options={ageBands.map(({ value, label }) => ({ value, label }))} />
              <Filter name="programmeId" label="Programme" options={programmes.map(({ id, name }) => ({ value: id, label: name }))} />
              <Filter name="priority" label="Priority" options={priorityBands.map(({ value, label }) => ({ value, label }))} />
            </div>
          </details>
        </form>
      </search>

      <p role="status" className="mt-6 text-base text-muted">
        {state.total === 0
          ? filtered
            ? "No beneficiaries match. Try fewer filters or check the spelling."
            : ""
          : `Showing ${state.rows.length} of ${state.total} ${filtered ? "matching " : ""}beneficiar${state.total === 1 ? "y" : "ies"}, newest first`}
      </p>

      {state.rows.length > 0 && (
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
          {state.rows.map((row) => (
            <li key={row.id}>
              {/* No prefetch: opening a record is audited, so it must only happen on a real click. */}
              <Link
                href={`/portal/beneficiaries/${row.id}`}
                prefetch={false}
                className="grid gap-1 p-4 text-ink no-underline transition-colors duration-200 hover:bg-brand-tint sm:grid-cols-[1fr_auto] sm:items-center sm:gap-x-6 sm:p-5"
              >
                <span>
                  <span className="block font-semibold underline">{row.fullName}</span>
                  <span className="block text-base text-muted">
                    <span className="font-mono">{row.code}</span> · {row.age}
                    {row.dobEstimated && " (est.)"} · {genderLabels[row.gender] ?? row.gender} · {row.district ? `${row.district}, ` : ""}
                    {row.region}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-2 text-base sm:justify-end">
                  {row.priorityScore !== null && (
                    <span className="text-muted">
                      Score {row.priorityScore} · {priorityBand(row.priorityScore).label}
                    </span>
                  )}
                  <span className="inline-flex rounded-full bg-brand-tint px-3 py-0.5 text-sm font-semibold text-ink">{statusLabels[row.status]}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {state.rows.length < state.total && (
        <form action={action} className="mt-4">
          <input type="hidden" name="intent" value="more" />
          <button type="submit" disabled={pending} className={buttonClass("secondary", "cursor-pointer disabled:opacity-70")}>
            {pending ? "Loading…" : "Show more"}
          </button>
        </form>
      )}
    </>
  );
}

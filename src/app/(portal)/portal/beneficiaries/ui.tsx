import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Notice } from "@/components/notice";
import type { BeneficiaryStatus } from "@/generated/prisma/enums";
import { statusLabels } from "@/lib/beneficiaries";

const dateOnly = new Intl.DateTimeFormat("en-GH", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });

// Dates of birth and other calendar dates are stored as UTC midnight, so they're shown in UTC to avoid shifting a day.
export function formatDay(date: Date) {
  return dateOnly.format(date);
}

export function toDateInput(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

const statusTone: Partial<Record<BeneficiaryStatus, string>> = {
  newly_registered: "bg-accent text-on-accent",
  approved: "bg-brand text-on-brand",
  active: "bg-brand text-on-brand",
  suspended: "border border-danger text-danger",
  not_selected: "border border-line text-muted",
  closed: "border border-line text-muted",
  graduated: "border border-brand text-brand",
  referred: "border border-line text-muted",
};

export function BeneficiaryStatusBadge({ status }: { status: BeneficiaryStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-0.5 text-sm font-semibold ${statusTone[status] ?? "bg-brand-tint text-ink"}`}>
      {statusLabels[status]}
    </span>
  );
}

// PLAN.md's go-live gate: no real children's data until EdBridge is registered with the Data Protection Commission,
// a DPIA is done and the consent forms are approved. Set BENEFICIARY_DATA_LIVE=yes once all three are in place.
export function DataGateNotice() {
  if (process.env.BENEFICIARY_DATA_LIVE === "yes") return null;
  return (
    <Notice tone="urgent" title="Use made-up records only for now">
      <p>
        Don&apos;t enter real beneficiaries&apos; details until EdBridge Africa is registered with Ghana&apos;s Data
        Protection Commission and its consent forms are approved. Until then, use invented names and details for
        training and testing.
      </p>
    </Notice>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <p>
      <Link href={href} prefetch={false} className="inline-flex items-center gap-1 font-semibold text-brand underline">
        <ArrowLeft aria-hidden="true" className="size-4" /> {children}
      </Link>
    </p>
  );
}

export function Details({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map(([label, value]) => (
        <div key={label} className="grid gap-1 p-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
          <dt className="font-semibold">{label}</dt>
          <dd className="whitespace-pre-wrap break-words">
            {value === null || value === undefined || value === "" ? <span className="text-muted">Not recorded</span> : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SectionHeading({ id, children, action }: { id: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h2 id={id} className="text-2xl font-bold">
        {children}
      </h2>
      {action}
    </div>
  );
}

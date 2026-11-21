import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/button-link";
import { EmptyState } from "@/components/empty-state";
import { can, requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { listProgrammes, listReminders } from "@/server/beneficiaries/records";
import { StaffBar } from "../staff-bar";
import { runSearch } from "./actions";
import { BeneficiarySearch } from "./search";
import { DataGateNotice, formatDay } from "./ui";

export const instant = false;

export const metadata: Metadata = { title: "Beneficiaries" };

export default async function BeneficiariesPage() {
  const staff = await requireBeneficiaryPermission("view");
  const [initial, programmes, reminders] = await Promise.all([
    runSearch({}, 1),
    listProgrammes({ activeOnly: false }),
    listReminders(staff),
  ]);
  const hasReminders = reminders.drafts.length > 0 || reminders.reviews.length > 0;

  return (
    <>
      <StaffBar staff={staff} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Beneficiaries</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {can(staff, "manageProgrammes") && (
            <Link href="/portal/beneficiaries/programmes" className="font-semibold text-brand underline">
              Programmes
            </Link>
          )}
          {can(staff, "register") && (
            <Link href="/portal/beneficiaries/new" className={buttonClass("primary")}>
              Register a beneficiary
            </Link>
          )}
        </div>
      </div>
      <div className="mt-6">
        <DataGateNotice />
      </div>

      {hasReminders && (
        <section aria-labelledby="reminders-heading" className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 id="reminders-heading" className="text-xl font-bold">
            Needs your attention
          </h2>
          <ul className="mt-3 space-y-2 text-base">
            {reminders.drafts.map((draft) => (
              <li key={draft.id}>
                <Link href={`/portal/beneficiaries/${draft.beneficiary.id}/assessments/${draft.id}`} prefetch={false} className="font-semibold text-brand underline">
                  Finish your assessment of <span className="font-mono">{draft.beneficiary.code}</span>
                </Link>{" "}
                <span className="text-muted">(last saved {formatDay(draft.updatedAt)})</span>
              </li>
            ))}
            {reminders.reviews.map((review) => (
              <li key={review.beneficiary.id}>
                <Link href={`/portal/beneficiaries/${review.beneficiary.id}`} prefetch={false} className="font-semibold text-brand underline">
                  Review <span className="font-mono">{review.beneficiary.code}</span>
                </Link>{" "}
                <span className="text-muted">(due {review.nextReviewOn ? formatDay(review.nextReviewOn) : "now"})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8">
        {initial.total === 0 ? (
          <EmptyState title="No beneficiaries registered yet">
            <p>
              {can(staff, "register")
                ? "Register the first beneficiary to give them an ID and start their assessment."
                : "When registration staff add beneficiaries, they'll appear here."}
            </p>
          </EmptyState>
        ) : (
          <BeneficiarySearch initial={initial} programmes={programmes} />
        )}
      </div>
    </>
  );
}

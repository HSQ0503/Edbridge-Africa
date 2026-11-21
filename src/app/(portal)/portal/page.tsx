import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Notice } from "@/components/notice";
import { can } from "@/server/beneficiaries/access";
import { inboxes } from "@/server/inboxes";
import { requireStaff } from "@/server/staff";
import { countNewByInbox } from "@/server/submissions";
import { StaffBar } from "./staff-bar";

export const instant = false;

const cardClass =
  "flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-5 text-ink no-underline transition-colors duration-200 hover:border-brand";

function Card({ href, title, description, status }: { href: string; title: string; description: string; status?: string }) {
  return (
    <Link href={href} className={cardClass}>
      <span className="flex-1">
        <span className="block text-lg font-bold">{title}</span>
        <span className="mt-1 block text-base text-muted">{description}</span>
        {status && <span className="mt-3 block text-base font-semibold">{status}</span>}
      </span>
      <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-brand" />
    </Link>
  );
}

export default async function PortalHomePage() {
  const staff = await requireStaff();
  const newCounts = await countNewByInbox(staff);
  // Keep the registry's order (safeguarding first) rather than the order access was granted.
  const myInboxes = (Object.keys(inboxes) as (keyof typeof inboxes)[]).filter((inbox) => staff.inboxes.includes(inbox));
  const beneficiaryLinks = [
    can(staff, "view") && {
      href: "/portal/beneficiaries",
      title: "Beneficiary records",
      description: "Register, assess and follow the children and young people EdBridge supports",
    },
    can(staff, "viewReports") && {
      href: "/portal/beneficiaries/reports",
      title: "Beneficiary reports",
      description: "Totals by status, region, age, programme and assistance, with no names",
    },
  ].filter((link) => link !== false);

  return (
    <>
      <StaffBar staff={staff} />
      {beneficiaryLinks.length > 0 && (
        <section aria-labelledby="beneficiaries-heading" className="mb-12">
          <h1 id="beneficiaries-heading" className="text-3xl font-bold">
            Beneficiaries
          </h1>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {beneficiaryLinks.map((link) => (
              <li key={link.href}>
                <Card {...link} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {(myInboxes.length > 0 || beneficiaryLinks.length === 0) && (
        <section aria-labelledby="inboxes-heading">
          {beneficiaryLinks.length > 0 ? (
            <h2 id="inboxes-heading" className="text-3xl font-bold">
              Your inboxes
            </h2>
          ) : (
            <h1 id="inboxes-heading" className="text-3xl font-bold">
              Your inboxes
            </h1>
          )}
          {myInboxes.length === 0 ? (
            <div className="mt-6">
              <Notice title="You don't have access to any inboxes yet">
                <p>Ask a staff admin to give you access to the inboxes and records you handle.</p>
              </Notice>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {myInboxes.map((inbox) => {
                const count = newCounts[inbox] ?? 0;
                return (
                  <li key={inbox}>
                    <Card
                      href={`/portal/inbox/${inbox}`}
                      title={inboxes[inbox].title}
                      description={inboxes[inbox].description}
                      status={count === 0 ? "No new items" : `${count} new`}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </>
  );
}

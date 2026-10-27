import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Notice } from "@/components/notice";
import { inboxes } from "@/server/inboxes";
import { requireStaff } from "@/server/staff";
import { countNewByInbox } from "@/server/submissions";
import { StaffBar } from "./staff-bar";

export const instant = false;

export default async function PortalHomePage() {
  const staff = await requireStaff();
  const newCounts = await countNewByInbox(staff);
  // Keep the registry's order (safeguarding first) rather than the order access was granted.
  const myInboxes = (Object.keys(inboxes) as (keyof typeof inboxes)[]).filter((inbox) => staff.inboxes.includes(inbox));

  return (
    <>
      <StaffBar staff={staff} />
      <h1 className="text-3xl font-bold">Your inboxes</h1>
      {myInboxes.length === 0 ? (
        <div className="mt-6">
          <Notice title="You don't have access to any inboxes yet">
            <p>Ask the IT team to give you access to the inboxes you handle.</p>
          </Notice>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {myInboxes.map((inbox) => {
            const count = newCounts[inbox] ?? 0;
            return (
              <li key={inbox}>
                <Link
                  href={`/portal/inbox/${inbox}`}
                  className="flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-5 text-ink no-underline transition-colors duration-200 hover:border-brand"
                >
                  <span className="flex-1">
                    <span className="block text-lg font-bold">{inboxes[inbox].title}</span>
                    <span className="mt-1 block text-base text-muted">{inboxes[inbox].description}</span>
                    <span className="mt-3 block text-base font-semibold">
                      {count === 0 ? "No new items" : `${count} new`}
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-brand" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

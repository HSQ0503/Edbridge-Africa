import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formFields, inboxes } from "@/server/inboxes";
import { requireInbox } from "@/server/staff";
import { listSubmissions } from "@/server/submissions";
import { formatDateTime, StatusBadge } from "../../format";
import { StaffBar } from "../../staff-bar";

export const instant = false;

// Static on purpose: a title built from the URL would name inboxes the visitor can't open.
export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage({ params }: PageProps<"/portal/inbox/[inbox]">) {
  const { staff, inbox } = await requireInbox((await params).inbox);
  const items = await listSubmissions(staff, inbox);
  // Some inboxes collect more than one form (e.g. volunteering questions sent through the contact form).
  const showFormType = new Set(items.map((item) => item.form)).size > 1;

  return (
    <>
      <StaffBar staff={staff} />
      <p>
        <Link href="/portal" className="inline-flex items-center gap-1 font-semibold text-brand underline">
          <ArrowLeft aria-hidden="true" className="size-4" /> All inboxes
        </Link>
      </p>
      <h1 className="mt-4 text-3xl font-bold">{inboxes[inbox].title}</h1>
      <p className="mt-2 text-muted">{inboxes[inbox].description}</p>

      {items.length === 0 ? (
        <p className="mt-8 rounded-2xl border-2 border-dashed border-line bg-surface p-6">Nothing here yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface">
          {items.map((item) => (
            <li key={item.reference}>
              {/* No prefetch: opening a record is audited, so it must only happen on a real click. */}
              <Link
                href={`/portal/inbox/${inbox}/${item.reference}`}
                prefetch={false}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 text-ink no-underline transition-colors duration-200 hover:bg-brand-tint sm:p-5"
              >
                <span className="font-mono font-semibold underline">{item.reference}</span>
                {showFormType && <span className="text-base text-muted">{formFields[item.form].title}</span>}
                <span className="text-base text-muted sm:ml-auto">{formatDateTime(item.receivedAt)}</span>
                <StatusBadge status={item.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

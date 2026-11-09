import Link from "next/link";
import { buttonClass } from "@/components/button-link";
import type { Staff } from "@/server/staff";
import { signOut } from "./actions";

export function StaffBar({ staff }: { staff: Staff }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-base">
      <p>
        Signed in as <strong>{staff.name}</strong>
      </p>
      {staff.isStaffAdmin && (
        <nav aria-label="Portal" className="flex flex-wrap gap-x-5 gap-y-2 sm:ml-auto">
          <Link href="/portal" className="font-semibold text-brand underline">
            Inboxes
          </Link>
          <Link href="/portal/staff" className="font-semibold text-brand underline">
            Staff accounts
          </Link>
        </nav>
      )}
      <form action={signOut}>
        <button type="submit" className={buttonClass("secondary", "cursor-pointer", true)}>
          Sign out
        </button>
      </form>
    </div>
  );
}

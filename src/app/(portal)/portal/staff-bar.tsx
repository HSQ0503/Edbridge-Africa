import { buttonClass } from "@/components/button-link";
import type { Staff } from "@/server/staff";
import { signOut } from "./actions";

export function StaffBar({ staff }: { staff: Staff }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-base">
      <p>
        Signed in as <strong>{staff.name}</strong>
      </p>
      <form action={signOut}>
        <button type="submit" className={buttonClass("secondary", "cursor-pointer", true)}>
          Sign out
        </button>
      </form>
    </div>
  );
}

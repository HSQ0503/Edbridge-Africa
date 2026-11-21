import Link from "next/link";
import { buttonClass } from "@/components/button-link";
import { can } from "@/server/beneficiaries/access";
import type { Staff } from "@/server/staff";
import { signOut } from "./actions";

export function StaffBar({ staff }: { staff: Staff }) {
  const links = [
    { href: "/portal", label: "Home", show: true },
    { href: "/portal/beneficiaries", label: "Beneficiaries", show: can(staff, "view") },
    { href: "/portal/beneficiaries/reports", label: "Reports", show: can(staff, "viewReports") },
    { href: "/portal/staff", label: "Staff accounts", show: staff.isStaffAdmin },
  ].filter((link) => link.show);

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-base">
      <p>
        Signed in as <strong>{staff.name}</strong>
      </p>
      {links.length > 1 && (
        <nav aria-label="Portal" className="flex flex-wrap gap-x-5 gap-y-2 sm:ml-auto">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="font-semibold text-brand underline">
              {link.label}
            </Link>
          ))}
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

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buttonClass } from "@/components/button-link";
import { inboxes } from "@/server/inboxes";
import { requireStaffAdmin } from "@/server/staff";
import { cmsRoleLabels, listStaffMembers } from "@/server/staff-accounts";
import { StaffBar } from "../staff-bar";

export const instant = false;

export const metadata: Metadata = { title: "Staff accounts" };

export default async function StaffListPage() {
  const admin = await requireStaffAdmin();
  const members = await listStaffMembers();

  return (
    <>
      <StaffBar staff={admin} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Staff accounts</h1>
        <Link href="/portal/staff/new" className={buttonClass("primary")}>
          Add a staff member
        </Link>
      </div>
      <ul className="mt-6 space-y-4">
        {members.map((member) => {
          const access = [
            ...member.inboxAccess.map(({ inbox }) => inboxes[inbox].title),
            ...member.cmsAccess.map(({ role }) => `Website: ${cmsRoleLabels[role].label}`),
          ];
          return (
            <li key={member.id}>
              <Link
                href={`/portal/staff/${member.id}`}
                className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 text-ink no-underline transition-colors duration-200 hover:border-brand"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold">
                    {member.name}
                    {member.id === admin.id && <span className="font-normal text-muted"> (you)</span>}
                  </span>
                  <span className="block break-all text-base text-muted">{member.email}</span>
                  <span className="mt-2 block text-base">
                    {member.twoFactorEnabled ? "Active" : "Invited — hasn't signed in yet"}
                    {member.isStaffAdmin && " · Staff admin"}
                  </span>
                  <span className="mt-1 block text-base text-muted">{access.length ? access.join(", ") : "No access yet"}</span>
                </span>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-brand" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

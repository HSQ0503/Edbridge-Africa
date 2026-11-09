import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormShell } from "@/components/form/form-shell";
import { requireStaffAdmin } from "@/server/staff";
import { PASSWORD_LINK_LIFETIME_DAYS } from "@/server/staff-accounts";
import { StaffBar } from "../../staff-bar";
import { AccessFields } from "../access-fields";
import { addStaffMember } from "../actions";

export const instant = false;

export const metadata: Metadata = { title: "Add a staff member" };

export default async function NewStaffMemberPage() {
  const admin = await requireStaffAdmin();

  return (
    <>
      <StaffBar staff={admin} />
      <p>
        <Link href="/portal/staff" className="inline-flex items-center gap-1 font-semibold text-brand underline">
          <ArrowLeft aria-hidden="true" className="size-4" /> Staff accounts
        </Link>
      </p>
      <div className="mt-4 max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Add a staff member</h1>
        <p>
          We&apos;ll email them a link to choose their password. It works once and expires in{" "}
          {PASSWORD_LINK_LIFETIME_DAYS} days.
        </p>
        <FormShell
          action={addStaffMember}
          submitLabel="Add and send invite"
          pendingLabel="Adding…"
          successTitle="Invite sent"
          successMessage="They'll get an email with a link to choose their password. You can change their access at any time."
          botProtection={false}
        >
          <AccessFields askEmail />
        </FormShell>
      </div>
    </>
  );
}

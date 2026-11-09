import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { requireStaffAdmin } from "@/server/staff";
import { getStaffMember, PASSWORD_LINK_LIFETIME_DAYS } from "@/server/staff-accounts";
import { StaffBar } from "../../staff-bar";
import { AccessFields } from "../access-fields";
import { emailPasswordLink, removeAccount, saveStaffAccess } from "../actions";

export const instant = false;

export const metadata: Metadata = { title: "Staff member" };

export default async function StaffMemberPage({ params }: PageProps<"/portal/staff/[id]">) {
  const { id } = await params;
  const admin = await requireStaffAdmin();
  const member = await getStaffMember(id);
  if (!member) notFound();
  const isSelf = member.id === admin.id;

  return (
    <>
      <StaffBar staff={admin} />
      <p>
        <Link href="/portal/staff" className="inline-flex items-center gap-1 font-semibold text-brand underline">
          <ArrowLeft aria-hidden="true" className="size-4" /> Staff accounts
        </Link>
      </p>
      <div className="mt-4 max-w-2xl space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{member.name}</h1>
          <p className="break-all text-muted">{member.email}</p>
          <p>{member.twoFactorEnabled ? "Active" : "Invited — hasn't signed in yet"}</p>
        </div>

        <section aria-labelledby="access-heading" className="space-y-4">
          <h2 id="access-heading" className="text-2xl font-bold">
            Access
          </h2>
          <FormShell
            action={saveStaffAccess.bind(null, member.id)}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            botProtection={false}
            defaultValues={{
              name: member.name,
              inboxes: member.inboxAccess.map(({ inbox }) => inbox),
              cmsRoles: member.cmsAccess.map(({ role }) => role),
              isStaffAdmin: member.isStaffAdmin ? ["yes"] : [],
            }}
          >
            <AccessFields askEmail={false} />
          </FormShell>
        </section>

        <section aria-labelledby="password-heading" className="space-y-4">
          <h2 id="password-heading" className="text-2xl font-bold">
            Password
          </h2>
          <p>
            {member.twoFactorEnabled
              ? "If they've forgotten their password, email them a link to set a new one. Their current password keeps working until they use it."
              : "If the invite has expired or gone missing, send a new one. Only the newest link works."}{" "}
            Links expire in {PASSWORD_LINK_LIFETIME_DAYS} days.
          </p>
          <FormShell
            action={emailPasswordLink.bind(null, member.id)}
            submitLabel={member.twoFactorEnabled ? "Email a password link" : "Send a new invite"}
            pendingLabel="Sending…"
            successTitle="Link sent"
            successMessage={`We've emailed ${member.email} a link to set their password.`}
            botProtection={false}
          >
            {null}
          </FormShell>
        </section>

        {!isSelf && (
          <section aria-labelledby="remove-heading" className="space-y-4">
            <h2 id="remove-heading" className="text-2xl font-bold">
              Remove account
            </h2>
            <p>
              They&apos;ll be signed out straight away and can&apos;t sign in again. Records they handled stay in the
              portal, and the audit log keeps a note of the removal.
            </p>
            <FormShell action={removeAccount.bind(null, member.id)} submitLabel="Remove account" pendingLabel="Removing…" botProtection={false}>
              <Checkbox name="confirm" label={`Yes, remove ${member.name}'s account`} />
            </FormShell>
          </section>
        )}
      </div>
    </>
  );
}

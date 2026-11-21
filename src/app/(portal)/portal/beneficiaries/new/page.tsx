import type { Metadata } from "next";
import { FormShell } from "@/components/form/form-shell";
import { requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { listCaseOfficers } from "@/server/beneficiaries/records";
import { StaffBar } from "../../staff-bar";
import { registerAction } from "../actions";
import { RegistrationFields } from "../registration-fields";
import { BackLink, DataGateNotice } from "../ui";

export const instant = false;

export const metadata: Metadata = { title: "Register a beneficiary" };

export default async function RegisterBeneficiaryPage() {
  const staff = await requireBeneficiaryPermission("register");
  const caseOfficers = await listCaseOfficers();

  return (
    <>
      <StaffBar staff={staff} />
      <BackLink href="/portal/beneficiaries">Beneficiaries</BackLink>
      <div className="mt-4 max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Register a beneficiary</h1>
        <DataGateNotice />
        <p>
          Ask only for what&apos;s needed, and don&apos;t promise assistance before the approval process is complete.
          Fields marked optional can be left empty if they aren&apos;t known.
        </p>
        <FormShell
          action={registerAction}
          submitLabel="Register beneficiary"
          pendingLabel="Registering…"
          botProtection={false}
          defaultValues={{ nationality: "Ghanaian", consentDate: new Date().toISOString().slice(0, 10) }}
        >
          <RegistrationFields caseOfficers={caseOfficers} household={null} />
        </FormShell>
      </div>
    </>
  );
}

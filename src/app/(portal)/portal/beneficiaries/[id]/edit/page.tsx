import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormShell } from "@/components/form/form-shell";
import { requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { getBeneficiaryForEdit, listCaseOfficers } from "@/server/beneficiaries/records";
import { StaffBar } from "../../../staff-bar";
import { updateAction } from "../../actions";
import { RegistrationFields } from "../../registration-fields";
import { BackLink, toDateInput } from "../../ui";

export const instant = false;

export const metadata: Metadata = { title: "Edit beneficiary" };

const text = (value: string | number | null | undefined) => (value === null || value === undefined ? "" : String(value));

export default async function EditBeneficiaryPage({ params }: PageProps<"/portal/beneficiaries/[id]/edit">) {
  const { id } = await params;
  const staff = await requireBeneficiaryPermission("register");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [record, caseOfficers] = await Promise.all([getBeneficiaryForEdit(staff, id, { audit: true }), listCaseOfficers()]);
  if (!record) notFound();
  const household = record.household;

  return (
    <>
      <StaffBar staff={staff} />
      <BackLink href={`/portal/beneficiaries/${id}`}>Back to {record.code}</BackLink>
      <div className="mt-4 max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">
          Edit <span className="font-mono">{record.code}</span>
        </h1>
        <p>Every change is recorded in the audit log with your name.</p>
        <FormShell
          action={updateAction.bind(null, id)}
          submitLabel="Save changes"
          pendingLabel="Saving…"
          botProtection={false}
          defaultValues={{
            consentDate: toDateInput(record.consentDate),
            consentMethod: record.consentMethod,
            childAssent: text(record.childAssent),
            fullName: record.fullName,
            dateOfBirth: toDateInput(record.dateOfBirth),
            dobEstimated: record.dobEstimated ? ["yes"] : [],
            gender: record.gender,
            nationality: text(record.nationality),
            region: record.region,
            district: text(record.district),
            community: text(record.community),
            residentialLocation: text(record.residentialLocation),
            contactNumber: text(record.contactNumber),
            categories: record.categories,
            categoryOther: text(record.categoryOther),
            referralSource: text(record.referralSource),
            caseOfficerId: text(record.caseOfficerId),
            guardianRelationship: text(record.guardianRelationship),
            guardianName: text(household?.guardianName),
            guardianPhone: text(household?.guardianPhone),
            guardianAltPhone: text(household?.guardianAltPhone),
            guardianOccupation: text(household?.guardianOccupation),
            guardianEmployment: text(household?.guardianEmployment),
            guardianAddress: text(household?.guardianAddress),
            emergencyContact: text(household?.emergencyContact),
            primaryCaregiver: text(household?.primaryCaregiver),
            membersCount: text(household?.membersCount),
            dependantsCount: text(household?.dependantsCount),
            childrenCount: text(household?.childrenCount),
            childrenInSchool: text(household?.childrenInSchool),
            childrenOutOfSchool: text(household?.childrenOutOfSchool),
            incomeSource: text(household?.incomeSource),
            incomeRange: text(household?.incomeRange),
            housing: text(household?.housing),
            circumstances: household?.circumstances ?? [],
            circumstancesOther: text(household?.circumstancesOther),
          }}
        >
          <RegistrationFields caseOfficers={caseOfficers} household={household ? { code: household.code } : null} />
        </FormShell>
      </div>
    </>
  );
}

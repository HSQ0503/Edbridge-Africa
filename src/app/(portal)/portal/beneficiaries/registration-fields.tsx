import { CheckboxGroup, FieldGroup, RadioGroup, SelectField, TextField } from "@/components/form/fields";
import {
  assentOptions,
  beneficiaryCategories,
  consentMethods,
  employmentStatuses,
  familyCircumstances,
  genderOptions,
  incomeRanges,
  referralSources,
  regionOptions,
} from "@/lib/beneficiaries";
import { DuplicateConfirm } from "./duplicate-confirm";

// Shared by registration and editing. Minimal by design: only what EdBridge's BMS requirements list (module 1),
// with everything optional that a field officer may not know.
export function RegistrationFields({
  caseOfficers,
  household,
}: {
  caseOfficers: { id: string; name: string }[];
  household: { code: string } | null;
}) {
  return (
    <>
      <FieldGroup
        title="Consent"
        description="Record consent before anything else. Explain why EdBridge collects these details, and that saying no to photos or publicity doesn't affect support."
      >
        <TextField name="consentDate" label="Date consent was given" type="date" required />
        <RadioGroup name="consentMethod" legend="How was consent given?" required options={consentMethods} />
        <RadioGroup name="childAssent" legend="Did the child also agree (age-appropriate assent)?" options={assentOptions} />
      </FieldGroup>

      <FieldGroup title="Beneficiary" description="The beneficiary ID is created automatically when you save.">
        <TextField name="fullName" label="Full name" required autoComplete="off" />
        <TextField name="dateOfBirth" label="Date of birth" hint="If it isn't known, enter your best estimate and tick the box below" type="date" required />
        <CheckboxGroup name="dobEstimated" legend="Estimated date of birth" options={[{ value: "yes", label: "The date of birth is an estimate" }]} />
        <RadioGroup name="gender" legend="Gender" required options={genderOptions} />
        <TextField name="nationality" label="Nationality" autoComplete="off" />
        <SelectField name="region" label="Region" required options={regionOptions} />
        <TextField name="district" label="District or municipality" autoComplete="off" />
        <TextField name="community" label="Community" autoComplete="off" />
        <TextField name="residentialLocation" label="Residential location" hint="A landmark or GhanaPost GPS address" autoComplete="off" />
        <TextField name="contactNumber" label="Beneficiary's own phone number" hint="Only for young people and adults who have one" type="tel" autoComplete="off" />
        <CheckboxGroup name="categories" legend="Beneficiary category" hint="Select all that apply" options={beneficiaryCategories} />
        <TextField name="categoryOther" label="Other category" hint="If you ticked Other" autoComplete="off" />
        <SelectField name="referralSource" label="How did they come to EdBridge?" options={referralSources} />
        <SelectField
          name="caseOfficerId"
          label="Case officer"
          hint="The staff member who follows this beneficiary"
          options={caseOfficers.map((officer) => ({ value: officer.id, label: officer.name }))}
        />
      </FieldGroup>

      <FieldGroup
        title="Parent/guardian and household"
        description={
          household
            ? `Household ${household.code}. Changes here apply to every beneficiary in this household.`
            : "Leave this section empty for adult learners who don't live with a guardian."
        }
      >
        <TextField
          name="householdCode"
          label={household ? "Move to another household" : "Already registered a brother or sister?"}
          hint="Enter their household number, like HH-00012, to link them. You can then leave the household details below empty."
          autoComplete="off"
        />
        <TextField name="guardianName" label="Parent/guardian's full name" autoComplete="off" />
        <TextField name="guardianRelationship" label="Relationship to the beneficiary" hint="For example mother, uncle, grandmother" autoComplete="off" />
        <TextField name="guardianPhone" label="Contact number" type="tel" autoComplete="off" />
        <TextField name="guardianAltPhone" label="Alternative contact number" type="tel" autoComplete="off" />
        <TextField name="guardianOccupation" label="Occupation" autoComplete="off" />
        <SelectField name="guardianEmployment" label="Employment status" options={employmentStatuses} />
        <TextField name="guardianAddress" label="Guardian's residential address" hint="If different from the beneficiary's" autoComplete="off" />
        <TextField name="emergencyContact" label="Emergency contact" hint="Name and phone number" autoComplete="off" />
        <TextField name="primaryCaregiver" label="Primary caregiver" hint="If not the parent/guardian above" autoComplete="off" />
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField name="membersCount" label="Household members" type="number" inputMode="numeric" />
          <TextField name="dependantsCount" label="Dependants" type="number" inputMode="numeric" />
          <TextField name="childrenCount" label="Children in the household" type="number" inputMode="numeric" />
          <TextField name="childrenInSchool" label="Children attending school" type="number" inputMode="numeric" />
          <TextField name="childrenOutOfSchool" label="Children out of school" type="number" inputMode="numeric" />
        </div>
        <TextField name="incomeSource" label="Main source of household income" autoComplete="off" />
        <SelectField name="incomeRange" label="Estimated monthly household income" options={incomeRanges} />
        <TextField name="housing" label="Housing situation" autoComplete="off" />
        <CheckboxGroup name="circumstances" legend="Family circumstances" hint="Select all that apply" options={familyCircumstances} />
        <TextField name="circumstancesOther" label="Other family circumstances" hint="If you ticked Other" autoComplete="off" />
      </FieldGroup>

      <DuplicateConfirm />
    </>
  );
}

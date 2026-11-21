import { CheckboxGroup, TextField } from "@/components/form/fields";
import { beneficiaryRoleLabels } from "@/lib/beneficiaries";
import { inboxes } from "@/server/inboxes";
import { cmsRoleLabels } from "@/server/staff-accounts";

const inboxOptions = Object.entries(inboxes).map(([value, { title, description }]) => ({ value, label: title, hint: description }));
const beneficiaryRoleOptions = Object.entries(beneficiaryRoleLabels).map(([value, { label, hint }]) => ({ value, label, hint }));
const cmsRoleOptions = Object.entries(cmsRoleLabels).map(([value, { label, hint }]) => ({ value, label, hint }));

export function AccessFields({ askEmail }: { askEmail: boolean }) {
  return (
    <>
      <TextField name="name" label="Full name" required autoComplete="off" />
      {askEmail && (
        <TextField
          name="email"
          label="Email address"
          hint="Their sign-in codes and password link go here, so use an address only they can read"
          type="email"
          required
          autoComplete="off"
        />
      )}
      <CheckboxGroup
        name="inboxes"
        legend="Inboxes they can open"
        hint="Give the two “Reports about…” inboxes only to the people named, and never to the person the reports are about."
        options={inboxOptions}
      />
      <CheckboxGroup
        name="beneficiaryRoles"
        legend="Beneficiary records"
        hint="Give each person only what their job needs. Children's records are confidential."
        options={beneficiaryRoleOptions}
      />
      <CheckboxGroup name="cmsRoles" legend="Website editing" options={cmsRoleOptions} />
      <CheckboxGroup
        name="isStaffAdmin"
        legend="Staff admin"
        options={[
          {
            value: "yes",
            label: "Can manage staff accounts",
            hint: "Staff admins can give anyone, themselves included, access to any inbox. Keep this to one or two trusted people.",
          },
        ]}
      />
    </>
  );
}

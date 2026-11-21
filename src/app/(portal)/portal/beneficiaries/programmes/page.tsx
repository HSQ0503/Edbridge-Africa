import type { Metadata } from "next";
import { CheckboxGroup, TextField } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { listProgrammes } from "@/server/beneficiaries/records";
import { StaffBar } from "../../staff-bar";
import { BackLink } from "../ui";
import { saveProgrammeAction } from "./actions";

export const instant = false;

export const metadata: Metadata = { title: "Programmes" };

const activeOption = [{ value: "yes", label: "Running", hint: "Untick to stop new enrolments. Current participants keep their record." }];

export default async function ProgrammesPage() {
  const staff = await requireBeneficiaryPermission("manageProgrammes");
  const programmes = await listProgrammes({ activeOnly: false });

  return (
    <>
      <StaffBar staff={staff} />
      <BackLink href="/portal/beneficiaries">Beneficiaries</BackLink>
      <div className="mt-4 max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Programmes</h1>
          <p>Beneficiaries can take part in several programmes. Approvers enrol them from their record.</p>
        </div>

        <ul className="space-y-4">
          {programmes.map((programme) => (
            <li key={programme.id} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <details>
                <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
                  <span className="text-lg font-bold">
                    {programme.name}
                    {!programme.active && <span className="font-normal text-muted"> · not running</span>}
                  </span>
                  <span className="text-base text-muted">
                    {programme._count.enrolments} {programme._count.enrolments === 1 ? "participant" : "participants"} ·{" "}
                    <span className="font-semibold text-brand underline">Edit</span>
                  </span>
                </summary>
                <div className="mt-5">
                  <FormShell
                    key={`${programme.name}-${programme.active}`}
                    action={saveProgrammeAction.bind(null, programme.id)}
                    submitLabel="Save programme"
                    pendingLabel="Saving…"
                    botProtection={false}
                    defaultValues={{ name: programme.name, active: programme.active ? ["yes"] : [] }}
                  >
                    <TextField name="name" label="Name" required />
                    <CheckboxGroup name="active" legend="Status" options={activeOption} />
                  </FormShell>
                </div>
              </details>
            </li>
          ))}
        </ul>

        <section aria-labelledby="add-heading" className="space-y-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 id="add-heading" className="text-2xl font-bold">
            Add a programme
          </h2>
          <FormShell
            key={programmes.length}
            action={saveProgrammeAction.bind(null, null)}
            submitLabel="Add programme"
            pendingLabel="Adding…"
            botProtection={false}
            defaultValues={{ active: ["yes"] }}
          >
            <TextField name="name" label="Name" required />
            <CheckboxGroup name="active" legend="Status" options={activeOption} />
          </FormShell>
        </section>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { RadioGroup, SelectField, TextArea } from "@/components/form/fields";
import { useFieldState } from "@/components/form/form-shell";
import type { BeneficiaryStatus } from "@/generated/prisma/enums";
import { decisionOnlyStatuses, exitStatuses, statusOptions } from "@/lib/beneficiaries";

// Closure questions (spec module 13) appear only for exits. Hiding them keeps anything typed, in case the choice changes back.
export function StatusFields({ current }: { current: BeneficiaryStatus }) {
  const { value } = useFieldState("status");
  const [status, setStatus] = useState(typeof value === "string" ? value : "");
  const exiting = exitStatuses.includes(status as BeneficiaryStatus);

  return (
    <>
      <div onChange={(event) => event.target instanceof HTMLSelectElement && setStatus(event.target.value)}>
        <SelectField
          name="status"
          label="New status"
          hint="To approve, wait-list or not select someone, record a selection decision instead."
          required options={statusOptions.filter((option) => option.value !== current && !decisionOnlyStatuses.includes(option.value as BeneficiaryStatus))} />
      </div>
      <TextArea name="reason" label={exiting ? "Reason for closure" : "Reason for the change"} required rows={3} />
      <div hidden={!exiting} className="space-y-6">
        <TextArea name="outcomes" label="Assistance received and outcomes achieved" required rows={3} />
        <TextArea name="outstandingNeeds" label="Outstanding needs and recommendations" rows={3} />
        <TextArea name="followUp" label="Follow-up requirements" rows={3} />
        <RadioGroup
          name="alumniConsent"
          legend="May EdBridge keep in touch as an alumnus?"
          hint="Only with the beneficiary's or guardian's consent"
          options={[
            { value: "yes", label: "Yes, they consented" },
            { value: "no", label: "No" },
            { value: "not_asked", label: "Not asked yet" },
          ]}
        />
      </div>
    </>
  );
}

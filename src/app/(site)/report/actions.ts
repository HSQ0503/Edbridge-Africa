"use server";

import { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { valuesOf } from "@/lib/options";
import { fields, handleSubmission } from "@/server/forms";
import { reportSubjects, reportTypes } from "./options";

// Contact details stay optional on purpose: anyone can report anonymously.
const reportSchema = z.object({
  reportType: fields.choice(valuesOf(reportTypes), "Choose what you would like to report"),
  aboutLeader: z.enum(valuesOf(reportSubjects)).optional(),
  description: fields.requiredText("Tell us what happened", 5000),
  whenHappened: fields.optionalText(),
  whereHappened: fields.optionalText(),
  peopleInvolved: fields.optionalText(1000),
  fullName: fields.optionalText(),
  phone: fields.optionalPhone(),
  email: fields.optionalEmail(),
});

export async function submitReport(_state: FormState, formData: FormData) {
  return handleSubmission("report", reportSchema, formData);
}

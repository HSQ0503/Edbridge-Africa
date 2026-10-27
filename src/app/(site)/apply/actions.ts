"use server";

import { z } from "zod";
import { ghanaRegions } from "@/content/regions";
import type { FormState } from "@/lib/form-state";
import { valuesOf } from "@/lib/options";
import { fields, handleSubmission } from "@/server/forms";
import { applicantTypes, schoolStatuses, supportTypes } from "./options";

const ageError = "Enter their age in whole years, between 3 and 35";

// Deliberately minimal: staff collect full details and consent records when they verify the application.
const applicationSchema = z.object({
  applicantType: fields.choice(valuesOf(applicantTypes), "Choose who is applying"),
  applicantName: fields.requiredText("Enter your full name"),
  phone: fields.phone(),
  email: fields.optionalEmail(),
  organisation: fields.optionalText(),
  childFirstName: fields.requiredText("Enter the first name of the child or young person"),
  childAge: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number({ error: ageError }).int({ error: ageError }).min(3, { error: ageError }).max(35, { error: ageError }),
  ),
  region: fields.choice(ghanaRegions, "Choose a region"),
  district: fields.requiredText("Enter the district"),
  community: fields.requiredText("Enter the town or community"),
  schoolStatus: fields.choice(valuesOf(schoolStatuses), "Choose their current school situation"),
  supportNeeded: fields.choices(valuesOf(supportTypes), "Choose at least one type of support"),
  situation: fields.requiredText("Tell us briefly why support is needed", 3000),
  accessNeeds: fields.optionalText(1000),
  consent: fields.confirmed("Confirm that you have permission to share these details"),
});

export async function submitApplication(_state: FormState, formData: FormData) {
  return handleSubmission("support-application", applicationSchema, formData);
}

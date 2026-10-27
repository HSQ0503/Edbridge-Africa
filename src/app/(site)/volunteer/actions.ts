"use server";

import { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { valuesOf } from "@/lib/options";
import { fields, handleSubmission } from "@/server/forms";
import { volunteerAvailability, volunteerInterests } from "./options";

const volunteerSchema = z.object({
  fullName: fields.requiredText("Enter your full name"),
  email: fields.email(),
  phone: fields.phone(),
  location: fields.requiredText("Enter the town or city and country where you live"),
  ageConfirmed: fields.confirmed("Confirm that you are 18 or older"),
  interests: fields.choices(valuesOf(volunteerInterests), "Choose at least one way you would like to help"),
  availability: fields.choice(valuesOf(volunteerAvailability), "Choose when you are available"),
  experience: fields.requiredText("Tell us about your skills and experience", 3000),
  accessNeeds: fields.optionalText(1000),
  heardAbout: fields.optionalText(),
  safeguardingAcknowledged: fields.confirmed("Confirm that you understand our safeguarding checks"),
  privacyConsent: fields.confirmed("Confirm that we can use your details to process your application"),
});

export async function submitVolunteer(_state: FormState, formData: FormData) {
  return handleSubmission("volunteer", volunteerSchema, formData);
}

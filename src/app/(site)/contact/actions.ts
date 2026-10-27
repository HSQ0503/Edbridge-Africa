"use server";

import { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { fields, handleSubmission } from "@/server/forms";
import { contactTopicValues } from "./options";

const contactSchema = z.object({
  fullName: fields.requiredText("Enter your name"),
  email: fields.email(),
  phone: fields.optionalPhone(),
  organisation: fields.optionalText(),
  topic: fields.choice(contactTopicValues, "Choose what your message is about"),
  message: fields.requiredText("Enter your message", 3000),
});

export async function submitContact(_state: FormState, formData: FormData) {
  return handleSubmission("contact", contactSchema, formData);
}

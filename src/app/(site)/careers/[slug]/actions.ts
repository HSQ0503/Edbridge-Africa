"use server";

import { z } from "zod";
import { getJob } from "@/cms/queries";
import type { FormState } from "@/lib/form-state";
import { fields, handleSubmission } from "@/server/forms";

const applicationSchema = z.object({
  fullName: fields.requiredText("Enter your full name"),
  email: fields.email(),
  phone: fields.phone(),
  location: fields.requiredText("Enter the town or city where you live"),
  statement: fields.requiredText("Tell us why you are applying and what you would bring", 3000),
  adjustments: fields.optionalText(1000),
  privacyConsent: fields.confirmed("Confirm you agree to how we will use your details"),
});

// The slug is bound on the server, so applicants can't attach an application to a different or closed vacancy.
export async function applyForJob(slug: string, _state: FormState, formData: FormData): Promise<FormState> {
  const job = await getJob(slug);
  if (!job || job.closed) {
    return { status: "error", message: "This vacancy has closed, so we can't accept new applications.", fieldErrors: {}, values: {} };
  }
  return handleSubmission("job-application", applicationSchema, formData, {
    upload: { field: "cv", label: "CV" },
    extra: { vacancy: `${job.title} (${job.department})` },
  });
}

"use server";

import { notFound, redirect } from "next/navigation";
import { parseAssessment, type Answers } from "@/lib/assessment-form";
import { requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { saveAssessment } from "@/server/beneficiaries/assessments";

export type AssessmentFormState =
  | { status: "idle" }
  | { status: "saved"; savedAt: string; values: Answers }
  | { status: "error"; message: string; fieldErrors: Record<string, string[]>; values: Answers };

export async function saveAssessmentAction(
  beneficiaryId: string,
  assessmentId: string,
  _state: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  const staff = await requireBeneficiaryPermission("assess");
  if (![beneficiaryId, assessmentId].every((id) => /^[0-9a-f-]{36}$/i.test(id))) notFound();
  const submitting = formData.get("intent") === "submit";
  const { answers, errors } = parseAssessment(formData, { submitting });
  if (Object.keys(errors).length) {
    return {
      status: "error",
      message: submitting ? "Some answers are needed before you can submit" : "There is a problem with some answers",
      fieldErrors: errors,
      values: answers,
    };
  }
  const result = await saveAssessment(staff, beneficiaryId, assessmentId, answers, submitting);
  if (!result.ok) notFound();
  if (result.submitted) redirect(`/portal/beneficiaries/${beneficiaryId}/assessments/${assessmentId}`);
  return { status: "saved", savedAt: new Date().toISOString(), values: answers };
}

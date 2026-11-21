"use server";

import { refresh } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { AssistanceStatus, BeneficiaryStatus, CaseNoteKind, DecisionOutcome } from "@/generated/prisma/enums";
import type { FormState, FormValues } from "@/lib/form-state";
import { assistanceCategories, exitStatuses } from "@/lib/beneficiaries";
import { valuesOf } from "@/lib/options";
import { fields } from "@/server/forms";
import { requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { startAssessment } from "@/server/beneficiaries/assessments";
import {
  addAssistance,
  addCaseNote,
  changeStatus,
  recordDecision,
  setProgrammes,
  updateAssistanceStatus,
  type ActionResult,
} from "@/server/beneficiaries/records";

function readValues(formData: FormData, multi: string[] = []): FormValues {
  const values: FormValues = Object.fromEntries(multi.map((key) => [key, []]));
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    values[key] = multi.includes(key) ? formData.getAll(key).map(String) : String(formData.get(key) ?? "");
  }
  return values;
}

// Bound arguments come back from the browser, so they're checked like any other input.
function checkId(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
}

function invalid(values: FormValues, fieldErrors: Record<string, string[]>, message = "There is a problem"): FormState {
  return { status: "error", message, fieldErrors, values };
}

function parseFailed(values: FormValues, error: z.ZodError) {
  return invalid(values, z.flattenError(error).fieldErrors as Record<string, string[]>);
}

// The page re-renders with the change, and the form clears for the next entry.
function done(result: ActionResult, values: FormValues): FormState {
  if (!result.ok) {
    if (result.error === "Not found" || result.error === "Not allowed") notFound();
    return invalid(values, result.field ? { [result.field]: [result.error] } : {}, result.field ? "There is a problem" : result.error);
  }
  refresh();
  return { status: "idle" };
}

const date = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)), { error: "Enter a real date" })
    .transform((value) => new Date(`${value}T00:00:00Z`));

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))), { error: "Enter a real date" })
  .transform((value) => (value ? new Date(`${value}T00:00:00Z`) : undefined));

const longText = (error: string) => fields.requiredText(error, 4000);
const optionalLongText = z.string().trim().max(4000, { error: "Keep this under 4000 characters" }).transform((value) => value || undefined);

export async function beginAssessment(beneficiaryId: string) {
  checkId(beneficiaryId);
  const staff = await requireBeneficiaryPermission("assess");
  const assessmentId = await startAssessment(staff, beneficiaryId);
  if (!assessmentId) notFound();
  redirect(`/portal/beneficiaries/${beneficiaryId}/assessments/${assessmentId}`);
}

const decisionSchema = z.object({
  outcome: fields.choice(Object.values(DecisionOutcome) as [DecisionOutcome, ...DecisionOutcome[]], "Choose a decision"),
  reason: longText("Give the reason for the decision"),
});

export async function decideAction(beneficiaryId: string, _state: FormState, formData: FormData): Promise<FormState> {
  checkId(beneficiaryId);
  const staff = await requireBeneficiaryPermission("decide");
  const values = readValues(formData);
  const parsed = decisionSchema.safeParse(values);
  if (!parsed.success) return parseFailed(values, parsed.error);
  return done(await recordDecision(staff, beneficiaryId, parsed.data.outcome, parsed.data.reason), values);
}

const statusSchema = z
  .object({
    status: fields.choice(Object.values(BeneficiaryStatus) as [BeneficiaryStatus, ...BeneficiaryStatus[]], "Choose the new status"),
    reason: longText("Give the reason for the change"),
    outcomes: optionalLongText,
    outstandingNeeds: optionalLongText,
    followUp: optionalLongText,
    alumniConsent: z.preprocess((value) => value ?? "", z.enum(["", "yes", "no", "not_asked"])).transform((value) => value || undefined),
  })
  .superRefine((data, context) => {
    if (exitStatuses.includes(data.status) && !data.outcomes) {
      context.addIssue({ code: "custom", path: ["outcomes"], message: "Record the assistance received and outcomes achieved" });
    }
  });

export async function statusAction(beneficiaryId: string, _state: FormState, formData: FormData): Promise<FormState> {
  checkId(beneficiaryId);
  const staff = await requireBeneficiaryPermission("decide");
  const values = readValues(formData);
  const parsed = statusSchema.safeParse(values);
  if (!parsed.success) return parseFailed(values, parsed.error);
  const { status, ...details } = parsed.data;
  // Closure details only belong to exits; ignore any left in hidden fields.
  const kept = exitStatuses.includes(status) ? details : { reason: details.reason };
  return done(await changeStatus(staff, beneficiaryId, status, kept), values);
}

const noteSchema = z.object({
  kind: fields.choice(Object.values(CaseNoteKind) as [CaseNoteKind, ...CaseNoteKind[]], "Choose the type of record"),
  body: longText("Write the note"),
  occurredOn: date("Enter the date").refine((value) => value.getTime() <= Date.now(), { error: "The date can't be in the future" }),
  nextReviewOn: optionalDate,
});

export async function noteAction(beneficiaryId: string, _state: FormState, formData: FormData): Promise<FormState> {
  checkId(beneficiaryId);
  const staff = await requireBeneficiaryPermission("note");
  const values = readValues(formData);
  const parsed = noteSchema.safeParse(values);
  if (!parsed.success) return parseFailed(values, parsed.error);
  return done(await addCaseNote(staff, beneficiaryId, parsed.data), values);
}

export async function programmesAction(beneficiaryId: string, _state: FormState, formData: FormData): Promise<FormState> {
  checkId(beneficiaryId);
  const staff = await requireBeneficiaryPermission("decide");
  const values = readValues(formData, ["programmes"]);
  const ids = (values.programmes as string[]).filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  return done(await setProgrammes(staff, beneficiaryId, ids), values);
}

const assistanceSchema = z.object({
  category: fields.choice(valuesOf(assistanceCategories), "Choose the type of assistance"),
  description: z.string().trim().max(300, { error: "Keep this under 300 characters" }).transform((value) => value || undefined),
  value: z
    .string()
    .trim()
    .transform((value) => value.replace(/,/g, ""))
    .refine((value) => value === "" || /^\d{1,7}(\.\d{1,2})?$/.test(value), { error: "Enter an amount in cedis, like 250 or 250.50" })
    .transform((value) => (value ? Math.round(Number(value) * 100) : undefined)),
  fundingSource: z.string().trim().max(200, { error: "Keep this under 200 characters" }).transform((value) => value || undefined),
  status: fields.choice(Object.values(AssistanceStatus) as [AssistanceStatus, ...AssistanceStatus[]], "Choose a status"),
  approvedOn: optionalDate,
  providedOn: optionalDate,
});

export async function assistanceAction(beneficiaryId: string, _state: FormState, formData: FormData): Promise<FormState> {
  checkId(beneficiaryId);
  const staff = await requireBeneficiaryPermission("recordAssistance");
  const values = readValues(formData);
  const parsed = assistanceSchema.safeParse(values);
  if (!parsed.success) return parseFailed(values, parsed.error);
  const { value, ...rest } = parsed.data;
  return done(await addAssistance(staff, beneficiaryId, { ...rest, valuePesewas: value }), values);
}

export async function assistanceStatusAction(beneficiaryId: string, assistanceId: string, formData: FormData) {
  checkId(beneficiaryId);
  checkId(assistanceId);
  const staff = await requireBeneficiaryPermission("recordAssistance");
  const status = z.enum(AssistanceStatus).safeParse(formData.get("status"));
  if (!status.success) notFound();
  const result = await updateAssistanceStatus(staff, beneficiaryId, assistanceId, status.data);
  if (!result.ok && (result.error === "Not found" || result.error === "Not allowed")) notFound();
  refresh();
}

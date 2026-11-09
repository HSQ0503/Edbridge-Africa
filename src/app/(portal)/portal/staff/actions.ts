"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState, FormValues } from "@/lib/form-state";
import { CmsRole } from "@/generated/prisma/enums";
import { fields } from "@/server/forms";
import { Inbox } from "@/server/inboxes";
import { requireStaffAdmin } from "@/server/staff";
import { createStaffMember, getStaffMember, removeStaffMember, sendPasswordLink, updateStaffAccess } from "@/server/staff-accounts";

const accessSchema = z.object({
  name: fields.requiredText("Enter their full name", 100),
  inboxes: fields.choices(Object.values(Inbox) as [Inbox, ...Inbox[]]),
  cmsRoles: fields.choices(Object.values(CmsRole) as [CmsRole, ...CmsRole[]]),
  isStaffAdmin: z.array(z.literal("yes")).transform((ticked) => ticked.length > 0),
});

// Listed in form order, so the error summary matches the page.
const newMemberSchema = z.object({
  name: accessSchema.shape.name,
  email: z
    .string()
    .trim()
    .min(1, { error: "Enter their email address" })
    .pipe(z.email({ error: "Enter an email address in the correct format, like name@example.com" }))
    .transform((email) => email.toLowerCase()),
  ...accessSchema.omit({ name: true }).shape,
});

function readValues(formData: FormData): FormValues {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    inboxes: formData.getAll("inboxes").map(String),
    cmsRoles: formData.getAll("cmsRoles").map(String),
    isStaffAdmin: formData.getAll("isStaffAdmin").map(String),
  };
}

function invalid(values: FormValues, fieldErrors: Record<string, string[]>, message = "There is a problem"): FormState {
  return { status: "error", message, fieldErrors, values };
}

function accessErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}

export async function addStaffMember(_state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireStaffAdmin();
  const values = readValues(formData);
  const parsed = newMemberSchema.safeParse(values);
  if (!parsed.success) return invalid(values, accessErrors(parsed.error));

  const { email, ...access } = parsed.data;
  const created = await createStaffMember(admin, email, access);
  if (!created) return invalid(values, { email: ["There is already an account with this email address"] });
  return { status: "success" };
}

// Bound arguments come back from the browser, so the person is looked up again before anything changes.
async function requireMember(userId: string) {
  const admin = await requireStaffAdmin();
  const member = await getStaffMember(userId);
  if (!member) redirect("/portal/staff");
  return { admin, member };
}

export async function saveStaffAccess(userId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const { admin, member } = await requireMember(userId);
  const values = readValues(formData);
  const access = accessSchema.safeParse(values);
  if (!access.success) return invalid(values, accessErrors(access.error));
  // An admin can't lock themselves out, which also means there is always at least one admin.
  if (member.id === admin.id && !access.data.isStaffAdmin) {
    return invalid(values, { isStaffAdmin: ["You can't remove your own staff admin access. Ask another staff admin."] });
  }

  await updateStaffAccess(admin, member.id, access.data);
  redirect("/portal/staff");
}

export async function emailPasswordLink(userId: string): Promise<FormState> {
  const { admin, member } = await requireMember(userId);
  await sendPasswordLink(admin, member.id);
  return { status: "success" };
}

export async function removeAccount(userId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const { admin, member } = await requireMember(userId);
  if (member.id === admin.id) return invalid({}, {}, "You can't remove your own account. Ask another staff admin.");
  if (formData.get("confirm") !== "yes") {
    return invalid({}, { confirm: [`Tick the box to confirm you want to remove ${member.name}'s account`] });
  }

  await removeStaffMember(admin, member.id);
  redirect("/portal/staff");
}

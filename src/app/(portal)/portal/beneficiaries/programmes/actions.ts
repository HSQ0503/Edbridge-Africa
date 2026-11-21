"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { fields } from "@/server/forms";
import { requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { saveProgramme } from "@/server/beneficiaries/records";

const programmeSchema = z.object({
  name: fields.requiredText("Enter the programme's name", 120),
  active: z.array(z.literal("yes")).transform((ticked) => ticked.length > 0),
});

export async function saveProgrammeAction(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireBeneficiaryPermission("manageProgrammes");
  const values = { name: String(formData.get("name") ?? ""), active: formData.getAll("active").map(String) };
  const parsed = programmeSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "There is a problem", fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>, values };
  }
  if (id !== null && !/^[0-9a-f-]{36}$/i.test(id)) return { status: "error", message: "That programme no longer exists", fieldErrors: {}, values };
  const result = await saveProgramme(staff, { id: id ?? undefined, ...parsed.data });
  if (!result.ok) {
    return { status: "error", message: "There is a problem", fieldErrors: result.field ? { [result.field]: [result.error] } : {}, values };
  }
  refresh();
  return { status: "idle" };
}

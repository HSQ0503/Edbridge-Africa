"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState, FormValues } from "@/lib/form-state";
import {
  assentOptions,
  beneficiaryCategories,
  consentMethods,
  employmentStatuses,
  familyCircumstances,
  genderOptions,
  incomeRanges,
  referralSources,
  regionOptions,
  ageBands,
  ageOn,
} from "@/lib/beneficiaries";
import { priorityBands } from "@/lib/assessment-form";
import { valuesOf } from "@/lib/options";
import { fields } from "@/server/forms";
import { requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import {
  findHousehold,
  findPossibleDuplicates,
  getBeneficiaryForEdit,
  listBeneficiaries,
  listCaseOfficers,
  registerBeneficiary,
  updateBeneficiary,
  type BeneficiaryFilters,
  type HouseholdInput,
} from "@/server/beneficiaries/records";
import { BeneficiaryStatus } from "@/generated/prisma/enums";

const MULTI = ["categories", "circumstances", "dobEstimated", "confirmDuplicate"];

function readValues(formData: FormData): FormValues {
  const values: FormValues = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    values[key] = MULTI.includes(key) ? formData.getAll(key).map(String) : String(formData.get(key) ?? "");
  }
  return values;
}

const optionalText = (max = 200) => z.string().trim().max(max, { error: `Keep this under ${max} characters` }).transform((value) => value || undefined);
// Unticked radios aren't sent at all, so a missing answer counts as empty.
const optionalChoice = <T extends readonly [string, ...string[]]>(options: T) =>
  z.preprocess(
    (value) => value ?? "",
    z.union([z.literal(""), z.enum(options, { error: "Choose from the options shown" })]).transform((value) => value || undefined),
  );
const optionalCount = z
  .string()
  .trim()
  .regex(/^\d{0,3}$/, { error: "Enter a whole number, like 4" })
  .transform((value) => (value === "" ? undefined : Number(value)));

const dateString = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)), { error: "Enter a real date" })
    .transform((value) => new Date(`${value}T00:00:00Z`));

const notInFuture = (date: Date) => date.getTime() <= Date.now();

const registrationSchema = z.object({
  consentDate: dateString("Enter the date consent was given").refine(notInFuture, { error: "The consent date can't be in the future" }),
  consentMethod: fields.choice(valuesOf(consentMethods), "Choose how consent was given"),
  childAssent: optionalChoice(valuesOf(assentOptions)),
  fullName: fields.requiredText("Enter the beneficiary's full name", 120),
  dateOfBirth: dateString("Enter the date of birth, or your best estimate")
    .refine(notInFuture, { error: "The date of birth can't be in the future" })
    .refine((date) => ageOn(date) < 100, { error: "Check the year of birth" }),
  dobEstimated: z.array(z.literal("yes")).transform((ticked) => ticked.length > 0),
  gender: fields.choice(valuesOf(genderOptions), "Choose the beneficiary's gender"),
  nationality: optionalText(80),
  region: fields.choice(valuesOf(regionOptions), "Choose the region"),
  district: optionalText(),
  community: optionalText(),
  residentialLocation: optionalText(),
  contactNumber: fields.optionalPhone().transform((value) => value || undefined),
  categories: fields.choices(valuesOf(beneficiaryCategories)),
  categoryOther: optionalText(),
  referralSource: optionalChoice(valuesOf(referralSources)),
  caseOfficerId: z.string().trim().max(100).transform((value) => value || undefined),
  householdCode: z
    .string()
    .trim()
    .regex(/^(hh-?\d{1,5})?$/i, { error: "Enter a household number like HH-00012" })
    .transform((value) => value || undefined),
  guardianName: optionalText(120),
  guardianRelationship: optionalText(80),
  guardianPhone: fields.optionalPhone().transform((value) => value || undefined),
  guardianAltPhone: fields.optionalPhone().transform((value) => value || undefined),
  guardianOccupation: optionalText(),
  guardianEmployment: optionalChoice(valuesOf(employmentStatuses)),
  guardianAddress: optionalText(),
  emergencyContact: optionalText(),
  primaryCaregiver: optionalText(120),
  membersCount: optionalCount,
  dependantsCount: optionalCount,
  childrenCount: optionalCount,
  childrenInSchool: optionalCount,
  childrenOutOfSchool: optionalCount,
  incomeSource: optionalText(),
  incomeRange: optionalChoice(valuesOf(incomeRanges)),
  housing: optionalText(),
  circumstances: fields.choices(valuesOf(familyCircumstances)),
  circumstancesOther: optionalText(),
  confirmDuplicate: z.array(z.literal("yes")).transform((ticked) => ticked.length > 0),
});

type Registration = z.infer<typeof registrationSchema>;

// Fields the browser leaves out (unticked boxes and radios) are read as empty.
function parseRegistration(values: FormValues) {
  const withDefaults = Object.fromEntries(
    Object.keys(registrationSchema.shape).map((key) => [key, values[key] ?? (MULTI.includes(key) ? [] : "")]),
  );
  return registrationSchema.safeParse(withDefaults);
}

function invalid(values: FormValues, fieldErrors: Record<string, string[]>, message = "There is a problem"): FormState {
  return { status: "error", message, fieldErrors, values };
}

function normaliseHouseholdCode(code: string) {
  const digits = code.replace(/\D/g, "");
  return `HH-${digits.padStart(5, "0")}`;
}

function splitInput(data: Registration) {
  const { householdCode, confirmDuplicate, guardianRelationship, ...rest } = data;
  const household: HouseholdInput = {
    guardianName: rest.guardianName ?? "",
    guardianPhone: rest.guardianPhone,
    guardianAltPhone: rest.guardianAltPhone,
    guardianOccupation: rest.guardianOccupation,
    guardianEmployment: rest.guardianEmployment,
    guardianAddress: rest.guardianAddress,
    emergencyContact: rest.emergencyContact,
    primaryCaregiver: rest.primaryCaregiver,
    membersCount: rest.membersCount,
    dependantsCount: rest.dependantsCount,
    childrenCount: rest.childrenCount,
    childrenInSchool: rest.childrenInSchool,
    childrenOutOfSchool: rest.childrenOutOfSchool,
    incomeSource: rest.incomeSource,
    incomeRange: rest.incomeRange,
    housing: rest.housing,
    circumstances: rest.circumstances,
    circumstancesOther: rest.circumstancesOther,
  };
  const hasHouseholdDetails = Object.entries(household).some(([, value]) => (Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ""));
  const beneficiary = {
    fullName: rest.fullName,
    dateOfBirth: rest.dateOfBirth,
    dobEstimated: rest.dobEstimated,
    gender: rest.gender,
    nationality: rest.nationality,
    region: rest.region,
    district: rest.district,
    community: rest.community,
    residentialLocation: rest.residentialLocation,
    contactNumber: rest.contactNumber,
    categories: rest.categories,
    categoryOther: rest.categoryOther,
    referralSource: rest.referralSource,
    consentDate: rest.consentDate,
    consentMethod: rest.consentMethod,
    childAssent: rest.childAssent,
    guardianRelationship,
    caseOfficerId: rest.caseOfficerId,
  };
  return { beneficiary, household, hasHouseholdDetails, householdCode, confirmDuplicate };
}

// Checks shared by registering and editing. Returns field errors, or the household to link.
async function validateRelations(data: ReturnType<typeof splitInput>, values: FormValues, excludeId?: string) {
  const errors: Record<string, string[]> = {};
  const officers = await listCaseOfficers();
  if (data.beneficiary.caseOfficerId && !officers.some((officer) => officer.id === data.beneficiary.caseOfficerId)) {
    errors.caseOfficerId = ["Choose a case officer from the list"];
  }
  let linkedHousehold: { id: string; code: string } | null = null;
  if (data.householdCode) {
    linkedHousehold = await findHousehold(normaliseHouseholdCode(data.householdCode));
    if (!linkedHousehold) errors.householdCode = ["There's no household with that number. Check it, or leave it empty to add the details below."];
  } else if (data.hasHouseholdDetails && !data.household.guardianName) {
    errors.guardianName = ["Enter the parent/guardian's name, or leave the household section empty"];
  }
  if (!data.confirmDuplicate) {
    const duplicates = await findPossibleDuplicates(data.beneficiary, excludeId);
    if (duplicates.length) {
      errors.confirmDuplicate = [
        `${duplicates.map((duplicate) => duplicate.code).join(", ")} has the same name and date of birth or community. Check they aren't the same person.`,
      ];
    }
  }
  return { errors, linkedHousehold, values };
}

export async function registerAction(_state: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireBeneficiaryPermission("register");
  const values = readValues(formData);
  const parsed = parseRegistration(values);
  if (!parsed.success) return invalid(values, z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);

  const data = splitInput(parsed.data);
  const { errors, linkedHousehold } = await validateRelations(data, values);
  if (Object.keys(errors).length) return invalid(values, errors);

  const household = linkedHousehold
    ? { existingId: linkedHousehold.id }
    : data.hasHouseholdDetails
      ? { create: data.household }
      : null;
  const id = await registerBeneficiary(staff, data.beneficiary, household);
  redirect(`/portal/beneficiaries/${id}`);
}

export async function updateAction(id: string, _state: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireBeneficiaryPermission("register");
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/portal/beneficiaries");
  const existing = await getBeneficiaryForEdit(staff, id, { audit: false });
  if (!existing) redirect("/portal/beneficiaries");
  const values = readValues(formData);
  const parsed = parseRegistration(values);
  if (!parsed.success) return invalid(values, z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);

  const data = splitInput(parsed.data);
  // Only a change of name, date of birth or community is worth another duplicate check.
  const identityChanged =
    data.beneficiary.fullName !== existing.fullName ||
    data.beneficiary.dateOfBirth.getTime() !== existing.dateOfBirth.getTime() ||
    (data.beneficiary.community ?? null) !== existing.community;
  if (!identityChanged) data.confirmDuplicate = true;
  const movingHousehold = data.householdCode && normaliseHouseholdCode(data.householdCode) !== existing.household?.code;
  if (!movingHousehold) data.householdCode = undefined;

  const { errors, linkedHousehold } = await validateRelations(data, values, id);
  if (existing.household && !data.householdCode && !data.household.guardianName) {
    errors.guardianName = ["Enter the parent/guardian's name"];
  }
  if (Object.keys(errors).length) return invalid(values, errors);

  const household = linkedHousehold
    ? { existingId: linkedHousehold.id }
    : existing.household
      ? { update: data.household }
      : data.hasHouseholdDetails
        ? { create: data.household }
        : null;
  await updateBeneficiary(staff, id, data.beneficiary, household);
  redirect(`/portal/beneficiaries/${id}`);
}

// ─── Search ──────────────────────────────────────────────────────────────────

export type SearchRow = {
  id: string;
  code: string;
  fullName: string;
  age: number;
  dobEstimated: boolean;
  gender: string;
  region: string;
  district: string | null;
  status: BeneficiaryStatus;
  priorityScore: number | null;
};

export type SearchState = { rows: SearchRow[]; total: number; page: number; filters: BeneficiaryFilters };

// Every filter is checked against its allowed values; anything else is dropped rather than sent to the database.
const anyOf = (values: readonly string[]) =>
  z.preprocess((value) => (typeof value === "string" && values.includes(value) ? value : undefined), z.string().optional());

const searchSchema = z.object({
  query: z.preprocess((value) => (typeof value === "string" ? value.trim().slice(0, 120) : undefined), z.string().optional()),
  status: anyOf(Object.values(BeneficiaryStatus)),
  region: anyOf(regionOptions.map((option) => option.value)),
  gender: anyOf(genderOptions.map((option) => option.value)),
  ageBand: anyOf(ageBands.map((band) => band.value)),
  programmeId: z.preprocess((value) => (typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value) ? value : undefined), z.string().optional()),
  priority: anyOf(priorityBands.map((band) => band.value)),
});

function readFilters(input: unknown): BeneficiaryFilters {
  const parsed = searchSchema.safeParse(input ?? {});
  if (!parsed.success) return {};
  return Object.fromEntries(Object.entries(parsed.data).filter(([, value]) => value)) as BeneficiaryFilters;
}

export async function runSearch(filters: BeneficiaryFilters, page: number): Promise<SearchState> {
  const staff = await requireBeneficiaryPermission("view");
  filters = readFilters(filters);
  page = Number.isInteger(page) && page >= 1 ? Math.min(page, 1000) : 1;
  const { rows, total } = await listBeneficiaries(staff, filters, page);
  const today = new Date();
  return {
    rows: rows.map(({ dateOfBirth, ...row }) => ({ ...row, age: ageOn(dateOfBirth, today) })),
    total,
    page,
    filters,
  };
}

// A POST, so a search for a child's name never ends up in a URL, browser history or server log.
export async function searchAction(state: SearchState, formData: FormData): Promise<SearchState> {
  // The previous state comes back from the browser, so it's re-checked like a fresh search.
  if (formData.get("intent") === "more") {
    const page = Number.isInteger(state?.page) && state.page >= 1 ? state.page + 1 : 1;
    const next = await runSearch(readFilters(state?.filters), page);
    return { ...next, rows: [...(Array.isArray(state?.rows) && page > 1 ? state.rows : []), ...next.rows] };
  }
  return runSearch(readFilters(Object.fromEntries(formData)), 1);
}

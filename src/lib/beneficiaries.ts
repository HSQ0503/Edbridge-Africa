// Labels and option lists for beneficiary records, shared by the portal's forms, pages and server checks.
// Wording follows EdBridge's BMS requirements and Comprehensive Beneficiary Assessment (November 2026).
import type {
  AssistanceStatus,
  BeneficiaryRole,
  BeneficiaryStatus,
  CaseNoteKind,
  DecisionOutcome,
} from "@/generated/prisma/enums";
import { ghanaRegions } from "@/content/regions";

type Option = { value: string; label: string; hint?: string };

const toOptions = (labels: Record<string, string>): Option[] =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

export const beneficiaryRoleLabels: Record<BeneficiaryRole, { label: string; hint: string }> = {
  registrar: { label: "Register beneficiaries", hint: "Adds and updates beneficiary, guardian and household details" },
  assessor: { label: "Assess beneficiaries", hint: "Completes assessments and adds case notes and support records" },
  approver: {
    label: "Approve selection",
    hint: "Decides on selection, changes a beneficiary's status and manages programmes. Can't decide on their own assessments.",
  },
  sensitive: {
    label: "See sensitive details",
    hint: "Disability, health and safeguarding answers in assessments. Give only to the people who need them.",
  },
  reports: { label: "Summary reports only", hint: "Totals and breakdowns with no names. For M&E, the board and donors' reports." },
};

export const statusLabels: Record<BeneficiaryStatus, string> = {
  newly_registered: "Newly registered",
  under_assessment: "Under assessment",
  awaiting_verification: "Awaiting verification",
  under_review: "Under review",
  approved: "Approved",
  active: "Active beneficiary",
  waiting_list: "On the waiting list",
  not_selected: "Not selected",
  suspended: "Temporarily suspended",
  graduated: "Graduated",
  referred: "Referred to another service provider",
  closed: "Case closed",
};
export const statusOptions = toOptions(statusLabels);

// Set only by recording a selection decision, never by a plain status change.
export const decisionOnlyStatuses: BeneficiaryStatus[] = ["approved", "waiting_list", "not_selected"];

// Moving to one of these ends EdBridge's support, so the closure details in spec module 13 are required.
export const exitStatuses: BeneficiaryStatus[] = ["graduated", "referred", "closed"];

export const decisionLabels: Record<DecisionOutcome, string> = {
  approved: "Approve for support",
  waiting_list: "Place on the waiting list",
  referred: "Refer to another service provider",
  further_assessment: "Ask for further assessment",
  not_selected: "Not currently eligible",
};
export const decisionOptions = toOptions(decisionLabels);

// How a recorded decision reads afterwards.
export const decisionResultLabels: Record<DecisionOutcome, string> = {
  approved: "Approved for support",
  waiting_list: "Placed on the waiting list",
  referred: "Referred to another service provider",
  further_assessment: "Further assessment requested",
  not_selected: "Not currently eligible",
};

// The status a beneficiary moves to after each decision.
export const decisionStatus: Record<DecisionOutcome, BeneficiaryStatus> = {
  approved: "approved",
  waiting_list: "waiting_list",
  referred: "referred",
  further_assessment: "under_assessment",
  not_selected: "not_selected",
};

export const genderLabels: Record<string, string> = {
  female: "Female",
  male: "Male",
  not_stated: "Prefer not to say",
};
export const genderOptions = toOptions(genderLabels);

export const regionOptions = ghanaRegions.map((region) => ({ value: region, label: region }));

// Two-letter codes for beneficiary IDs.
const regionCodes: Record<(typeof ghanaRegions)[number], string> = {
  Ahafo: "AF",
  Ashanti: "AS",
  Bono: "BO",
  "Bono East": "BE",
  Central: "CR",
  Eastern: "ER",
  "Greater Accra": "GA",
  "North East": "NE",
  Northern: "NR",
  Oti: "OT",
  Savannah: "SV",
  "Upper East": "UE",
  "Upper West": "UW",
  Volta: "VR",
  Western: "WR",
  "Western North": "WN",
};

export function isRegion(value: string): value is (typeof ghanaRegions)[number] {
  return Object.hasOwn(regionCodes, value);
}

export function beneficiaryCode(region: (typeof ghanaRegions)[number], registeredAt: Date, number: number) {
  const year = String(registeredAt.getUTCFullYear()).slice(-2);
  return `EBA-${regionCodes[region]}-${year}-${String(number).padStart(5, "0")}`;
}

export function householdCode(number: number) {
  return `HH-${String(number).padStart(5, "0")}`;
}

// Whole years on the given day. Dates of birth are stored as UTC midnight, and Accra is on UTC all year.
export function ageOn(dateOfBirth: Date, today = new Date()) {
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (today.getUTCMonth() === dateOfBirth.getUTCMonth() && today.getUTCDate() < dateOfBirth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return Math.max(age, 0);
}

export const ageBands = [
  { value: "0-5", label: "Under 6", min: 0, max: 5 },
  { value: "6-11", label: "6 to 11", min: 6, max: 11 },
  { value: "12-14", label: "12 to 14", min: 12, max: 14 },
  { value: "15-17", label: "15 to 17", min: 15, max: 17 },
  { value: "18-24", label: "18 to 24", min: 18, max: 24 },
  { value: "25+", label: "25 and over", min: 25, max: 200 },
] as const;

export const beneficiaryCategories: Option[] = [
  { value: "child", label: "Child (below 18 years)" },
  { value: "adolescent", label: "Adolescent" },
  { value: "young_person", label: "Young person" },
  { value: "out_of_school", label: "Out-of-school child or young person" },
  { value: "child_disability", label: "Child with disability" },
  { value: "young_person_disability", label: "Young person with disability" },
  { value: "low_income", label: "Child from a low-income household" },
  { value: "orphan_vulnerable", label: "Orphan or otherwise vulnerable child" },
  { value: "dropout_risk", label: "Child at risk of dropping out" },
  { value: "adult_literacy", label: "Adult requiring literacy education" },
  { value: "other", label: "Other" },
];

export const consentMethods: Option[] = [
  { value: "signed_form", label: "Signed or thumbprinted consent form" },
  { value: "witnessed_verbal", label: "Verbal consent, witnessed" },
  { value: "self", label: "The beneficiary is 18 or over and consented themselves" },
];

export const assentOptions: Option[] = [
  { value: "given", label: "Yes, the child agreed" },
  { value: "not_given", label: "No" },
  { value: "not_applicable", label: "Not applicable (too young, or 18 or over)" },
];

export const referralSources: Option[] = [
  { value: "school", label: "School or teacher" },
  { value: "community", label: "Community leader or member" },
  { value: "caregiver", label: "Parent or caregiver" },
  { value: "partner", label: "Partner organisation" },
  { value: "online", label: "Online application" },
  { value: "field", label: "EdBridge field outreach" },
  { value: "self", label: "Self-referral" },
  { value: "other", label: "Other" },
];

export const familyCircumstances: Option[] = [
  { value: "parent_loss", label: "Loss of one or both parents" },
  { value: "single_parent", label: "Single-parent household" },
  { value: "unemployed_guardian", label: "Unemployed parent or guardian" },
  { value: "poverty", label: "Household poverty" },
  { value: "large_household", label: "Large household with limited resources" },
  { value: "instability", label: "Parental separation or family instability" },
  { value: "kinship_care", label: "Living with relatives or non-parent caregivers" },
  { value: "neglect", label: "Neglect or inadequate care" },
  { value: "displacement", label: "Family displacement" },
  { value: "other", label: "Other" },
];

export const incomeRanges: Option[] = [
  { value: "under_500", label: "Under GHS 500 a month" },
  { value: "500_999", label: "GHS 500 to 999" },
  { value: "1000_1999", label: "GHS 1,000 to 1,999" },
  { value: "2000_plus", label: "GHS 2,000 or more" },
  { value: "unknown", label: "Not known" },
];

export const employmentStatuses: Option[] = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed or trading" },
  { value: "casual", label: "Casual or seasonal work" },
  { value: "farming", label: "Farming" },
  { value: "unemployed", label: "Unemployed" },
  { value: "unknown", label: "Not known" },
];

export const noteKindLabels: Record<CaseNoteKind, string> = {
  note: "Case note",
  support: "Support provided",
  progress: "Progress update",
  follow_up: "Follow-up visit or call",
  referral: "Referral",
  communication: "Contact with family or school",
};
export const noteKindOptions = toOptions(noteKindLabels);

export const assistanceCategories: Option[] = [
  { value: "school_fees", label: "School fees" },
  { value: "exam_fees", label: "Examination fees" },
  { value: "uniform", label: "School uniform and footwear" },
  { value: "books", label: "Textbooks and exercise books" },
  { value: "bag_stationery", label: "School bag and stationery" },
  { value: "device", label: "Laptop, computer or tablet" },
  { value: "internet", label: "Internet and digital learning support" },
  { value: "transport", label: "Transportation" },
  { value: "assistive_device", label: "Assistive device" },
  { value: "vocational", label: "Vocational training materials" },
  { value: "other", label: "Other educational support" },
];

export const assistanceStatusLabels: Record<AssistanceStatus, string> = {
  requested: "Requested",
  pending: "Pending",
  approved: "Approved",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
export const assistanceStatusOptions = toOptions(assistanceStatusLabels);

export function labelOf(options: Option[], value: string | null | undefined) {
  if (!value) return null;
  return options.find((option) => option.value === value)?.label ?? value;
}

export function formatGhs(pesewas: number) {
  return `GHS ${(pesewas / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

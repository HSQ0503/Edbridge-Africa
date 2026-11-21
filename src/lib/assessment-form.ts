// EdBridge's Comprehensive Beneficiary Assessment (v1.0, 15 November 2026) as data, so the form, the read-only view
// and the server's validation all come from one definition. Sections 1 and 2.1/2.2 come from the registration record
// instead, so nobody types the same details twice.

type Option = { value: string; label: string };

export type AssessmentField =
  | { kind: "text" | "textarea" | "date"; name: string; label: string; hint?: string }
  | { kind: "number"; name: string; label: string; hint?: string }
  | { kind: "radio"; name: string; label: string; hint?: string; options: Option[]; other?: boolean }
  // Multi-select, as the assessment requires. `exclusive` options can't be ticked together with any other.
  | { kind: "checkboxes"; name: string; label: string; hint?: string; options: Option[]; exclusive?: string[]; other?: boolean }
  | { kind: "priorities"; name: string; label: string; areas: Option[] }
  | { kind: "costs"; name: string; label: string; items: Option[] }
  | { kind: "plan"; name: string; label: string; rows: number }
  | { kind: "scores"; name: string; label: string };

export type AssessmentSection = {
  id: string;
  title: string;
  description?: string;
  // Disability, health and safeguarding answers: shown only to staff with the "sensitive details" role and the assessor.
  sensitive?: boolean;
  fields: AssessmentField[];
};

export type Answers = Record<string, string | string[]>;

const opts = (...labels: [string, string][]): Option[] => labels.map(([value, label]) => ({ value, label }));

export const educationStatuses = opts(
  ["enrolled", "Currently enrolled in school"],
  ["out_of_school", "Out of school"],
  ["never_enrolled", "Never enrolled in school"],
  ["dropped_out", "Dropped out"],
  ["at_risk", "At risk of dropping out"],
  ["informal", "Participating in informal education"],
  ["adult_literacy", "Participating in adult literacy education"],
  ["other", "Other"],
);

export const recommendations = opts(
  ["immediate", "Recommended for immediate support"],
  ["regular", "Recommended for regular support"],
  ["partial", "Recommended for partial support"],
  ["waiting_list", "Placed on waiting list"],
  ["referred", "Referred to another service provider"],
  ["further_assessment", "Further assessment required"],
  ["not_eligible", "Not currently eligible"],
);

const skillLevels = opts(["good", "Good"], ["fair", "Fair"], ["needs_support", "Needs support"], ["not_assessed", "Not assessed"]);

// Appendix A: a draft administrative aid, not a validated eligibility instrument.
export const scoreCategories = [
  { value: "economic", label: "Household economic vulnerability", max: 20 },
  { value: "educational", label: "Educational disadvantage", max: 25 },
  { value: "family", label: "Family and caregiving circumstances", max: 15 },
  { value: "disability", label: "Disability and inclusion barriers", max: 15 },
  { value: "welfare", label: "Basic welfare and living conditions", max: 10 },
  { value: "dropout", label: "Risk of dropping out or prolonged exclusion", max: 10 },
  { value: "support", label: "Limited access to other support", max: 5 },
] as const;

export const priorityBands = [
  { value: "critical", label: "Critical priority", min: 80, response: "Prompt review of urgent intervention needs" },
  { value: "high", label: "High priority", min: 65, response: "Strong recommendation for support" },
  { value: "moderate", label: "Moderate priority", min: 45, response: "Consider support based on needs and resources" },
  { value: "lower", label: "Lower priority", min: 0, response: "Consider monitoring, referral or alternative support" },
] as const;

export function priorityBand(score: number) {
  return priorityBands.find((band) => score >= band.min) ?? priorityBands[priorityBands.length - 1];
}

const priorityLevels = opts(["critical", "Critical"], ["high", "High"], ["moderate", "Moderate"], ["low", "Low"]);
const planStatuses = opts(["not_started", "Not started"], ["in_progress", "In progress"], ["done", "Done"]);

export const assessmentSections: AssessmentSection[] = [
  {
    id: "household",
    title: "2. Family and household background",
    description: "Household details and family circumstances are on the registration record. Add anything else here.",
    fields: [
      {
        kind: "textarea",
        name: "familyNotes",
        label: "2.3 Additional family information",
        hint: "Household circumstances and challenges affecting the beneficiary's education, development and general welfare",
      },
    ],
  },
  {
    id: "education",
    title: "3. Educational background and assessment",
    fields: [
      { kind: "radio", name: "educationStatus", label: "3.1 Current educational status", options: educationStatuses, other: true },
      { kind: "text", name: "schoolName", label: "Name of school or institution" },
      { kind: "text", name: "currentClass", label: "Current class or grade" },
      { kind: "text", name: "lastClassCompleted", label: "Last class or grade completed" },
      { kind: "number", name: "yearLastAttended", label: "Year last attended school" },
      { kind: "number", name: "yearsOutOfSchool", label: "Number of years out of school", hint: "If applicable" },
      { kind: "text", name: "academicPerformance", label: "Academic performance" },
      { kind: "text", name: "attendanceRecord", label: "Attendance record" },
      { kind: "text", name: "preferredInstitution", label: "Preferred educational institution", hint: "If applicable" },
      {
        kind: "checkboxes",
        name: "disruptionReasons",
        label: "3.3 Reasons for educational disruption",
        hint: "Select all that apply",
        other: true,
        options: opts(
          ["fees", "Inability to pay school fees or approved school-related expenses"],
          ["materials", "Inability to purchase textbooks and learning materials"],
          ["uniform", "Lack of school uniforms, footwear or basic supplies"],
          ["disability", "Disability-related barriers"],
          ["distance", "Long distance to school"],
          ["finances", "Family financial difficulties"],
          ["guardian_loss", "Loss of parent or guardian"],
          ["labour", "Child labour or excessive domestic responsibilities"],
          ["pregnancy", "Early pregnancy or parenting responsibilities"],
          ["bullying", "Bullying or discrimination"],
          ["health", "Health-related challenges"],
          ["performance", "Poor academic performance"],
          ["parental_support", "Lack of parental support"],
          ["language", "Language barriers"],
          ["other", "Other"],
        ),
      },
      {
        kind: "checkboxes",
        name: "academicNeeds",
        label: "3.4 Academic needs assessment",
        hint: "Select all that apply",
        other: true,
        options: opts(
          ["basic_literacy", "Basic literacy"],
          ["reading", "Reading comprehension"],
          ["writing", "Writing skills"],
          ["numeracy", "Numeracy"],
          ["mathematics", "Mathematics"],
          ["science", "Science education"],
          ["english", "English language development"],
          ["digital_literacy", "Digital literacy"],
          ["ict", "ICT education"],
          ["stem", "STEM education"],
          ["exams", "Examination preparation"],
          ["homework", "Homework and academic support"],
          ["remedial", "Remedial education"],
          ["vocational", "Vocational and technical education"],
          ["career", "Career guidance"],
          ["other", "Other"],
        ),
      },
      { kind: "radio", name: "skill.reading", label: "Reading and writing ability", options: skillLevels },
      { kind: "radio", name: "skill.numeracy", label: "Mathematics and numeracy", options: skillLevels },
      { kind: "radio", name: "skill.communication", label: "Communication and problem-solving", options: skillLevels },
      { kind: "radio", name: "skill.digital", label: "Digital literacy", options: skillLevels },
      {
        kind: "textarea",
        name: "educationFindings",
        label: "3.5 Educational assessment findings",
        hint: "Learning needs, strengths, learning gaps, learning difficulties, academic observations and recommended interventions",
      },
    ],
  },
  {
    id: "disability",
    title: "4. Disability, accessibility and inclusion",
    description: "Record what the beneficiary or caregiver discloses. Do not diagnose.",
    sensitive: true,
    fields: [
      {
        kind: "checkboxes",
        name: "disabilities",
        label: "Does the beneficiary identify or have a documented disability or additional support need?",
        hint: "Select all that apply",
        other: true,
        exclusive: ["none"],
        options: opts(
          ["none", "No disability or additional support need disclosed"],
          ["physical", "Physical disability"],
          ["visual", "Visual impairment"],
          ["hearing", "Hearing impairment"],
          ["speech", "Speech or communication disability"],
          ["intellectual", "Intellectual disability"],
          ["learning", "Learning disability"],
          ["psychosocial", "Psychosocial disability"],
          ["multiple", "Multiple disabilities"],
          ["other", "Other"],
          ["not_established", "Not established / further assessment required"],
        ),
      },
      {
        kind: "checkboxes",
        name: "accessibilitySupport",
        label: "4.1 Accessibility and support requirements",
        hint: "Select all that apply",
        other: true,
        options: opts(
          ["assistive_devices", "Assistive devices"],
          ["accessible_materials", "Accessible learning materials"],
          ["sign_language", "Sign language support"],
          ["braille", "Braille or large-print materials"],
          ["mobility", "Mobility assistance"],
          ["facilities", "Accessible school facilities"],
          ["individual_support", "Individualized learning support"],
          ["communication", "Communication assistance"],
          ["specialist_referral", "Referral to relevant specialists"],
          ["other", "Other"],
        ),
      },
      { kind: "textarea", name: "communicationNeeds", label: "Communication and assistive technology requirements" },
      {
        kind: "radio",
        name: "inclusiveFacilities",
        label: "Are inclusive educational facilities available to the beneficiary?",
        options: opts(["yes", "Yes"], ["partly", "Partly"], ["no", "No"], ["unknown", "Not known"]),
      },
      {
        kind: "textarea",
        name: "inclusionNotes",
        label: "4.2 Inclusion assessment",
        hint: "Physical, communication, educational, social or environmental barriers, including at school, and learning accommodations needed",
      },
      { kind: "text", name: "inclusionReferrals", label: "Referrals to service providers" },
    ],
  },
  {
    id: "wellbeing",
    title: "5. Health, safety and general wellbeing",
    sensitive: true,
    fields: [
      {
        kind: "checkboxes",
        name: "wellbeing",
        label: "5.1 General wellbeing",
        hint: "Select all that apply",
        other: true,
        options: opts(
          ["nutrition", "Inadequate nutrition"],
          ["clothing", "Inadequate clothing"],
          ["accommodation", "Lack of safe accommodation"],
          ["healthcare", "Lack of access to healthcare"],
          ["psychosocial", "Emotional or psychosocial support needs"],
          ["equipment", "Lack of assistive or mobility equipment"],
          ["unsafe_environment", "Unsafe living environment"],
          ["protection", "Protection concerns"],
          ["other", "Other"],
        ),
      },
      {
        kind: "checkboxes",
        name: "safeguardingConcerns",
        label: "5.2 Safeguarding concerns",
        hint: "Record only what is needed for protection and referral. Do not investigate allegations through this form. Refer urgent concerns to the Safeguarding Officer immediately.",
        exclusive: ["none", "not_assessed"],
        options: opts(
          ["neglect", "Neglect"],
          ["abuse", "Abuse"],
          ["exploitation", "Exploitation"],
          ["child_labour", "Child labour"],
          ["trafficking", "Trafficking"],
          ["violence", "Violence"],
          ["bullying", "Bullying"],
          ["unsafe_conditions", "Unsafe living conditions"],
          ["other", "Other protection concerns"],
          ["none", "No concern identified"],
          ["not_assessed", "Not assessed / unknown"],
        ),
      },
      {
        kind: "text",
        name: "safeguardingReference",
        label: "Restricted safeguarding referral reference",
        hint: "The reference of the safeguarding report, for example EBA-REP-…. Don't write a detailed account here.",
      },
    ],
  },
  {
    id: "financial",
    title: "6. Financial needs assessment",
    description: "Household income, dependants and employment are on the registration record.",
    fields: [
      { kind: "text", name: "mainEarner", label: "Main income earner" },
      { kind: "textarea", name: "otherObligations", label: "Other significant financial obligations" },
      {
        kind: "checkboxes",
        name: "educationExpenses",
        label: "6.2 Educational expenses and financial needs",
        hint: "Select all that apply",
        other: true,
        options: opts(
          ["fees", "School fees or approved educational charges"],
          ["uniforms", "School uniforms"],
          ["footwear", "Footwear"],
          ["textbooks", "Textbooks"],
          ["stationery", "Exercise books and stationery"],
          ["bags", "School bags"],
          ["transport", "Transportation"],
          ["devices", "Digital devices"],
          ["internet", "Internet/data support"],
          ["exam_fees", "Examination fees"],
          ["vocational", "Vocational training costs"],
          ["assistive", "Assistive devices"],
          ["other", "Other"],
        ),
      },
      {
        kind: "costs",
        name: "cost",
        label: "6.3 Estimated financial support required (GHS)",
        items: opts(
          ["fees", "School fees/approved charges"],
          ["uniform", "Uniform and footwear"],
          ["books", "Books and stationery"],
          ["transport", "Transportation"],
          ["digital", "Digital learning resources"],
          ["assistive", "Assistive equipment"],
          ["other", "Other"],
        ),
      },
    ],
  },
  {
    id: "personal",
    title: "7. Personal circumstances and aspirations",
    fields: [
      {
        kind: "textarea",
        name: "personalBackground",
        label: "7.1 Personal background",
        hint: "The beneficiary's educational journey, personal circumstances, challenges and aspirations",
      },
      {
        kind: "checkboxes",
        name: "interests",
        label: "7.2 Interests and strengths",
        hint: "Select all that apply",
        other: true,
        options: opts(
          ["academic", "Academic interests"],
          ["sports", "Sports"],
          ["arts", "Arts and creativity"],
          ["technology", "Technology and innovation"],
          ["agriculture", "Agriculture"],
          ["entrepreneurship", "Entrepreneurship"],
          ["leadership", "Leadership"],
          ["vocational", "Vocational skills"],
          ["other", "Other"],
        ),
      },
      { kind: "textarea", name: "aspirations", label: "7.3 What does the beneficiary hope to become or achieve?" },
    ],
  },
  {
    id: "support",
    title: "8. Parent/guardian and community support",
    fields: [
      {
        kind: "checkboxes",
        name: "supportAvailable",
        label: "Support around the beneficiary",
        hint: "Select all that apply",
        exclusive: ["none_known", "unknown"],
        options: opts(
          ["guardian_supportive", "Parent/guardian is supportive of education"],
          ["family_willing", "Family willing to participate in development activities"],
          ["community", "Community support system is available"],
          ["other_organisation", "Beneficiary receives assistance from another organization"],
          ["none_known", "No known additional support"],
          ["unknown", "Not known"],
        ),
      },
      { kind: "text", name: "existingOrganisations", label: "Existing organizations providing assistance" },
      { kind: "textarea", name: "familyContribution", label: "Additional support the family or community can provide" },
      { kind: "textarea", name: "supportNotes", label: "Other relevant notes" },
    ],
  },
  {
    id: "priorities",
    title: "9. Needs and priority assessment",
    fields: [
      {
        kind: "priorities",
        name: "priority",
        label: "Select every relevant intervention area, then give each one a priority",
        areas: opts(
          ["enrolment", "School enrolment/re-enrolment"],
          ["sponsorship", "Educational sponsorship"],
          ["materials", "Learning materials"],
          ["literacy", "Literacy and numeracy"],
          ["digital", "Digital education"],
          ["inclusion", "Disability inclusion support"],
          ["assistive", "Assistive devices"],
          ["vocational", "Vocational training"],
          ["psychosocial", "Psychosocial support"],
          ["referral", "Health or welfare referral"],
          ["family", "Family/community support"],
          ["other", "Other"],
        ),
      },
    ],
  },
  {
    id: "scoring",
    title: "Priority score",
    description:
      "Appendix A's proposed scoring model: a draft administrative aid, not a validated eligibility instrument. Disability must not automatically raise or lower eligibility; score the actual barriers and costs. An urgent protection concern needs immediate attention whatever the score.",
    fields: [{ kind: "scores", name: "score", label: "Points awarded" }],
  },
  {
    id: "recommendation",
    title: "10. Selection and recommendation",
    fields: [
      {
        kind: "textarea",
        name: "assessmentSummary",
        label: "10.1 Assessment summary",
        hint: "Circumstances, vulnerabilities, educational needs and recommended support",
      },
      {
        kind: "checkboxes",
        name: "recommendedInterventions",
        label: "10.2 Recommended intervention",
        hint: "Select all that apply",
        other: true,
        options: opts(
          ["full_sponsorship", "Full educational sponsorship"],
          ["partial_sponsorship", "Partial educational sponsorship"],
          ["enrolment", "School enrolment or re-enrolment assistance"],
          ["materials", "Educational materials support"],
          ["literacy", "Literacy and numeracy programme"],
          ["digital", "Digital learning programme"],
          ["inclusion", "Disability inclusion support"],
          ["assistive", "Assistive equipment support"],
          ["vocational", "Vocational or skills training"],
          ["partner_referral", "Referral to partner organization"],
          ["other", "Other"],
        ),
      },
      { kind: "radio", name: "recommendation", label: "10.3 Assessment decision", options: recommendations },
      { kind: "textarea", name: "recommendationReason", label: "Reason for decision" },
    ],
  },
  {
    id: "plan",
    title: "11. Support plan",
    fields: [
      { kind: "plan", name: "plan", label: "Planned support", rows: 5 },
      { kind: "text", name: "outcome1", label: "Expected outcome 1" },
      { kind: "text", name: "outcome2", label: "Expected outcome 2" },
      { kind: "text", name: "outcome3", label: "Expected outcome 3" },
    ],
  },
  {
    id: "monitoring",
    title: "12. Monitoring and follow-up",
    fields: [
      { kind: "date", name: "assessmentDate", label: "Initial assessment date" },
      { kind: "date", name: "nextReviewDate", label: "Next review date" },
      { kind: "text", name: "schoolFollowUp", label: "School/institution follow-up" },
      { kind: "textarea", name: "academicProgress", label: "Academic progress" },
      { kind: "textarea", name: "attendanceProgress", label: "Attendance progress" },
      { kind: "textarea", name: "welfareProgress", label: "Welfare progress" },
      { kind: "textarea", name: "supportProvided", label: "Support provided" },
      { kind: "textarea", name: "outstandingNeeds", label: "Outstanding needs" },
      { kind: "textarea", name: "nextSteps", label: "Recommended next steps" },
      { kind: "textarea", name: "reviewNotes", label: "Review notes" },
    ],
  },
  {
    id: "declaration",
    title: "13. Consent and declaration",
    description:
      "Signatures and thumbprints stay on the paper form. Consent for photographs, publicity or a story is separate, and refusing it must not affect eligibility.",
    fields: [
      {
        kind: "radio",
        name: "declarationSigned",
        label: "Has the declaration been signed by the parent/guardian (and the beneficiary where appropriate)?",
        options: opts(["yes", "Yes, the signed form is on file"], ["no", "Not yet"]),
      },
      { kind: "text", name: "declarationGuardian", label: "Parent/guardian who signed" },
      { kind: "text", name: "declarationRelationship", label: "Relationship to beneficiary" },
      { kind: "date", name: "declarationDate", label: "Date signed" },
      { kind: "text", name: "officerPosition", label: "Assessment officer's position" },
      { kind: "text", name: "supervisorName", label: "Supervisor/Programme Manager name" },
      { kind: "text", name: "supervisorPosition", label: "Supervisor's position" },
      { kind: "date", name: "supervisorDate", label: "Date reviewed by supervisor" },
    ],
  },
];

export const sensitiveSectionIds = new Set(assessmentSections.filter((section) => section.sensitive).map((section) => section.id));

// ─── Reading answers ─────────────────────────────────────────────────────────

export const otherName = (name: string) => `${name}.other`;

export function scoreTotal(answers: Answers): number | null {
  let total = 0;
  for (const category of scoreCategories) {
    const value = answers[`score.${category.value}`];
    if (typeof value !== "string" || value === "") return null;
    total += Number(value);
  }
  return total;
}

export function costTotal(answers: Answers, items: Option[], name = "cost") {
  return items.reduce((sum, item) => {
    const value = Number(answers[`${name}.${item.value}`] ?? "");
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
}

export function hasSafeguardingConcern(answers: Answers) {
  const concerns = answers.safeguardingConcerns;
  return Array.isArray(concerns) && concerns.some((concern) => concern !== "none" && concern !== "not_assessed");
}

export function hasAccessibilityNeeds(answers: Answers) {
  const disabilities = answers.disabilities;
  const support = answers.accessibilitySupport;
  return (
    (Array.isArray(disabilities) && disabilities.some((value) => value !== "none")) ||
    (Array.isArray(support) && support.length > 0)
  );
}

// Every input name the form can send, so unknown keys are dropped instead of stored.
function fieldNames(field: AssessmentField): { name: string; multi?: boolean; field: AssessmentField }[] {
  switch (field.kind) {
    case "checkboxes":
      return [{ name: field.name, multi: true, field }, ...(field.other ? [{ name: otherName(field.name), field }] : [])];
    case "radio":
      return [{ name: field.name, field }, ...(field.other ? [{ name: otherName(field.name), field }] : [])];
    case "priorities":
      return [
        { name: field.name, multi: true, field },
        ...field.areas.flatMap((area) => [
          { name: `${field.name}.${area.value}.level`, field },
          { name: `${field.name}.${area.value}.notes`, field },
        ]),
      ];
    case "costs":
      return field.items.flatMap((item) => [
        { name: `${field.name}.${item.value}`, field },
        { name: `${field.name}.${item.value}.notes`, field },
      ]);
    case "plan":
      return Array.from({ length: field.rows }, (_, row) =>
        ["need", "intervention", "officer", "date", "status"].map((part) => ({ name: `${field.name}.${row}.${part}`, field })),
      ).flat();
    case "scores":
      return scoreCategories.flatMap((category) => [
        { name: `${field.name}.${category.value}`, field },
        { name: `${field.name}.${category.value}.evidence`, field },
      ]);
    default:
      return [{ name: field.name, field }];
  }
}

const allFields = assessmentSections.flatMap((section) =>
  section.fields.flatMap((field) => fieldNames(field).map((entry) => ({ ...entry, section }))),
);

export type AssessmentParseResult = { answers: Answers; errors: Record<string, string[]> };

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

// Reads and checks the posted form. Drafts only need well-formed values; submitting also needs the decision and
// a complete score (EdBridge asks that unknown or not-applicable answers are never forced).
export function parseAssessment(formData: FormData, { submitting }: { submitting: boolean }): AssessmentParseResult {
  const answers: Answers = {};
  const errors: Record<string, string[]> = {};
  const fail = (name: string, message: string) => (errors[name] ??= [message]);

  for (const { name, multi, field } of allFields) {
    if (multi) {
      const values = [...new Set(formData.getAll(name).map(String))];
      const allowed = field.kind === "priorities" ? field.areas : field.kind === "checkboxes" ? field.options : [];
      if (values.some((value) => !allowed.some((option) => option.value === value))) fail(name, "Choose from the options shown");
      if (field.kind === "checkboxes" && field.exclusive && values.length > 1) {
        const exclusive = values.find((value) => field.exclusive?.includes(value));
        if (exclusive) {
          const label = field.options.find((option) => option.value === exclusive)?.label;
          fail(name, `“${label}” can't be ticked together with other options`);
        }
      }
      if (values.length) answers[name] = values;
      continue;
    }

    const value = String(formData.get(name) ?? "").trim();
    if (!value) continue;
    const limit = field.kind === "textarea" || name.endsWith(".notes") || name.endsWith(".evidence") ? 4000 : 200;
    if (value.length > limit) fail(name, `Keep this under ${limit} characters`);

    if (field.kind === "radio" && name === field.name && !field.options.some((option) => option.value === value)) {
      fail(name, "Choose from the options shown");
    } else if (field.kind === "number" && !/^\d{1,5}$/.test(value)) {
      fail(name, "Enter a whole number, like 3");
    } else if (field.kind === "date" && !isDate(value)) {
      fail(name, "Enter a real date");
    } else if (field.kind === "costs" && !name.endsWith(".notes") && !/^\d{1,7}(\.\d{1,2})?$/.test(value.replace(/,/g, ""))) {
      fail(name, "Enter an amount in cedis, like 250 or 250.50");
    } else if (field.kind === "priorities" && name.endsWith(".level") && !priorityLevels.some((option) => option.value === value)) {
      fail(name, "Choose a priority");
    } else if (field.kind === "plan" && name.endsWith(".date") && !isDate(value)) {
      fail(name, "Enter a real date");
    } else if (field.kind === "plan" && name.endsWith(".status") && !planStatuses.some((option) => option.value === value)) {
      fail(name, "Choose a status");
    } else if (field.kind === "scores" && !name.endsWith(".evidence")) {
      const category = scoreCategories.find((candidate) => name === `score.${candidate.value}`);
      if (category && (!/^\d{1,3}$/.test(value) || Number(value) > category.max)) {
        fail(name, `Enter a score from 0 to ${category.max}`);
      }
    }
    answers[name] = field.kind === "costs" ? value.replace(/,/g, "") : value;
  }

  if (submitting) {
    if (!answers.educationStatus) fail("educationStatus", "Choose the current educational status");
    for (const category of scoreCategories) {
      if (!answers[`score.${category.value}`]) fail(`score.${category.value}`, `Enter a score for ${category.label.toLowerCase()}`);
    }
    if (!answers.recommendation) fail("recommendation", "Choose the assessment decision");
    if (!answers.recommendationReason) fail("recommendationReason", "Give the reason for the decision");
  }
  return { answers, errors };
}

export { priorityLevels, planStatuses };

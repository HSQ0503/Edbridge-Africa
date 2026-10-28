export const reportTypes = [
  {
    value: "safeguarding",
    label: "A concern about a child's safety or wellbeing",
    hint: "Goes straight to our Safeguarding Lead",
  },
  {
    value: "complaint",
    label: "A complaint about our services",
    hint: "For example, support that wasn't provided or how you were treated",
  },
  {
    value: "misconduct",
    label: "Fraud, corruption or staff misconduct",
    hint: "Handled confidentially by our compliance team",
  },
  { value: "feedback", label: "Feedback or a suggestion" },
] as const;

// Reports about these leaders are routed away from them, whatever the report type.
export const reportSubjects = [
  {
    value: "executive",
    label: "The Executive Director or Deputy Executive Director",
    hint: "Your report goes only to the Board Chair",
  },
  {
    value: "safeguarding-lead",
    label: "The Safeguarding Lead",
    hint: "Your report goes to the Executive Director and the Board Chair, not the Safeguarding Lead",
  },
  { value: "neither", label: "Neither of them, or I'm not sure" },
] as const;

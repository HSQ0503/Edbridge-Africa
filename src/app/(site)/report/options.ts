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
    hint: "Handled confidentially by our compliance team, or by the Board if it involves senior staff",
  },
  { value: "feedback", label: "Feedback or a suggestion" },
] as const;

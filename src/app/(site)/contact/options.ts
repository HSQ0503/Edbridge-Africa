export const contactTopicValues = ["general", "partnership", "grants", "media", "volunteering", "donations", "other"] as const;

export type ContactTopic = (typeof contactTopicValues)[number];

export const contactTopics: { value: ContactTopic; label: string }[] = [
  { value: "general", label: "General enquiry" },
  { value: "partnership", label: "Corporate or institutional partnership" },
  { value: "grants", label: "Grants and project funding" },
  { value: "media", label: "Media and press" },
  { value: "volunteering", label: "Volunteering" },
  { value: "donations", label: "Donations and sponsorship" },
  { value: "other", label: "Something else" },
];

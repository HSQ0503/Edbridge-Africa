export const volunteerInterests = [
  { value: "tutoring", label: "Tutoring in reading, maths or other subjects" },
  { value: "mentoring", label: "Mentoring young people" },
  { value: "digital-skills", label: "Digital skills, coding or STEM sessions" },
  { value: "disability-support", label: "Supporting children with disabilities" },
  { value: "community-outreach", label: "Community outreach and family engagement" },
  { value: "events", label: "Events and fundraising" },
  { value: "professional-skills", label: "Professional skills, such as finance, design or IT" },
] as const;

export const volunteerAvailability = [
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "flexible", label: "Flexible" },
  { value: "remote", label: "Remote only" },
] as const;

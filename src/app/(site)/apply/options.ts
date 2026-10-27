import { ghanaRegions } from "@/content/regions";

export const applicantTypes = [
  { value: "guardian", label: "I am the child's parent or guardian" },
  { value: "young-person", label: "I am a young person aged 18 or over, applying for myself" },
  { value: "school", label: "I am a teacher or school leader referring a learner" },
  { value: "community", label: "I am a community member or organisation helping a family" },
] as const;

export const schoolStatuses = [
  { value: "enrolled", label: "In school, but at risk of leaving" },
  { value: "dropped-out", label: "Has dropped out of school" },
  { value: "never-enrolled", label: "Has never been to school" },
  { value: "returning", label: "Wants to return to school or training" },
] as const;

export const supportTypes = [
  { value: "fees", label: "School or examination fees" },
  { value: "uniform", label: "Uniform and shoes" },
  { value: "books", label: "Books and stationery" },
  { value: "transport", label: "Transport to school" },
  { value: "meals", label: "School meals" },
  { value: "tutoring", label: "Tutoring or extra lessons" },
  { value: "assistive-device", label: "An assistive device or accessible materials" },
  { value: "skills", label: "Vocational training or career guidance" },
  { value: "other", label: "Something else" },
] as const;

export const regionOptions = ghanaRegions.map((region) => ({ value: region, label: region }));

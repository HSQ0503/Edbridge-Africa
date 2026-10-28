import type { CollectionConfig } from "payload";
import { editorialAccess } from "../access";
import { revalidateOnChange, revalidateOnDelete } from "../revalidate";
import { enforceWorkflow, slugField, workflowFields } from "../workflow";

export const Jobs: CollectionConfig = {
  slug: "jobs",
  labels: { singular: "Vacancy", plural: "Vacancies" },
  admin: { useAsTitle: "title", defaultColumns: ["title", "department", "closingDate", "_status"] },
  access: editorialAccess,
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeChange: [enforceWorkflow()],
    afterChange: [revalidateOnChange("jobs")],
    afterDelete: [revalidateOnDelete("jobs")],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "department", type: "text", required: true },
    { name: "location", type: "text", required: true },
    {
      name: "employmentType",
      type: "select",
      required: true,
      options: [
        { label: "Full-time", value: "full-time" },
        { label: "Part-time", value: "part-time" },
        { label: "Fixed-term contract", value: "contract" },
        { label: "Internship", value: "internship" },
      ],
    },
    {
      name: "closingDate",
      type: "date",
      required: true,
      admin: { description: "The vacancy disappears from the website after this date", date: { pickerAppearance: "dayOnly" } },
    },
    { name: "summary", type: "textarea", required: true, maxLength: 300 },
    { name: "description", type: "richText", required: true },
    {
      name: "involvesChildren",
      type: "checkbox",
      label: "Role involves contact with children",
      admin: { description: "Shows the police background check requirement on the vacancy" },
    },
    slugField(),
    ...workflowFields,
  ],
};

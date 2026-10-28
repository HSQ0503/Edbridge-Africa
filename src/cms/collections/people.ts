import type { CollectionConfig } from "payload";
import { editorialAccess } from "../access";
import { revalidateOnChange, revalidateOnDelete } from "../revalidate";
import { enforceWorkflow, workflowFields } from "../workflow";

export const People: CollectionConfig = {
  slug: "people",
  labels: { singular: "Person", plural: "Board and leadership" },
  admin: { useAsTitle: "role", defaultColumns: ["role", "name", "group", "order", "_status"] },
  access: editorialAccess,
  versions: { drafts: true, maxPerDoc: 20 },
  defaultSort: "order",
  hooks: {
    beforeChange: [enforceWorkflow(["photo"])],
    afterChange: [revalidateOnChange("people")],
    afterDelete: [revalidateOnDelete("people")],
  },
  fields: [
    { name: "role", type: "text", required: true },
    { name: "name", type: "text", admin: { description: "Leave blank while the position is vacant" } },
    {
      name: "group",
      type: "select",
      required: true,
      options: [
        { label: "Board of Directors", value: "board" },
        { label: "Executive team", value: "executive" },
      ],
    },
    { name: "bio", type: "textarea", maxLength: 800 },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "order", type: "number", required: true, defaultValue: 100, admin: { description: "Lower numbers appear first" } },
    ...workflowFields,
  ],
};

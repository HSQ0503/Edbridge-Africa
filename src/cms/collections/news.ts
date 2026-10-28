import type { CollectionConfig } from "payload";
import { editorialAccess } from "../access";
import { revalidateOnChange, revalidateOnDelete } from "../revalidate";
import { enforceWorkflow, slugField, workflowFields } from "../workflow";

export const News: CollectionConfig = {
  slug: "news",
  labels: { singular: "News item", plural: "News, events and publications" },
  admin: { useAsTitle: "title", defaultColumns: ["title", "type", "date", "reviewState", "_status"] },
  access: editorialAccess,
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: {
    beforeChange: [enforceWorkflow(["image"])],
    afterChange: [revalidateOnChange("news")],
    afterDelete: [revalidateOnDelete("news")],
  },
  fields: [
    { name: "title", type: "text", required: true, maxLength: 120 },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "news",
      options: [
        { label: "News", value: "news" },
        { label: "Event", value: "event" },
        { label: "Publication or report", value: "publication" },
      ],
    },
    {
      name: "date",
      type: "date",
      required: true,
      admin: { description: "For events, the date of the event. Otherwise, the date it was published." },
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      maxLength: 300,
      admin: { description: "One or two sentences shown in lists and search results" },
    },
    { name: "image", type: "upload", relationTo: "media" },
    {
      type: "group",
      name: "event",
      label: "Event details",
      admin: { condition: (data) => data?.type === "event" },
      fields: [
        { name: "venue", type: "text" },
        {
          name: "accessibility",
          type: "textarea",
          admin: { description: "Step-free access, sign language interpretation, accessible toilets, how to ask for support" },
        },
      ],
    },
    { name: "body", type: "richText" },
    slugField(),
    ...workflowFields,
  ],
};

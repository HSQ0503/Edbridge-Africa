import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig, Where } from "payload";
import { publishers, signedIn } from "../access";
import { revalidateOnChange, revalidateOnDelete } from "../revalidate";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Images" },
  admin: { useAsTitle: "alt", defaultColumns: ["filename", "alt", "identifiableChild", "consentExpires"] },
  access: {
    // Visitors can only load images that don't show an identifiable child, or that have current website consent.
    read: ({ req }) => {
      if (req.user) return true;
      const consented: Where = {
        or: [
          { identifiableChild: { not_equals: true } },
          { and: [{ consentScopes: { in: ["web"] } }, { consentExpires: { greater_than: new Date().toISOString() } }] },
        ],
      };
      return consented;
    },
    create: signedIn,
    update: signedIn,
    delete: publishers,
  },
  hooks: {
    // Original names can identify a child or a place ("ama-kumasi-school.jpg").
    beforeOperation: [
      ({ req, args }) => {
        if (req.file) req.file.name = `${randomUUID()}${path.extname(req.file.name).toLowerCase()}`;
        return args;
      },
    ],
    afterChange: [revalidateOnChange("news", "people", "jobs")],
    afterDelete: [revalidateOnDelete("news", "people", "jobs")],
  },
  upload: {
    // Local development only: staging and production store files in Supabase Storage (see payload.config.ts).
    staticDir: path.resolve(dirname, "../../../media"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    // Re-encoding every upload with sharp also strips EXIF data, including GPS location (PLAN.md §6.4).
    formatOptions: { format: "webp", options: { quality: 82 } },
    resizeOptions: { width: 2400, height: 2400, fit: "inside", withoutEnlargement: true },
    imageSizes: [
      { name: "card", width: 800, formatOptions: { format: "webp", options: { quality: 80 } } },
      { name: "thumbnail", width: 400, formatOptions: { format: "webp", options: { quality: 80 } } },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Description for screen readers",
      admin: { description: "What the image shows, in a sentence. Required unless the image is decorative." },
      validate: (value: unknown, { siblingData }: { siblingData: { decorative?: boolean } }) =>
        siblingData.decorative || (typeof value === "string" && value.trim()) ? true : "Describe the image, or mark it as decorative",
    },
    { name: "decorative", type: "checkbox", label: "Decorative only (adds nothing for screen reader users)" },
    {
      type: "collapsible",
      label: "Consent",
      fields: [
        {
          name: "identifiableChild",
          type: "checkbox",
          label: "Shows a child who could be recognised",
          admin: { description: "Then a current consent record covering the website is required before it can appear." },
        },
        {
          name: "consentReference",
          type: "text",
          label: "Consent record reference",
          access: { read: ({ req }) => Boolean(req.user) },
          admin: { condition: (_, siblingData) => Boolean(siblingData?.identifiableChild) },
        },
        {
          name: "consentScopes",
          type: "select",
          hasMany: true,
          label: "Consent covers",
          options: [
            { label: "Website", value: "web" },
            { label: "Social media", value: "social" },
            { label: "Print", value: "print" },
            { label: "Donor reports", value: "donor_reports" },
          ],
          admin: { condition: (_, siblingData) => Boolean(siblingData?.identifiableChild) },
        },
        {
          name: "consentExpires",
          type: "date",
          label: "Consent expires",
          admin: { condition: (_, siblingData) => Boolean(siblingData?.identifiableChild), date: { pickerAppearance: "dayOnly" } },
        },
      ],
    },
  ],
};

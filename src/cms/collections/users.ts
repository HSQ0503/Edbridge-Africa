import type { CollectionConfig } from "payload";
import { portalStrategy } from "../portal-strategy";

// Read-only mirror of portal accounts. Roles are granted with `npm run staff:add -- --cms <role>`.
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Editor", plural: "Editors" },
  auth: { disableLocalStrategy: true, strategies: [portalStrategy] },
  admin: { useAsTitle: "name", defaultColumns: ["name", "email", "roles"] },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "portalUserId", type: "text", required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: "name", type: "text", required: true, admin: { readOnly: true } },
    { name: "email", type: "email", required: true, admin: { readOnly: true } },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      options: [
        { label: "Writer", value: "writer" },
        { label: "Publisher", value: "publisher" },
        { label: "Safeguarding reviewer", value: "safeguarding_reviewer" },
      ],
      admin: { readOnly: true },
    },
  ],
};

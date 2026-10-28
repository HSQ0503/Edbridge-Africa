import type { GlobalConfig } from "payload";
import { publishers } from "../access";
import { revalidateGlobal } from "../revalidate";

// Contact details appear on every page, so only publishers can change them and every change is versioned.
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Contact details",
  access: { read: ({ req }) => Boolean(req.user), update: publishers, readVersions: publishers },
  versions: { max: 50 },
  hooks: { afterChange: [revalidateGlobal("settings")] },
  fields: [
    // Plain text so a placeholder can stand in until EdBridge confirms its address.
    { name: "email", type: "text", required: true },
    { name: "phone", type: "text", required: true },
    { name: "whatsapp", type: "text" },
    { name: "address", type: "textarea", required: true },
    { name: "ghanaPostGps", type: "text", label: "GhanaPostGPS address" },
    { name: "hours", type: "text", required: true, defaultValue: "Monday to Friday, 8:30am – 5:00pm (GMT)" },
    {
      name: "emergencyNumbers",
      type: "text",
      required: true,
      admin: { description: "Shown on the report page for a child in immediate danger. Confirm with the Safeguarding Lead." },
    },
  ],
};

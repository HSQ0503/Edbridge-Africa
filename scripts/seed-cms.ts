// Fills an empty CMS with the placeholder contact details and leadership positions, so every page renders before
// EdBridge supplies real content. Safe to run again: it only adds what is missing.
import { getPayload } from "payload";
import config from "../src/payload.config";

// Seeding happens outside Next.js and without a signed-in editor, so the review workflow and cache revalidation
// are skipped (see src/cms/workflow.ts and src/cms/revalidate.ts).
const context = { outsideNext: true };

const placeholderPositions = [
  ...["Board Chairperson", "Vice Chairperson", "Board Secretary", "Board Treasurer", "Board Member", "Board Member"].map(
    (role) => ({ role, group: "board" as const }),
  ),
  ...["Executive Director", "Deputy Executive Director", "Director of Programs", "Director of Operations"].map((role) => ({
    role,
    group: "executive" as const,
  })),
];

const payload = await getPayload({ config });

const settings = await payload.findGlobal({ slug: "site-settings" });
if (!settings.phone) {
  await payload.updateGlobal({
    slug: "site-settings",
    context,
    data: {
      email: "[email address to be confirmed]",
      phone: "[phone number to be confirmed]",
      whatsapp: "[WhatsApp number to be confirmed]",
      address: "[Office address to be confirmed]",
      ghanaPostGps: "[GhanaPostGPS address to be confirmed]",
      hours: "Monday to Friday, 8:30am – 5:00pm (GMT)",
      emergencyNumbers: "[emergency numbers to be confirmed by the Safeguarding Lead]",
    },
  });
  console.log("Added placeholder contact details");
}

const { totalDocs } = await payload.count({ collection: "people" });
if (totalDocs === 0) {
  for (const [index, position] of placeholderPositions.entries()) {
    await payload.create({
      collection: "people",
      context,
      data: { ...position, order: (index + 1) * 10, reviewState: "approved", _status: "published" },
    });
  }
  console.log(`Added ${placeholderPositions.length} leadership positions`);
}

console.log("CMS seed complete");
process.exit(0);

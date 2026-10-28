import { createHash } from "node:crypto";
import { APIError, type CollectionBeforeChangeHook, type Field, type PayloadRequest } from "payload";
import { hasRole } from "./access";

// Draft → ready for review → approved (or changes requested) → published, as in PLAN.md §6.4.
export const workflowFields: Field[] = [
  {
    name: "reviewState",
    type: "select",
    required: true,
    defaultValue: "draft",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Ready for review", value: "in_review" },
      { label: "Changes requested", value: "changes_requested" },
      { label: "Approved", value: "approved" },
    ],
    admin: {
      position: "sidebar",
      description: "Writers mark content ready for review. A publisher approves it, or asks for changes, then publishes.",
    },
  },
  {
    name: "reviewNote",
    type: "textarea",
    admin: { position: "sidebar", description: "Feedback from the reviewer" },
  },
  {
    name: "featuresChild",
    type: "checkbox",
    label: "Features a child (photo, story or name)",
    admin: { position: "sidebar", description: "The safeguarding reviewer must approve it before it is published." },
  },
  {
    name: "safeguardingApproved",
    type: "checkbox",
    label: "Safeguarding approved",
    admin: {
      position: "sidebar",
      condition: (data) => Boolean(data?.featuresChild),
      description: "Only the safeguarding reviewer can tick this. It clears when the content changes.",
    },
  },
  { name: "safeguardingApprovedHash", type: "text", admin: { hidden: true } },
];

const controlFields = new Set([
  "reviewState",
  "reviewNote",
  "featuresChild",
  "safeguardingApproved",
  "safeguardingApprovedHash",
  "_status",
  "id",
  "createdAt",
  "updatedAt",
]);

type Data = Record<string, unknown>;

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([key, item]) => [key, sortKeys(item)]),
    );
  }
  return value;
}

function mediaId(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) return value.id as number | string;
  return null;
}

// Fingerprint of everything a reader would see, so an approval can be tied to the exact version approved.
function contentHash(data: Data, mediaFields: string[]) {
  const content = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => !controlFields.has(key))
      .map(([key, value]) => [key, mediaFields.includes(key) ? mediaId(value) : value]),
  );
  return createHash("sha256").update(JSON.stringify(sortKeys(content))).digest("hex");
}

// isPublic: true lets the admin show the reason instead of a generic error.
function reject(message: string, status = 400) {
  return new APIError(message, status, null, true);
}

export function hasWebConsent(media: { identifiableChild?: boolean | null; consentScopes?: string[] | null; consentExpires?: string | null }) {
  if (!media.identifiableChild) return true;
  return Boolean(media.consentScopes?.includes("web") && media.consentExpires && new Date(media.consentExpires) > new Date());
}

async function assertImageConsent(data: Data, mediaFields: string[], req: PayloadRequest) {
  for (const field of mediaFields) {
    const id = mediaId(data[field]);
    if (id === null) continue;
    const media = await req.payload.findByID({ collection: "media", id, depth: 0, req });
    if (!hasWebConsent(media)) {
      throw reject(`The image "${media.alt || media.filename}" shows an identifiable child without current consent for the website.`);
    }
  }
}

export function enforceWorkflow(mediaFields: string[] = []): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req, context }) => {
    if (context.outsideNext) return data;
    const previous: Data = originalDoc ?? {};
    const isPublisher = hasRole(req.user, "publisher");
    const isReviewer = hasRole(req.user, "safeguarding_reviewer");
    const hash = contentHash(data, mediaFields);

    if (!isPublisher && data.reviewState !== previous.reviewState && ["approved", "changes_requested"].includes(data.reviewState)) {
      throw reject("Only a publisher can approve content or ask for changes.", 403);
    }
    // Any edit by someone who can't approve sends approved content back to draft.
    if (!isPublisher && data.reviewState === "approved") data.reviewState = "draft";

    if (data.featuresChild) {
      if (data.safeguardingApproved && !previous.safeguardingApproved && !isReviewer) {
        throw reject("Only the safeguarding reviewer can give safeguarding approval.", 403);
      }
      data.safeguardingApprovedHash =
        data.safeguardingApproved && isReviewer ? hash : (previous.safeguardingApprovedHash ?? null);
      if (data.safeguardingApproved && data.safeguardingApprovedHash !== hash) data.safeguardingApproved = false;
    } else {
      data.safeguardingApproved = false;
      data.safeguardingApprovedHash = null;
    }

    if (data._status === "published") {
      if (!isPublisher) throw reject("Only a publisher can publish. Mark it ready for review instead.", 403);
      if (data.reviewState !== "approved") throw reject("Set the review state to Approved before publishing.");
      if (data.featuresChild && !data.safeguardingApproved) {
        throw reject("This features a child, so the safeguarding reviewer must approve this version before it is published.");
      }
      await assertImageConsent(data, mediaFields, req);
    }
    return data;
  };
}

export function slugField(from = "title"): Field {
  return {
    name: "slug",
    type: "text",
    required: true,
    unique: true,
    index: true,
    admin: { position: "sidebar", description: "The web address. Filled in from the title if left blank." },
    validate: (value: unknown) =>
      typeof value === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) ? true : "Use lowercase letters, numbers and dashes",
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === "string" && value) return value;
          const source = typeof data?.[from] === "string" ? data[from] : "";
          return source
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        },
      ],
    },
  };
}

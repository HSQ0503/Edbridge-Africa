import { randomBytes } from "node:crypto";

export type IntakeKind = "volunteer" | "contact" | "report" | "support-application";

const referencePrefixes: Record<IntakeKind, string> = {
  volunteer: "VOL",
  contact: "ENQ",
  report: "REP",
  "support-application": "APP",
};

function createReference(kind: IntakeKind) {
  const code = randomBytes(4).toString("hex").toUpperCase();
  return `EBA-${referencePrefixes[kind]}-${code.slice(0, 4)}-${code.slice(4)}`;
}

type IntakeResult = { ok: true; reference: string } | { ok: false };

// Submissions go to the restricted `intake` / `safeguarding` schemas once the database exists (PLAN.md §6.3).
// Until then production refuses submissions rather than pretending to accept them.
export async function recordSubmission(kind: IntakeKind, data: Record<string, unknown>): Promise<IntakeResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false };
  }
  // Field names only — submitted values can include children's details and must never reach logs.
  console.info(`[intake] ${kind} validated, not stored (no database yet). Fields: ${Object.keys(data).join(", ")}`);
  return { ok: true, reference: createReference(kind) };
}

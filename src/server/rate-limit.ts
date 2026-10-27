import { createHmac, hkdfSync } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { prisma } from "./db";

const WINDOW_MS = 60 * 60 * 1000;
// Generous on purpose: schools and mobile networks in Ghana put many people behind one IP address.
// Turnstile is the main defence; this only stops floods.
const MAX_FORM_SUBMISSIONS_PER_WINDOW = 20;

// Vercel overwrites x-forwarded-for with the visitor's real address, so its first entry can be trusted there.
export async function getClientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

// A keyed hash, so stored values can't be reversed by hashing every possible IPv4 address.
function hashIp(ip: string) {
  const key = Buffer.from(hkdfSync("sha256", process.env.BETTER_AUTH_SECRET ?? "", "", "edbridge form rate limit", 32));
  return createHmac("sha256", key).update(ip).digest("hex");
}

export async function allowFormSubmission(ip: string | null) {
  const windowStart = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);

  try {
    const key = `form:${hashIp(ip ?? "unknown")}`;
    // One atomic statement, so simultaneous requests can't both read the same count.
    const [{ hits }] = await prisma.$queryRaw<{ hits: number }[]>`
      INSERT INTO "app"."rate_limit" ("key", "window_start", "hits") VALUES (${key}, ${windowStart}, 1)
      ON CONFLICT ("key", "window_start") DO UPDATE SET "hits" = "rate_limit"."hits" + 1
      RETURNING "hits"`;
    if (hits === 1) {
      after(() =>
        prisma.rateLimit
          .deleteMany({ where: { windowStart: { lt: windowStart } } })
          .catch(() => console.error("[rate-limit] cleanup failed")),
      );
    }
    return hits <= MAX_FORM_SUBMISSIONS_PER_WINDOW;
  } catch (error) {
    // Fail open: if the database is down the submission fails anyway, with a clearer message.
    console.error(`[rate-limit] check failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return true;
  }
}

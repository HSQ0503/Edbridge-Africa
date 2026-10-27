const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Fails closed: a missing secret or an unreachable Cloudflare means the submission is refused, not waved through.
export async function verifyTurnstile(token: string, remoteIp: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not set");
    return false;
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(SITEVERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(5000) });
    const result = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!result.success) console.info(`[turnstile] rejected: ${result["error-codes"]?.join(", ") || "no reason given"}`);
    return result.success === true;
  } catch {
    console.error("[turnstile] could not reach siteverify");
    return false;
  }
}

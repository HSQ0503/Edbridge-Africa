import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Separate keys so access to one class of records never unlocks another (PLAN.md §10).
type KeyName = "intake" | "safeguarding";

const keyEnv: Record<KeyName, string> = {
  intake: "INTAKE_ENCRYPTION_KEY",
  safeguarding: "SAFEGUARDING_ENCRYPTION_KEY",
};

// The version prefix leaves room for key rotation without re-encrypting everything at once.
const VERSION = "v1";

function getKey(name: KeyName) {
  const key = Buffer.from(process.env[keyEnv[name]] ?? "", "base64");
  if (key.length !== 32) throw new Error(`${keyEnv[name]} must be 32 bytes, base64-encoded`);
  return key;
}

// `context` (the record reference) is bound as associated data, so ciphertext can't be swapped between records.
export function encryptJson(name: KeyName, value: unknown, context: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(name), iv);
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [VERSION, iv, cipher.getAuthTag(), ciphertext].map((part) => (typeof part === "string" ? part : part.toString("base64"))).join(".");
}

export function decryptJson(name: KeyName, payload: string, context: string): unknown {
  const [version, iv, tag, ciphertext] = payload.split(".");
  if (version !== VERSION) throw new Error(`Unknown payload version: ${version}`);
  const decipher = createDecipheriv("aes-256-gcm", getKey(name), Buffer.from(iv, "base64"));
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8"));
}

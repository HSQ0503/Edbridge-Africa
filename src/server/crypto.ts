import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Separate keys so access to one class of records never unlocks another (PLAN.md §10).
type KeyName = "intake" | "safeguarding";

const keyEnv: Record<KeyName, string> = {
  intake: "INTAKE_ENCRYPTION_KEY",
  safeguarding: "SAFEGUARDING_ENCRYPTION_KEY",
};

// The version prefix leaves room for key rotation without re-encrypting everything at once.
const VERSION = "v1";
const IV_BYTES = 12;
const TAG_BYTES = 16;

function getKey(name: KeyName) {
  const key = Buffer.from(process.env[keyEnv[name]] ?? "", "base64");
  if (key.length !== 32) throw new Error(`${keyEnv[name]} must be 32 bytes, base64-encoded`);
  return key;
}

// `context` (the record reference) is bound as associated data, so ciphertext can't be swapped between records.
function seal(name: KeyName, plaintext: Buffer, context: string) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getKey(name), iv);
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { iv, tag: cipher.getAuthTag(), ciphertext };
}

function open(name: KeyName, parts: { iv: Buffer; tag: Buffer; ciphertext: Buffer }, context: string) {
  const decipher = createDecipheriv("aes-256-gcm", getKey(name), parts.iv);
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(parts.tag);
  return Buffer.concat([decipher.update(parts.ciphertext), decipher.final()]);
}

export function encryptJson(name: KeyName, value: unknown, context: string) {
  const { iv, tag, ciphertext } = seal(name, Buffer.from(JSON.stringify(value), "utf8"), context);
  return [VERSION, iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(".");
}

export function decryptJson(name: KeyName, payload: string, context: string): unknown {
  const [version, iv, tag, ciphertext] = payload.split(".");
  if (version !== VERSION) throw new Error(`Unknown payload version: ${version}`);
  const parts = { iv: Buffer.from(iv, "base64"), tag: Buffer.from(tag, "base64"), ciphertext: Buffer.from(ciphertext, "base64") };
  return JSON.parse(open(name, parts, context).toString("utf8"));
}

// Files are stored as raw bytes (version, IV, tag, ciphertext) rather than base64, which would add a third.
export function encryptBytes(name: KeyName, data: Buffer, context: string) {
  const { iv, tag, ciphertext } = seal(name, data, context);
  return Buffer.concat([Buffer.from(VERSION), iv, tag, ciphertext]);
}

export function decryptBytes(name: KeyName, payload: Uint8Array, context: string) {
  const data = Buffer.from(payload);
  const version = data.subarray(0, VERSION.length).toString();
  if (version !== VERSION) throw new Error(`Unknown payload version: ${version}`);
  const ivStart = VERSION.length;
  const tagStart = ivStart + IV_BYTES;
  const parts = {
    iv: data.subarray(ivStart, tagStart),
    tag: data.subarray(tagStart, tagStart + TAG_BYTES),
    ciphertext: data.subarray(tagStart + TAG_BYTES),
  };
  return open(name, parts, context);
}

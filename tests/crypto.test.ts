import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";

process.env.INTAKE_ENCRYPTION_KEY = randomBytes(32).toString("base64");
const { decryptBytes, decryptJson, encryptBytes, encryptJson } = await import("../src/server/crypto");

test("answers round-trip", () => {
  const answers = { name: "Test", needs: ["fees", "uniform"] };
  assert.deepEqual(decryptJson("intake", encryptJson("intake", answers, "EBA-APP-0000-0001"), "EBA-APP-0000-0001"), answers);
});

test("ciphertext can't be moved to another record", () => {
  const payload = encryptJson("intake", { name: "Test" }, "EBA-APP-0000-0001");
  assert.throws(() => decryptJson("intake", payload, "EBA-APP-0000-0002"));
});

test("files round-trip, and tampering is detected", () => {
  const file = Buffer.from("%PDF-1.4 test file");
  const payload = encryptBytes("intake", file, "EBA-JOB-0000-0001:attachment");
  assert.deepEqual(decryptBytes("intake", payload, "EBA-JOB-0000-0001:attachment"), file);
  payload[payload.length - 1] ^= 1;
  assert.throws(() => decryptBytes("intake", payload, "EBA-JOB-0000-0001:attachment"));
});

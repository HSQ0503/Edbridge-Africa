import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_UPLOAD_BYTES, readDocumentUpload } from "../src/server/uploads";

const zipHeader = [0x50, 0x4b, 0x03, 0x04];

test("accepts a PDF and a .docx, judged by their content", async () => {
  const pdf = await readDocumentUpload(new File(["%PDF-1.7 ..."], "cv.pdf"), "CV");
  assert.equal(pdf.ok && pdf.upload.mimeType, "application/pdf");
  const docx = await readDocumentUpload(new File([new Uint8Array([...zipHeader, 1, 2])], "cv.docx"), "CV");
  assert.equal(docx.ok && docx.upload.mimeType, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
});

test("rejects other files, even with a PDF name or type", async () => {
  const disguised = await readDocumentUpload(new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "cv.pdf", { type: "application/pdf" }), "CV");
  assert.equal(disguised.ok, false);
  const zip = await readDocumentUpload(new File([new Uint8Array(zipHeader)], "cv.zip"), "CV");
  assert.equal(zip.ok, false);
});

test("rejects missing and oversized files", async () => {
  assert.deepEqual(await readDocumentUpload(null, "CV"), { ok: false, error: "Choose your CV" });
  const large = await readDocumentUpload(new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "cv.pdf"), "CV");
  assert.deepEqual(large, { ok: false, error: "Your CV must be smaller than 4 MB" });
});

// Vercel rejects request bodies over 4.5 MB, so files stay under 4 MB to leave room for the rest of the form.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type Upload = { name: string; mimeType: string; bytes: Buffer };

const PDF = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// The browser's claimed type can't be trusted, so the type comes from the file's first bytes.
function detectType(bytes: Buffer, name: string) {
  if (bytes.subarray(0, 5).toString("latin1") === "%PDF-") return PDF;
  const isZip = bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  if (isZip && name.toLowerCase().endsWith(".docx")) return DOCX;
  return null;
}

export type UploadResult = { ok: true; upload: Upload } | { ok: false; error: string };

export async function readDocumentUpload(value: FormDataEntryValue | null, label: string): Promise<UploadResult> {
  if (!(value instanceof File) || value.size === 0) return { ok: false, error: `Choose your ${label}` };
  if (value.size > MAX_UPLOAD_BYTES) return { ok: false, error: `Your ${label} must be smaller than 4 MB` };
  const bytes = Buffer.from(await value.arrayBuffer());
  const mimeType = detectType(bytes, value.name);
  if (!mimeType) return { ok: false, error: `Your ${label} must be a PDF or a Word document (.docx)` };
  return { ok: true, upload: { name: value.name.slice(0, 200), mimeType, bytes } };
}

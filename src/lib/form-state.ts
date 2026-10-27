export type FormValues = Record<string, string | string[]>;

export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors: Record<string, string[]>; values: FormValues }
  | { status: "success"; reference?: string };

export type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

export const initialFormState: FormState = { status: "idle" };

// Hidden from people; bots that fill every field reveal themselves.
export const HONEYPOT_FIELD = "website_url";

// Added to the form by the Cloudflare Turnstile widget.
export const TURNSTILE_FIELD = "cf-turnstile-response";

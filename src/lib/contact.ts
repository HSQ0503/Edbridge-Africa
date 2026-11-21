// Contact details start as "[… to be confirmed]" placeholders in the CMS until EdBridge supplies them.
export function isConfirmed(value: string | null | undefined): value is string {
  return Boolean(value?.trim()) && !value!.trim().startsWith("[");
}

// tel:, mailto: and WhatsApp links for confirmed details, so a tap on a phone calls or writes straight away.
export function contactHref(kind: "phone" | "whatsapp" | "email", value: string) {
  if (kind === "email") return `mailto:${value.trim()}`;
  const digits = value.replace(/[^\d+]/g, "");
  // Ghanaian numbers are often written 024…; international links need +233.
  const international = digits.startsWith("+") ? digits.slice(1) : digits.startsWith("0") ? `233${digits.slice(1)}` : digits;
  return kind === "whatsapp" ? `https://wa.me/${international}` : `tel:+${international}`;
}

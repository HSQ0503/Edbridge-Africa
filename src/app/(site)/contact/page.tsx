import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { getSiteSettings } from "@/cms/queries";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: "How to contact EdBridge Africa by phone, WhatsApp, email or in person.",
};

export default async function ContactPage() {
  const contact = await getSiteSettings();
  const details = [
    { icon: Phone, label: "Phone", value: contact.phone },
    { icon: MessageCircle, label: "WhatsApp", value: contact.whatsapp },
    { icon: Mail, label: "Email", value: contact.email },
    { icon: MapPin, label: "Office", value: [contact.address, contact.ghanaPostGps].filter(Boolean).join(" · ") },
    { icon: Clock, label: "Office hours", value: contact.hours },
  ].filter((detail) => detail.value);
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Contact us"
        intro="Call, message or write to us — or use the form below. We are happy to help in the way that works best for you."
      />

      <Section id="contact">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <ul className="space-y-4 rounded-2xl border border-line bg-surface p-6">
              {details.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex gap-3">
                  <Icon aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-base text-muted">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-xl font-bold">Visiting our office</h2>
              <p className="mt-2 text-base text-muted">
                [Step-free access, accessible toilet and parking details to be confirmed.] If you need an interpreter,
                including Ghanaian Sign Language, or any other support to meet us, let us know in advance.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Notice tone="urgent" title="Worried about a child?">
              <p>
                Please don&apos;t use this form.{" "}
                <Link href="/report" className="font-semibold underline">
                  Report a concern
                </Link>{" "}
                instead so it reaches our Safeguarding Lead straight away.
              </p>
            </Notice>
            <h2 className="text-2xl font-bold">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Check, Globe, Smartphone } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { DraftNotice, Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Donate and sponsor a child's education",
  description:
    "Give once or monthly by Mobile Money or card, or sponsor a child's education with EdBridge Africa.",
};

const giftUses = [
  "School and examination fees",
  "Uniforms and shoes",
  "Books and stationery",
  "Transport to school",
  "School meals",
  "Tutoring and remedial classes",
  "Assistive devices such as hearing aids or wheelchairs",
  "Braille, large print and other accessible materials",
];

const sponsorshipSteps = [
  {
    title: "Choose a monthly gift",
    text: "Your regular gift is pooled with other sponsors to fund the education costs of children in our programs.",
  },
  {
    title: "Support reaches children",
    text: "Each child's needs are assessed and approved before support is given, and every payment is recorded.",
  },
  {
    title: "Hear about progress",
    text: "You receive regular updates and stories, shared with consent from children and their families.",
  },
];

export default function DonatePage() {
  return (
    <>
      <PageHeader
        eyebrow="Donate"
        title="Donate or sponsor a child's education"
        intro="Your gift pays for the things that decide whether a child goes to school — and stays there."
      />

      <Section id="give-online" title="Give online">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <p className="max-w-2xl text-lg">
              Give once or every month using Mobile Money (MTN MoMo, Telecel Cash, AT Money) or a debit or credit card.
              Payments are processed securely by Paystack — EdBridge Africa never sees your card details.
            </p>
            {site.paystackDonateUrl ? (
              <ButtonLink href={site.paystackDonateUrl} variant="donate">
                <Smartphone aria-hidden="true" className="size-5" />
                Donate securely with Paystack
              </ButtonLink>
            ) : (
              <Notice title="Online giving is being set up">
                <p>
                  Our secure Mobile Money and card payments are coming soon. In the meantime, please{" "}
                  <Link href="/contact" className="font-semibold underline">
                    contact us
                  </Link>{" "}
                  and we will help you give.
                </p>
              </Notice>
            )}
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h3 className="text-xl font-bold">What your gift can pay for</h3>
            <ul className="mt-4 space-y-2 text-base">
              {giftUses.map((use) => (
                <li key={use} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
                  <span>{use}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="sponsor" tone="sand" title="How sponsorship works">
        <ol className="grid gap-6 md:grid-cols-3">
          {sponsorshipSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-surface p-6">
              <p className="font-serif text-sm font-bold text-accent-text">Step {index + 1}</p>
              <h3 className="mt-1 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-base text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 max-w-3xl space-y-4">
          <Notice title="How we keep children safe">
            <p>
              Sponsors never receive a child&apos;s contact details, address or school, and do not contact children
              directly. Any messages go through EdBridge Africa. Read our{" "}
              <Link href="/safeguarding" className="font-semibold underline">
                Child Safeguarding Policy
              </Link>
              .
            </p>
          </Notice>
          <DraftNotice>
            <p>EdBridge Africa to confirm sponsorship levels and what updates sponsors receive.</p>
          </DraftNotice>
        </div>
      </Section>

      <Section id="other-ways" title="Other ways to give">
        <ul className="grid gap-6 md:grid-cols-3">
          <li className="rounded-2xl border border-line bg-surface p-6">
            <Banknote aria-hidden="true" className="size-8 text-brand" />
            <h3 className="mt-4 text-xl font-bold">Bank transfer</h3>
            <p className="mt-2 text-base text-muted">[Bank account details to be confirmed by EdBridge Africa.]</p>
          </li>
          <li className="rounded-2xl border border-line bg-surface p-6">
            <Globe aria-hidden="true" className="size-8 text-brand" />
            <h3 className="mt-4 text-xl font-bold">Giving from abroad</h3>
            <p className="mt-2 text-base text-muted">
              International debit and credit cards are accepted online. For larger gifts or bank transfers from abroad,{" "}
              <Link href="/contact" className="font-semibold text-brand underline">
                contact us
              </Link>
              .
            </p>
          </li>
          <li className="rounded-2xl border border-line bg-surface p-6">
            <Check aria-hidden="true" className="size-8 text-brand" />
            <h3 className="mt-4 text-xl font-bold">Company giving</h3>
            <p className="mt-2 text-base text-muted">
              Sponsor a program, give in kind or match employee gifts.{" "}
              <Link href="/partnerships" className="font-semibold text-brand underline">
                Explore partnerships
              </Link>
              .
            </p>
          </li>
        </ul>
      </Section>

      <Section id="transparency" tone="sand" title="Where your money goes">
        <p className="max-w-2xl">
          Every gift is recorded, every payment is approved by someone other than the person who requested it, and our
          accounts are independently audited. Financial summaries and annual reports will be published on our{" "}
          <Link href="/news#publications" className="font-semibold text-brand underline">
            publications
          </Link>{" "}
          page.
        </p>
      </Section>
    </>
  );
}

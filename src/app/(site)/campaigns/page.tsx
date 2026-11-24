import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Arrow } from "@/components/arrow";
import { ButtonLink } from "@/components/button-link";
import { EmptyState } from "@/components/empty-state";
import { KenteScene } from "@/components/kente-scene/kente-scene";
import { LinkCard } from "@/components/link-card";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Tag } from "@/components/tag";
import { stories, storyHref } from "@/content/stories";

export const metadata: Metadata = {
  title: "Campaigns and initiatives",
  description: "EdBridge Africa's current initiatives and appeals, and how you can take part.",
};

// What the initiative paid for, in EdBridge's words from John's story.
const coverage = [
  "School admission and admission-related costs",
  "School fees",
  "Parent-Teacher Association (PTA) levies",
  "School uniforms",
  "School shoes",
  "Stationery and exercise books",
  "Textbooks and other essential learning materials",
];

// Each in EdBridge's own words from the home, donate, inclusion and partnership pages.
const waysToTakePart = [
  {
    tag: "Ongoing appeal",
    title: "Sponsor a child's education",
    text: "Your gift can cover school fees, uniforms and shoes, books and stationery, transport, meals, tutoring or an assistive device — the things that decide whether a child stays in school.",
    href: "/donate#sponsor",
    cta: "How sponsorship works",
  },
  {
    tag: "Across every program",
    title: "Disability inclusion",
    text: "Children with disabilities are among the most likely to be out of school. We arrange accommodations, assistive technology, accessible materials and Ghanaian Sign Language interpretation so every child can learn and take part.",
    href: "/disability-inclusion",
    cta: "Our approach to inclusion",
  },
  {
    tag: "Partnerships",
    title: "Partner with us",
    text: "Collaborate on sustainable educational and community initiatives.",
    href: "/partnerships",
    cta: "Explore partnerships",
  },
];

export default function CampaignsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="Campaigns and initiatives"
        intro="Where our programs turn into action: the initiative we are running now, and the ways you can be part of it."
      />

      <Section id="current" title="Our current initiative">
        <article
          aria-labelledby="education-access-title"
          className="grid overflow-hidden rounded-2xl border border-line bg-surface lg:grid-cols-[1fr_1.2fr]"
        >
          <div className="flex items-center bg-sand p-6 sm:p-10">
            <KenteScene scene="bridge" className="mx-auto aspect-[2/1] w-full max-w-md lg:aspect-[4/3] lg:max-w-none" />
          </div>
          <div className="p-6 sm:p-10">
            <Tag>Ongoing</Tag>
            <h3 id="education-access-title" className="mt-4 text-3xl sm:text-4xl">
              Education Access and Inclusion Initiative
            </h3>
            <p className="mt-4 text-lg text-muted">
              Across communities in Ghana, many children face similar challenges. Some have never attended school, while
              others are forced to discontinue their education because their families cannot afford school fees,
              uniforms, books, and other essential requirements.
            </p>
            <p className="mt-4 text-lg">
              Through our Education Access and Inclusion Initiative, we are working to address these barriers by helping
              vulnerable children access education and giving them opportunities to continue learning.
            </p>
            <h4 className="mt-8 text-label font-medium text-muted">What our support has covered</h4>
            <ul className="mt-3 grid gap-x-6 gap-y-2 text-base sm:grid-cols-2">
              {coverage.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href="/donate">Support this initiative</ButtonLink>
              <ButtonLink href="/apply" variant="secondary">
                Apply for support
              </ButtonLink>
            </div>
          </div>
        </article>
      </Section>

      <Section
        id="stories"
        tone="sand"
        title="Stories of change"
        intro="How this support has helped children start or return to school."
      >
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
          {stories.map((story, index) => (
            <li key={story.slug}>
              <LinkCard
                href={storyHref(story.slug)}
                label={story.name}
                title={story.title}
                description={story.summary}
                cta="Read the story"
                swatch={index + 1}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="take-part" title="More ways to take part">
        <ul className="grid gap-5 md:grid-cols-3">
          {waysToTakePart.map((way) => (
            <li
              key={way.title}
              className="group relative flex flex-col rounded-2xl border border-line bg-surface p-6 transition-[border-color,translate] duration-150 ease-[var(--ease)] hover:border-ink/40 motion-safe:hover:-translate-y-0.5"
            >
              <Tag>{way.tag}</Tag>
              <h3 className="mt-4 text-xl">
                <Link href={way.href} className="no-underline after:absolute after:inset-0 after:content-['']">
                  {way.title}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-base text-muted">{way.text}</p>
              <span aria-hidden="true" className="mt-5 inline-flex items-center gap-2 text-base font-medium text-brand">
                {way.cta}
                <Arrow />
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="campaigns" tone="sand" title="Campaigns">
        <EmptyState title="New campaigns will be announced here">
          <p>
            When we launch a campaign, you will find its goals, dates and how to take part on this page, with updates
            in{" "}
            <Link href="/news" className="link font-medium">
              News, Events &amp; Publications
            </Link>
            .
          </p>
        </EmptyState>
      </Section>
    </>
  );
}

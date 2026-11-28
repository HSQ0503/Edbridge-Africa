import type { Metadata } from "next";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { CampaignCard } from "@/components/campaign-card";
import { KenteScene } from "@/components/kente-scene/kente-scene";
import { LinkCard } from "@/components/link-card";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Tag } from "@/components/tag";
import { campaigns, campaignsIntro, flagshipInitiative, generalSupport } from "@/content/campaigns";
import { stories, storyHref } from "@/content/stories";

export const metadata: Metadata = {
  title: "Campaigns & Initiatives",
  description: campaignsIntro.tagline,
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

export default function CampaignsPage() {
  return (
    <>
      <PageHeader eyebrow="Our work" title="Campaigns & Initiatives" intro={campaignsIntro.tagline} />

      <Section id="introduction">
        <div className="max-w-[70ch] space-y-4 text-lg">
          {campaignsIntro.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-12">
          <CampaignCard campaign={flagshipInitiative} featured />
        </div>
      </Section>

      <Section id="campaigns" tone="sand" title="Our campaigns">
        <ul className="grid gap-6 md:grid-cols-2">
          {campaigns.map((campaign, index) => (
            <li key={campaign.slug}>
              <CampaignCard campaign={campaign} shift={index} />
            </li>
          ))}
        </ul>
      </Section>

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

      <Section id="be-part-of-the-change" title={generalSupport.heading}>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="max-w-[70ch] space-y-4 text-lg">
            {generalSupport.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div>
            <p className="text-lg font-medium">{generalSupport.welcomeLead}</p>
            <ul className="mt-4 grid gap-x-6 gap-y-2 text-base sm:grid-cols-2">
              {generalSupport.welcome.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-12 font-logo text-2xl font-bold sm:text-3xl">{generalSupport.slogan}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href="/donate">Donate</ButtonLink>
          <ButtonLink href="/partnerships" variant="secondary">
            Partner with us
          </ButtonLink>
          <ButtonLink href="/volunteer" variant="secondary">
            Volunteer
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}

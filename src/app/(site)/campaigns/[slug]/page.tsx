import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accessibility, ArrowLeft, BriefcaseBusiness, Laptop, Rocket, UsersRound, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { CampaignBlocks, CampaignParts } from "@/components/campaign-blocks";
import { PageHeader } from "@/components/page-header";
import { SceneSplit } from "@/components/scene-split";
import { Section } from "@/components/section";
import { Tag } from "@/components/tag";
import {
  type Campaign,
  type CampaignSection,
  type Programme,
  type ProgrammeIcon,
  allCampaigns,
  campaignLabel,
  getCampaign,
  supportLabel,
} from "@/content/campaigns";

export function generateStaticParams() {
  return allCampaigns.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({ params }: PageProps<"/campaigns/[slug]">): Promise<Metadata> {
  const campaign = getCampaign((await params).slug);
  return campaign ? { title: campaign.title, description: campaign.summary } : {};
}

// Suspense lets navigation show the shell instantly; prerendered slugs still ship full HTML.
export default function CampaignPage({ params }: PageProps<"/campaigns/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-72 bg-sand" />}>
      <CampaignContent params={params} />
    </Suspense>
  );
}

async function CampaignContent({ params }: Pick<PageProps<"/campaigns/[slug]">, "params">) {
  const campaign = getCampaign((await params).slug);
  if (!campaign) notFound();

  const [overview, ...sections] = campaign.sections;
  const tones = ["sand", "paper"] as const;

  return (
    <>
      <PageHeader eyebrow={campaignLabel(campaign)} title={campaign.title} intro={campaign.tagline}>
        {campaign.facts && (
          <dl className="mb-8 grid max-w-2xl gap-3 text-base">
            {campaign.facts.map(({ term, text }) => (
              <div key={term}>
                <dt className="inline font-medium">{term}: </dt>
                <dd className="inline text-muted">{text}</dd>
              </div>
            ))}
          </dl>
        )}
        <ButtonLink href={campaign.supportHref}>{supportLabel(campaign)}</ButtonLink>
      </PageHeader>

      <Section id={overview.id}>
        <SceneSplit scene={campaign.scene}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl">{overview.heading}</h2>
          <div className="mt-6">
            <SectionBody section={overview} />
          </div>
        </SceneSplit>
      </Section>

      {sections.map((section, index) => (
        <Section key={section.id} id={section.id} tone={tones[index % 2]} title={section.heading}>
          {section.stage && (
            <div className="-mt-4 mb-6">
              <Tag>{section.stage}</Tag>
            </div>
          )}
          <SectionBody section={section} />
        </Section>
      ))}

      <CallToAction campaign={campaign} tone={tones[sections.length % 2]} />
    </>
  );
}

function SectionBody({ section }: { section: CampaignSection }) {
  return (
    <div className="space-y-10">
      {section.blocks && <CampaignBlocks blocks={section.blocks} />}
      {section.parts && <CampaignParts parts={section.parts} />}
      {section.programmes && <Programmes programmes={section.programmes} />}
    </div>
  );
}

const programmeIcons: Record<ProgrammeIcon, LucideIcon> = {
  laptop: Laptop,
  rocket: Rocket,
  briefcase: BriefcaseBusiness,
  users: UsersRound,
  accessibility: Accessibility,
};

function Programmes({ programmes }: { programmes: Programme[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {programmes.map((programme) => {
        const Icon = programmeIcons[programme.icon];
        const titleId = `${programme.id}-title`;
        return (
          <li key={programme.id} id={programme.id} className="scroll-mt-28">
            <article
              aria-labelledby={titleId}
              className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8"
            >
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                  <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                </span>
                <h3 id={titleId} className="text-xl sm:text-2xl">
                  <span className="text-muted">{programme.letter}.</span>{" "}
                  {programme.title}
                </h3>
              </div>
              <ul className="mt-6 space-y-2 text-base">
                {programme.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {programme.opportunities && programme.opportunities.length > 0 && (
                <div className="mt-6 border-t border-line pt-6">
                  <ul className="space-y-4">
                    {programme.opportunities.map((opportunity) => (
                      <li key={opportunity.title}>
                        <p className="text-label font-medium text-muted">{opportunity.kind}</p>
                        <p className="mt-1 font-medium">
                          {opportunity.href ? (
                            <Link href={opportunity.href} className="link">
                              {opportunity.title}
                            </Link>
                          ) : (
                            opportunity.title
                          )}
                        </p>
                        <p className="mt-1 text-base text-muted">{opportunity.summary}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function CallToAction({ campaign, tone }: { campaign: Campaign; tone: "sand" | "paper" }) {
  const { closing } = campaign;
  const [primary, ...others] = campaign.actions;
  const heading = closing?.heading ?? supportLabel(campaign);
  return (
    <Section id="take-part" tone={tone} title={heading}>
      {closing && (
        <>
          <div className="max-w-[70ch] space-y-4 text-lg">
            {closing.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-8 max-w-3xl font-logo text-2xl font-bold text-brand sm:text-3xl">{closing.slogan}</p>
        </>
      )}
      <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${closing ? "mt-8" : ""}`}>
        <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
        {others.map((action) => (
          <ButtonLink key={action.label} href={action.href} variant="secondary">
            {action.label}
          </ButtonLink>
        ))}
      </div>
      <p className="mt-10">
        <Link href="/campaigns" className="link inline-flex items-center gap-2 font-medium">
          <ArrowLeft aria-hidden="true" className="size-4" /> All campaigns and initiatives
        </Link>
      </p>
    </Section>
  );
}

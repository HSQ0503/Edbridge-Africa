import Link from "next/link";
import { type Campaign, campaignHref, campaignLabel, supportLabel } from "@/content/campaigns";
import { Arrow } from "./arrow";
import { ButtonLink } from "./button-link";
import { KenteScene } from "./kente-scene/kente-scene";
import { Tag } from "./tag";

// Two actions per card, as EdBridge asked, so the title stays an ordinary link rather than covering the card.
export function CampaignCard({
  campaign,
  shift = 0,
  featured = false,
}: {
  campaign: Campaign;
  shift?: number;
  featured?: boolean;
}) {
  const titleId = `${campaign.slug}-title`;
  const href = campaignHref(campaign.slug);
  return (
    <article
      aria-labelledby={titleId}
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface ${featured ? "lg:grid lg:grid-cols-[1fr_1.2fr]" : ""}`}
    >
      <div className={`flex items-center bg-sand ${featured ? "p-6 sm:p-10" : "px-6 py-4"}`}>
        <KenteScene
          scene={campaign.scene}
          shift={shift}
          className={`mx-auto aspect-[2/1] w-full ${featured ? "max-w-md lg:aspect-[4/3] lg:max-w-none" : "max-w-sm"}`}
        />
      </div>
      <div className={`flex flex-1 flex-col ${featured ? "p-6 sm:p-10" : "p-6 sm:p-8"}`}>
        <Tag>{campaignLabel(campaign)}</Tag>
        <h3 id={titleId} className={`mt-4 ${featured ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
          <Link href={href} className="no-underline hover:underline">
            {campaign.title}
          </Link>
        </h3>
        <p className="mt-3 text-lg font-medium text-brand">{campaign.tagline}</p>
        <p className={`mt-3 flex-1 text-muted ${featured ? "text-lg" : "text-base"}`}>{campaign.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href={href}
            aria-label={`Learn more about ${campaign.title}`}
            className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-brand no-underline"
          >
            Learn more
            <Arrow />
          </Link>
          <ButtonLink href={campaign.supportHref} variant="secondary">
            {supportLabel(campaign)}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

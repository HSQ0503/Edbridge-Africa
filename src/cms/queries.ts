import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import type { Job, Media, News, Person } from "./payload-types";
import { cmsTag } from "./revalidate";
import { hasWebConsent } from "./workflow";

// The Local API skips access control, so every query here filters to published content itself.
const published = { _status: { equals: "published" } } as const;

function cms() {
  return getPayload({ config });
}

export type PublicImage = { url: string; alt: string; width: number; height: number };

// Consent can lapse after publishing: such images are dropped rather than shown.
function publicImage(media: number | Media | null | undefined, size: "card" | "thumbnail" = "card"): PublicImage | null {
  if (!media || typeof media === "number" || !hasWebConsent(media)) return null;
  const variant = media.sizes?.[size];
  const url = variant?.url ?? media.url;
  const width = variant?.width ?? media.width;
  const height = variant?.height ?? media.height;
  if (!url || !width || !height) return null;
  return { url, alt: media.decorative ? "" : (media.alt ?? ""), width, height };
}

export type NewsItem = Omit<News, "image"> & { image: PublicImage | null };

function toNewsItem(doc: News): NewsItem {
  return { ...doc, image: publicImage(doc.image) };
}

export async function getNews() {
  "use cache";
  cacheTag(cmsTag("news"));
  cacheLife("hours");
  const { docs } = await (await cms()).find({ collection: "news", where: published, sort: "-date", limit: 100, depth: 1 });
  return docs.map(toNewsItem);
}

export async function getNewsItem(slug: string) {
  "use cache";
  cacheTag(cmsTag("news"));
  cacheLife("hours");
  const { docs } = await (await cms()).find({
    collection: "news",
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  });
  return docs[0] ? toNewsItem(docs[0]) : null;
}

export type Leader = Omit<Person, "photo"> & { photo: PublicImage | null };

export async function getLeaders() {
  "use cache";
  cacheTag(cmsTag("people"));
  cacheLife("hours");
  const { docs } = await (await cms()).find({ collection: "people", where: published, sort: "order", limit: 100, depth: 1 });
  const leaders: Leader[] = docs.map((doc) => ({ ...doc, photo: publicImage(doc.photo, "thumbnail") }));
  return {
    board: leaders.filter((leader) => leader.group === "board"),
    executive: leaders.filter((leader) => leader.group === "executive"),
  };
}

function startOfToday() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today.toISOString();
}

// Hourly caching keeps vacancies from lingering long after their closing date.
export async function getOpenJobs(): Promise<Job[]> {
  "use cache";
  cacheTag(cmsTag("jobs"));
  cacheLife("hours");
  const { docs } = await (await cms()).find({
    collection: "jobs",
    where: { and: [published, { closingDate: { greater_than_equal: startOfToday() } }] },
    sort: "closingDate",
    limit: 50,
    depth: 0,
  });
  return docs;
}

// Closed vacancies stay readable (people follow old links) but say they have closed.
export async function getJob(slug: string): Promise<(Job & { closed: boolean }) | null> {
  "use cache";
  cacheTag(cmsTag("jobs"));
  cacheLife("hours");
  const { docs } = await (await cms()).find({
    collection: "jobs",
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 0,
  });
  return docs[0] ? { ...docs[0], closed: docs[0].closingDate < startOfToday() } : null;
}

export async function getSiteSettings() {
  "use cache";
  cacheTag(cmsTag("settings"));
  cacheLife("max");
  return (await cms()).findGlobal({ slug: "site-settings", depth: 0 });
}

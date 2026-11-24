import type { MetadataRoute } from "next";
import { getNews, getOpenJobs } from "@/cms/queries";
import { programs } from "@/content/programs";
import { site } from "@/content/site";
import { stories, storyHref } from "@/content/stories";

const staticRoutes = [
  "/",
  "/about",
  "/our-story",
  "/mission",
  "/leadership",
  "/programs",
  "/campaigns",
  "/disability-inclusion",
  "/impact",
  "/gallery",
  "/grants",
  "/get-involved",
  "/volunteer",
  "/careers",
  "/donate",
  "/partnerships",
  "/news",
  "/contact",
  "/apply",
  "/report",
  "/safeguarding",
  "/privacy",
  "/accessibility",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, jobs] = await Promise.all([getNews(), getOpenJobs()]);
  const routes = [
    ...staticRoutes,
    ...programs.map((program) => `/programs/${program.slug}`),
    ...stories.map((story) => storyHref(story.slug)),
    ...news.map((item) => `/news/${item.slug}`),
    ...jobs.map((job) => `/careers/${job.slug}`),
  ];
  return routes.map((route) => ({ url: new URL(route, site.url).toString() }));
}

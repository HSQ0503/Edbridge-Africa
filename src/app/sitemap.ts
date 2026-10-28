import type { MetadataRoute } from "next";
import { getNews, getOpenJobs } from "@/cms/queries";
import { programs } from "@/content/programs";
import { site } from "@/content/site";

const staticRoutes = [
  "/",
  "/about",
  "/mission",
  "/leadership",
  "/programs",
  "/disability-inclusion",
  "/impact",
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
    ...programs.filter((program) => !program.href).map((program) => `/programs/${program.slug}`),
    ...news.map((item) => `/news/${item.slug}`),
    ...jobs.map((job) => `/careers/${job.slug}`),
  ];
  return routes.map((route) => ({ url: new URL(route, site.url).toString() }));
}

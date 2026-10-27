import type { MetadataRoute } from "next";
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

export default function sitemap(): MetadataRoute.Sitemap {
  const programRoutes = programs.filter((program) => !program.href).map((program) => `/programs/${program.slug}`);
  return [...staticRoutes, ...programRoutes].map((route) => ({ url: new URL(route, site.url).toString() }));
}

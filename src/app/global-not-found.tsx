import type { Metadata } from "next";
import { Document, rootMetadata } from "@/components/document";
import { NotFoundContent } from "@/components/not-found-content";
import { SiteShell } from "@/components/site-shell";
import { site } from "@/content/site";

export const metadata: Metadata = { ...rootMetadata, title: `Page not found | ${site.name}` };

// Unmatched URLs skip every layout, because the site, portal and CMS each have their own root layout.
export default function GlobalNotFound() {
  return (
    <Document>
      <SiteShell>
        <NotFoundContent />
      </SiteShell>
    </Document>
  );
}

import { Document, rootMetadata, rootViewport } from "@/components/document";
import { SiteShell } from "@/components/site-shell";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <Document>
      <SiteShell>{children}</SiteShell>
    </Document>
  );
}

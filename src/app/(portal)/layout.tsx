import { Document, rootMetadata, rootViewport } from "@/components/document";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return <Document>{children}</Document>;
}

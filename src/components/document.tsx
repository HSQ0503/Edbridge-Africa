import type { Metadata, Viewport } from "next";
import { Merriweather, Noto_Sans } from "next/font/google";
import { site } from "@/content/site";
import "@/app/globals.css";

// Both families cover Twi, Ewe, Ga and Dagbani letters (ɛ ɔ ŋ ʋ ɖ ɣ Ɖ Ʋ) — most popular UI fonts don't.
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_GH",
  },
};

export const rootViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f1" },
    { media: "(prefers-color-scheme: dark)", color: "#121512" },
  ],
};

// The public site and the staff portal are separate root layouts (the CMS admin brings its own), so both share
// this document.
export function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH" className={`${notoSans.variable} ${merriweather.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

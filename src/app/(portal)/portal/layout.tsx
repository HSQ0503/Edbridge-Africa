import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = {
  title: { default: "Staff portal", template: "%s | EdBridge staff portal" },
  robots: { index: false, follow: false },
};

// Every portal page depends on who is signed in, so it renders per request instead of from a static shell.
// Pages that read the session repeat this, because a layout's setting doesn't cover moves between its pages.
export const instant = false;

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-3 font-semibold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <header className="border-b border-line bg-paper">
        <Container className="flex min-h-16 items-center py-3">
          <Link href="/portal" className="inline-flex items-center gap-3 rounded-lg font-serif text-lg font-bold text-ink no-underline">
            <LogoMark className="size-9 shrink-0" />
            EdBridge staff portal
          </Link>
        </Container>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 py-10 focus-visible:shadow-none focus-visible:outline-none sm:py-14">
        <Container>{children}</Container>
      </main>
    </>
  );
}

"use client";

import Link from "next/link";
import { buttonClass } from "@/components/button-link";
import { Container } from "@/components/container";

// Shown when a page fails to render. The error itself is never displayed: it could contain internal details.
export default function SiteError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Container className="py-20 sm:py-28">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent-text">Something went wrong</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Sorry, this page isn&apos;t working right now</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Please try again in a moment. If it keeps happening,{" "}
        <Link href="/contact" className="font-semibold text-brand underline">
          contact us
        </Link>{" "}
        by phone or email.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={buttonClass("primary", "cursor-pointer")}>
          Try again
        </button>
        <Link href="/" className={buttonClass("secondary")}>
          Go to the home page
        </Link>
      </div>
    </Container>
  );
}

"use client";

import "./globals.css";

// Replaces the root layout when it fails, so it can't rely on the site shell or fonts.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en-GH">
      <body className="bg-paper text-ink">
        <title>Something went wrong | EdBridge Africa</title>
        <main className="mx-auto max-w-xl space-y-4 px-4 py-20">
          <h1 className="text-3xl font-bold">Sorry, the EdBridge Africa website isn&apos;t working right now</h1>
          <p>Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            className="min-h-11 cursor-pointer rounded-lg bg-brand px-5 py-2.5 font-semibold text-on-brand"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

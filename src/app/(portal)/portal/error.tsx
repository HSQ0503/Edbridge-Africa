"use client";

import Link from "next/link";
import { buttonClass } from "@/components/button-link";

export default function PortalError({ error, retry }: { error: unknown; retry: () => void }) {
  // The digest matches the server log entry, so IT can find the cause without the page showing any details.
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p>Please try again. If it keeps happening, tell the IT team{digest && " and give them this code"}.</p>
      {digest && <p className="font-mono">{digest}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={buttonClass("primary", "cursor-pointer")}>
          Try again
        </button>
        <Link href="/portal" className={buttonClass("secondary")}>
          Go to your inboxes
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

// Shown both for records that don't exist and for ones the staff member can't open, deliberately worded the same.
export default function PortalNotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-bold">We can&apos;t find that page</h1>
      <p>It may have been moved, or you may not have access to it. If you think you should, ask the IT team.</p>
      <p>
        <Link href="/portal" className="font-semibold text-brand underline">
          Go to your inboxes
        </Link>
      </p>
    </div>
  );
}

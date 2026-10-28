import Link from "next/link";
import { ButtonLink } from "./button-link";
import { Container } from "./container";

export function NotFoundContent() {
  return (
    <Container className="py-20 sm:py-28">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent-text">Page not found</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">We can&apos;t find that page</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        The page may have moved, or the address may be mistyped. Try the home page, or{" "}
        <Link href="/contact" className="font-semibold text-brand underline">
          contact us
        </Link>{" "}
        if you need help.
      </p>
      <div className="mt-8">
        <ButtonLink href="/">Go to the home page</ButtonLink>
      </div>
    </Container>
  );
}

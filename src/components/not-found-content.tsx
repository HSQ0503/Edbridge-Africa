import Link from "next/link";
import { ButtonLink } from "./button-link";
import { Container } from "./container";

export function NotFoundContent() {
  return (
    <Container className="py-20 sm:py-28">
      <p className="text-label font-medium text-muted">Page not found</p>
      <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl">We can&apos;t find that page</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        The page may have moved, or the address may be mistyped. Try the home page, or{" "}
        <Link href="/contact" className="link font-medium">
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

import Link from "next/link";
import { mainNav } from "@/content/site";
import { ButtonLink } from "./button-link";
import { Container } from "./container";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";

export function SiteHeader() {
  return (
    <header className="relative z-40 border-b border-line bg-paper lg:sticky lg:top-0">
      <div className="bg-brand text-on-brand">
        <Container className="flex min-h-10 items-center justify-end py-1 text-sm">
          <p>
            Worried about a child?{" "}
            <Link href="/report" className="font-semibold text-on-brand underline">
              Report a concern
            </Link>
          </p>
        </Container>
      </div>
      <Container className="flex min-h-18 items-center justify-between gap-2 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          <NavMenu items={mainNav} />
          <ButtonLink href="/donate" variant="donate" compact className="order-first lg:order-last lg:ml-2">
            Donate
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}

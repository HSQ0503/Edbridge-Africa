import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/cms/queries";
import { footerNav, site } from "@/content/site";
import { Container } from "./container";
import { LogoMark } from "./logo";
import { WovenBand } from "./woven";

export async function SiteFooter() {
  const contact = await getSiteSettings();
  return (
    <footer className="bg-sand text-ink">
      <WovenBand id="footer-band" />
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-3 font-serif text-xl font-bold">
            <LogoMark />
            {site.name}
          </p>
          <p className="max-w-sm text-base text-muted">{site.description}</p>
          <ul className="space-y-2 text-base">
            <li className="flex gap-2">
              <Mail aria-hidden="true" className="mt-1 size-4 shrink-0" />
              <span>{contact.email}</span>
            </li>
            <li className="flex gap-2">
              <Phone aria-hidden="true" className="mt-1 size-4 shrink-0" />
              <span>{contact.phone}</span>
            </li>
            <li className="flex gap-2">
              <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />
              <span>{contact.address}</span>
            </li>
          </ul>
        </div>

        {footerNav.map((group) => (
          <nav key={group.label} aria-label={`${group.label} links`}>
            <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted">{group.label}</h2>
            <ul className="mt-3 space-y-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-8 items-center text-base text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© {site.name}. Registered nonprofit organisation in Ghana [registration number to be confirmed].</p>
          <p>
            <Link href="/report" className="font-semibold text-ink underline">
              Report a concern
            </Link>
          </p>
        </Container>
      </div>
    </footer>
  );
}

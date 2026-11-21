import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/cms/queries";
import { footerNav, site } from "@/content/site";
import { contactHref, isConfirmed } from "@/lib/contact";
import { Container } from "./container";
import { LogoMark } from "./logo";
import { WovenBand } from "./woven";

export async function SiteFooter() {
  const contact = await getSiteSettings();
  // Placeholders stay on the contact page as a reminder, but aren't repeated on every page.
  const details = [
    { icon: Mail, value: contact.email, href: isConfirmed(contact.email) ? contactHref("email", contact.email) : null },
    { icon: Phone, value: contact.phone, href: isConfirmed(contact.phone) ? contactHref("phone", contact.phone) : null },
    { icon: MapPin, value: contact.address, href: null },
  ].filter((detail): detail is typeof detail & { value: string } => isConfirmed(detail.value));
  return (
    <footer className="bg-sand text-ink">
      <WovenBand id="footer-band" />
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-3 font-logo text-xl font-bold">
            <LogoMark />
            {site.name}
          </p>
          <p className="max-w-sm text-base text-muted">{site.description}</p>
          {details.length > 0 ? (
            <ul className="space-y-2 text-base">
              {details.map(({ icon: Icon, value, href }) => (
                <li key={value} className="flex gap-2">
                  <Icon aria-hidden="true" className="mt-1 size-4 shrink-0" />
                  {href ? (
                    <a href={href} className="link break-all">
                      {value}
                    </a>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base">
              <Link href="/contact" className="link font-medium">
                Contact us
              </Link>
            </p>
          )}
        </div>

        {footerNav.map((group) => (
          <nav key={group.label} aria-label={`${group.label} links`}>
            <h2 className="text-label font-medium text-muted">{group.label}</h2>
            <ul className="mt-3 space-y-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-base text-ink no-underline sm:min-h-8"
                  >
                    <span className="nav-link">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© {site.name}. Registered nonprofit organisation in Ghana.</p>
          <p>
            <Link href="/report" className="link font-medium text-ink">
              Report a concern
            </Link>
          </p>
        </Container>
      </div>
    </footer>
  );
}

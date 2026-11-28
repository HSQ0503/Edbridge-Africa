import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/cms/queries";
import { footerNav, site } from "@/content/site";
import { contactHref, isConfirmed } from "@/lib/contact";
import { BackToTopLink } from "./back-to-top";
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
    <footer className="bg-footer text-on-footer">
      <WovenBand id="footer-band" />
      {/* Link groups sit two to a row on phones, so the footer is half as long to scroll past. */}
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="col-span-2 space-y-4 lg:col-span-1">
          <p className="inline-flex items-center gap-3 font-logo text-xl font-bold">
            {/* The mark's green square would melt into the green band without a hairline edge. */}
            <LogoMark className="size-10" outlined />
            {site.name}
          </p>
          <p className="max-w-sm text-base text-on-footer-muted">{site.description}</p>
          {details.length > 0 ? (
            <ul className="space-y-2 text-base">
              {details.map(({ icon: Icon, value, href }) => (
                <li key={value} className="flex gap-2">
                  <Icon aria-hidden="true" className="mt-1 size-4 shrink-0" />
                  {href ? (
                    <a href={href} className="link break-all text-on-footer">
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
              <Link href="/contact" className="link font-medium text-on-footer">
                Contact us
              </Link>
            </p>
          )}
        </div>

        {footerNav.map((group) => (
          <nav key={group.label} aria-label={`${group.label} links`}>
            <h2 className="text-label font-medium text-on-footer-muted">{group.label}</h2>
            <ul className="mt-3 space-y-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-base text-on-footer no-underline sm:min-h-8"
                  >
                    <span className="nav-link">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-on-footer/20">
        <Container className="flex flex-col gap-4 py-6 text-sm text-on-footer-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {site.name}. Registered nonprofit organisation in Ghana.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/report" className="link font-medium text-on-footer">
              Report a concern
            </Link>
            <BackToTopLink className="inline-flex min-h-11 items-center gap-2 font-medium text-on-footer no-underline sm:min-h-8" />
          </div>
        </Container>
      </div>
    </footer>
  );
}

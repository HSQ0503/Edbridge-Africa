import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description: "How accessible the EdBridge Africa website is, what we are still working on, and how to report a problem.",
};

export default function AccessibilityPage() {
  return (
    <PolicyPage
      title="Accessibility statement"
      intro="We want everyone to be able to use this website, including people with disabilities."
      draftNote="EdBridge Africa to confirm the contact details and response times before launch. The statement will be updated after the pre-launch accessibility audit."
    >
      <h2>Our standard</h2>
      <p>
        We aim for this website to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. Accessibility
        is central to our mission of disability inclusion, so we test as we build rather than at the end.
      </p>

      <h2>What you can do on this website</h2>
      <ul>
        <li>Use every page and form with a keyboard alone</li>
        <li>Use a screen reader such as NVDA, JAWS, VoiceOver or TalkBack</li>
        <li>Zoom in up to 400% without content being cut off</li>
        <li>Make text larger in your browser settings</li>
        <li>Use light or dark mode, following your device setting</li>
        <li>Turn off animation using your device&apos;s reduced-motion setting</li>
        <li>Fill in forms without time limits, with clear error messages</li>
      </ul>

      <h2>What we are still working on</h2>
      <ul>
        <li>Ghanaian Sign Language versions of key pages are not available yet</li>
        <li>Some older PDF documents may not be fully accessible — ask us for an accessible version</li>
        <li>The website is currently available in English only</li>
      </ul>

      <h2>How we test</h2>
      <p>
        We use automated accessibility checks on every page, test manually with keyboards and screen readers on desktop
        and mobile, and test with disabled people before each major release.
      </p>

      <h2>Tell us about a problem</h2>
      <p>
        If something on this website doesn&apos;t work for you, or you need information in a different format such as
        large print, audio or easy read, please <Link href="/contact">contact us</Link>. Tell us the page and what went
        wrong. We aim to respond within [response time to be confirmed].
      </p>

      <h2>About this statement</h2>
      <p>Prepared [date to be confirmed]. We review it at least once a year and after any major change.</p>
    </PolicyPage>
  );
}

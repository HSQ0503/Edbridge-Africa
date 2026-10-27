import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms that apply when you use the EdBridge Africa website.",
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of use" intro="The terms that apply when you use this website.">
      <h2>Using this website</h2>
      <p>
        By using this website you agree to these terms. If you don&apos;t agree, please don&apos;t use the website.
      </p>

      <h2>Content and copyright</h2>
      <p>
        Content on this website belongs to EdBridge Africa unless stated otherwise. You may share our pages and quote
        short passages with credit. You must not reuse photos or stories of children in any way.
      </p>

      <h2>Donations</h2>
      <p>
        Online donations are processed securely by our payment provider, Paystack. If you made a donation in error,{" "}
        <Link href="/contact">contact us</Link> as soon as possible.
      </p>

      <h2>Information you send us</h2>
      <p>
        When you use our forms, you agree that the information you give is accurate and that you have permission to
        share any details about other people. We handle it as described in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Links to other websites</h2>
      <p>We are not responsible for the content of other websites we link to.</p>

      <h2>Accuracy and liability</h2>
      <p>
        We work to keep information on this website accurate and up to date, but we can&apos;t guarantee it is always
        complete. As far as the law allows, we are not liable for loss arising from use of this website.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the Republic of Ghana.</p>

      <h2>Changes</h2>
      <p>We may update these terms. The date at the bottom of this page shows when they last changed.</p>
    </PolicyPage>
  );
}

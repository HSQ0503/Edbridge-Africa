import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How EdBridge Africa collects, uses and protects personal information, in line with Ghana's Data Protection Act, 2012 (Act 843).",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy policy"
      intro="How we collect, use and protect your personal information — and the extra care we take with children's information."
    >
      <h2>Who we are</h2>
      <p>
        EdBridge Africa is the data controller for the personal information described in this policy. We are registered
        with the Data Protection Commission of Ghana [registration number to be confirmed] and follow the Data
        Protection Act, 2012 (Act 843).
      </p>

      <h2>What information we collect</h2>
      <ul>
        <li>
          <strong>Website visitors:</strong> we don&apos;t use advertising or tracking cookies. To stop spam, our forms
          use Cloudflare Turnstile, which checks that a person sent the form using your IP address and information
          about your browser. We also keep a scrambled version of your IP address for up to an hour to limit how many
          forms can be sent, then delete it.
        </li>
        <li>
          <strong>People who contact us or use our forms:</strong> the details you choose to give us, such as your name,
          contact details and message.
        </li>
        <li>
          <strong>Children, young people and families we support:</strong> information needed to assess and provide
          support, collected with consent.
        </li>
        <li>
          <strong>Donors, volunteers, job applicants and partners:</strong> contact details and the information needed
          to manage your relationship with us.
        </li>
      </ul>

      <h2>Children&apos;s information</h2>
      <p>
        We collect only what we need, with the consent of a parent or guardian and, where appropriate, the child&apos;s
        own agreement. Children&apos;s records are restricted to the staff who need them, sensitive details such as
        disability or safeguarding information are protected with additional controls, and we never publish a
        child&apos;s photo or story without consent.
      </p>

      <h2>How we use your information</h2>
      <p>
        We use personal information to provide and improve our programs, respond to enquiries, process donations and
        applications, keep children safe and meet our legal obligations. We rely on your consent, our agreements with
        you, our legal duties, and — where a child may be at risk — the need to protect them.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We never sell personal information. We share it only with service providers who help us run our work, under
        agreements that protect it: Vercel and Supabase (secure hosting), Cloudflare (spam protection on our forms),
        Resend (staff email alerts, which never contain your details) and Paystack (donations). We also share it with
        authorities such as the Department of Social Welfare or the police when the law requires it or a child needs
        protection.
      </p>

      <h2>Storing information outside Ghana</h2>
      <p>
        Our website and database are hosted in London, United Kingdom, and some service providers process data in
        other countries. We choose providers with strong security and put safeguards in place for these transfers.
      </p>

      <h2>How we keep it secure</h2>
      <p>
        We use encryption, individual staff accounts with multi-factor authentication, role-based access, audit logs and
        regular backups. Staff are trained in data protection and safeguarding.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep information only as long as we need it for the purpose it was collected, or as the law requires, and
        then delete or anonymise it according to our retention schedule.
      </p>

      <h2>Your rights</h2>
      <p>Under the Data Protection Act, you can ask to:</p>
      <ul>
        <li>see the personal information we hold about you</li>
        <li>correct information that is wrong</li>
        <li>have information deleted where we no longer need it</li>
        <li>object to how we use it, or withdraw your consent</li>
      </ul>
      <p>
        You can also complain to the Data Protection Commission of Ghana. We&apos;d appreciate the chance to put things
        right first.
      </p>

      <h2>Contact our Data Protection Officer</h2>
      <p>
        [Data Protection Officer contact details to be confirmed], or use our <Link href="/contact">contact page</Link>.
      </p>
    </PolicyPage>
  );
}

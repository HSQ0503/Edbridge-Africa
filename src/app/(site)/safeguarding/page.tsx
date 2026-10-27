import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Child safeguarding policy",
  description: "How EdBridge Africa keeps children and young people safe, and how to report a concern.",
};

export default function SafeguardingPage() {
  return (
    <PolicyPage
      title="Child safeguarding policy"
      intro="Every child has the right to be safe. This is how we protect the children and young people we work with."
    >
      <p>
        <strong>
          Worried about a child? <Link href="/report">Report a concern</Link> — you can do this anonymously.
        </strong>
      </p>

      <h2>Our commitment</h2>
      <p>
        EdBridge Africa has zero tolerance for abuse, exploitation or neglect of children. We put the safety and
        wellbeing of children first in everything we do, and we follow the Children&apos;s Act, 1998 (Act 560) and other
        Ghanaian law.
      </p>

      <h2>Who this policy applies to</h2>
      <p>
        Everyone who works with or for EdBridge Africa: board members, staff, volunteers, interns, mentors, contractors,
        partner organisations and visitors to our programs.
      </p>

      <h2>How we keep children safe</h2>
      <ul>
        <li>Safer recruitment, including references and police checks for anyone working with children</li>
        <li>Safeguarding training for everyone, refreshed every year</li>
        <li>A Code of Conduct that sets clear rules for behaviour with children</li>
        <li>Planning every activity with children&apos;s safety and accessibility in mind</li>
        <li>Consent before taking or using any photo, video or story of a child</li>
        <li>Strict protection of children&apos;s personal information</li>
        <li>Requiring partners to meet our safeguarding standards</li>
      </ul>

      <h2>How to report a concern</h2>
      <p>
        If you are worried about a child, tell us straight away. You can use our{" "}
        <Link href="/report">online reporting form</Link>, call us, or speak to any member of staff. You do not need
        proof and you should not investigate yourself. If a child is in immediate danger, contact the emergency services
        first.
      </p>
      <p>Safeguarding Lead: [name and contact details to be confirmed].</p>

      <h2>How we respond</h2>
      <p>
        Our Safeguarding Lead records every concern, assesses the risk and acts to keep the child safe. Where needed we
        refer to the Department of Social Welfare, the Domestic Violence and Victim Support Unit (DOVVSU) of the Ghana
        Police Service, or health services. Information is shared only with people who need to know.
      </p>

      <h2>Concerns about our staff or volunteers</h2>
      <p>
        Concerns about anyone working for EdBridge Africa are taken seriously and handled independently. Concerns about
        the Executive Director go to the Board Chair, and concerns about the Safeguarding Lead go to the Executive
        Director and the Board.
      </p>

      <h2 id="easy-read">Easy read: keeping you safe</h2>
      <ul>
        <li>You have the right to be safe.</li>
        <li>No one at EdBridge is allowed to hurt you or make you feel unsafe.</li>
        <li>If something worries you, tell an adult you trust.</li>
        <li>You can tell anyone at EdBridge, or use the form on our website.</li>
        <li>You will not be in trouble for telling us.</li>
        <li>We will listen to you and take it seriously.</li>
        <li>We will only tell people who need to know, so they can help keep you safe.</li>
      </ul>
    </PolicyPage>
  );
}

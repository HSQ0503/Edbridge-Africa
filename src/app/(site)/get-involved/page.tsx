import type { Metadata } from "next";
import { Briefcase, Gift, Handshake, HandHeart, Heart, Megaphone } from "lucide-react";
import { LinkCard } from "@/components/link-card";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Get involved",
  description: "Donate, sponsor a child's education, volunteer, partner with us or join our team.",
};

const ways = [
  {
    href: "/donate",
    title: "Donate",
    description: "Give once or monthly by Mobile Money or card to keep children in school.",
    icon: Heart,
    cta: "Donate now",
  },
  {
    href: "/donate#sponsor",
    title: "Sponsor a child's education",
    description: "Cover the costs that decide whether a child stays in school, with regular updates on progress.",
    icon: Gift,
    cta: "How sponsorship works",
  },
  {
    href: "/volunteer",
    title: "Volunteer",
    description: "Tutor, mentor, run digital skills sessions, support outreach or share professional skills.",
    icon: HandHeart,
    cta: "Volunteer with us",
  },
  {
    href: "/partnerships",
    title: "Partner with us",
    description: "Companies, foundations, universities and institutions can fund, give in kind or collaborate.",
    icon: Handshake,
    cta: "Explore partnerships",
  },
  {
    href: "/careers",
    title: "Work with us",
    description: "See current job opportunities and how we recruit safely.",
    icon: Briefcase,
    cta: "See careers",
  },
  {
    href: "/contact",
    title: "Fundraise or spread the word",
    description: "Run a fundraiser, invite us to speak, or share our work with your network.",
    icon: Megaphone,
    cta: "Get in touch",
  },
];

export default function GetInvolvedPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Help a child get into school and stay there"
        intro="Whether you have money, time, skills or a network to share, there is a way to help."
      />
      <Section id="ways" title="Choose how you'd like to help">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ways.map(({ icon: Icon, ...way }) => (
            <li key={way.title}>
              <LinkCard {...way} icon={<Icon aria-hidden="true" className="size-6" />} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

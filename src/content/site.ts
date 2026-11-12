export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = { label: string; links: NavLink[] };
export type NavItem = NavLink | NavGroup;

export const site = {
  name: "EdBridge Africa",
  tagline: "Bridging Barriers, Empowering Futures",
  description:
    "EdBridge Africa is a nonprofit organisation committed to bridging educational inequalities and expanding opportunities for vulnerable and underserved children and young people in Ghana.",
  // Assumed domain until EdBridge confirms (PLAN.md §19).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://edbridgeafrica.org",
  paystackDonateUrl: process.env.NEXT_PUBLIC_PAYSTACK_DONATE_URL,
};

export const mainNav: NavItem[] = [
  {
    label: "About",
    links: [
      { label: "About us", href: "/about", description: "Who we are and who we serve" },
      { label: "Our founder's story", href: "/our-story", description: "The journey that inspired EdBridge" },
      { label: "Mission, vision & values", href: "/mission", description: "What we believe and work towards" },
      { label: "Board & leadership", href: "/leadership", description: "The people who govern and lead us" },
    ],
  },
  {
    label: "Our work",
    links: [
      { label: "Programs & core activities", href: "/programs", description: "How we support children and young people" },
      { label: "Disability inclusion", href: "/disability-inclusion", description: "Making every program accessible" },
      { label: "Projects & impact", href: "/impact", description: "What we do and what changes" },
      { label: "Grants & projects", href: "/grants", description: "For institutional funders" },
    ],
  },
  {
    label: "Get involved",
    links: [
      { label: "Ways to get involved", href: "/get-involved", description: "Give, volunteer, partner or join us" },
      { label: "Volunteer", href: "/volunteer", description: "Share your time and skills" },
      { label: "Careers", href: "/careers", description: "Work with us" },
      { label: "Partnerships", href: "/partnerships", description: "Corporate and institutional partners" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: NavGroup[] = [
  {
    label: "About",
    links: [
      { label: "About us", href: "/about" },
      { label: "Our story", href: "/our-story" },
      { label: "Mission & values", href: "/mission" },
      { label: "Board & leadership", href: "/leadership" },
      { label: "News & events", href: "/news" },
    ],
  },
  {
    label: "Our work",
    links: [
      { label: "Programs", href: "/programs" },
      { label: "Disability inclusion", href: "/disability-inclusion" },
      { label: "Projects & impact", href: "/impact" },
      { label: "Grants & projects", href: "/grants" },
      { label: "Apply for support", href: "/apply" },
    ],
  },
  {
    label: "Get involved",
    links: [
      { label: "Donate", href: "/donate" },
      { label: "Volunteer", href: "/volunteer" },
      { label: "Careers", href: "/careers" },
      { label: "Partnerships", href: "/partnerships" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    label: "Policies",
    links: [
      { label: "Child safeguarding", href: "/safeguarding" },
      { label: "Complaints & reporting", href: "/report" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Accessibility statement", href: "/accessibility" },
      { label: "Terms of use", href: "/terms" },
    ],
  },
];

export function isNavGroup(item: NavItem): item is NavGroup {
  return "links" in item;
}

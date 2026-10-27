export type ProgramIcon =
  | "education"
  | "disability"
  | "literacy"
  | "digital"
  | "youth"
  | "community"
  | "protection";

export type Program = {
  slug: string;
  title: string;
  shortTitle: string;
  icon: ProgramIcon;
  summary: string;
  intro: string;
  activities: string[];
  whoWeSupport: string[];
  // Programs with their own dedicated page link there instead of /programs/[slug].
  href?: string;
};

export const programs: Program[] = [
  {
    slug: "education-access",
    title: "Education Access & Scholarships",
    shortTitle: "Education access",
    icon: "education",
    summary:
      "We find children who are out of school, remove what keeps them out, and help them enrol, return and stay.",
    intro:
      "Many children in Ghana miss school because of fees, the cost of uniforms and books, distance, or family pressures. We work with families and schools to identify these children, understand what they need, and provide practical support so they can learn alongside their peers.",
    activities: [
      "Identifying out-of-school children and young people with communities and schools",
      "Assessing each child's education needs and the barriers they face",
      "Supporting school enrolment and re-entry, including for young mothers",
      "Scholarships and financial aid for school fees and examination costs",
      "Uniforms, shoes, books, stationery and other school supplies",
      "Monitoring attendance and following up when a child is at risk of dropping out",
    ],
    whoWeSupport: [
      "Children and young people who have never enrolled or have dropped out",
      "Learners at risk of leaving school because of cost or family circumstances",
      "Families who need help navigating school enrolment",
    ],
  },
  {
    slug: "disability-inclusion",
    title: "Disability Inclusion & Accessibility",
    shortTitle: "Disability inclusion",
    icon: "disability",
    summary:
      "We make sure children and young people with disabilities can take part fully — in school and in every EdBridge program.",
    intro:
      "Children with disabilities are among the most likely to be out of school. We identify accessibility barriers, arrange reasonable accommodations and support assistive technology so that disability is never the reason a child misses out.",
    activities: [
      "Inclusive education support for schools and teachers",
      "Functional assessments to understand each learner's access needs",
      "Assistive devices and technology",
      "Braille, large print and other accessible learning materials",
      "Ghanaian Sign Language interpretation",
      "Accommodation plans for school and program participation",
    ],
    whoWeSupport: [
      "Children and young people with disabilities and their families",
      "Schools working to become more inclusive",
    ],
    href: "/disability-inclusion",
  },
  {
    slug: "literacy-numeracy",
    title: "Literacy, Numeracy & Academic Support",
    shortTitle: "Literacy & numeracy",
    icon: "literacy",
    summary:
      "Reading, maths and tutoring support so every learner can catch up, keep up and succeed.",
    intro:
      "Getting into school is only the first step. We help learners build strong foundations in reading and numeracy through tutoring, remedial classes and reading programs, and we track progress so support reaches those who need it most.",
    activities: [
      "Literacy and numeracy programs",
      "Tutoring and remedial learning",
      "Reading clubs and community libraries",
      "Learning assessments to measure progress",
      "Support for learners with special educational needs",
    ],
    whoWeSupport: [
      "Learners who are behind in reading or maths",
      "Children returning to school after time away",
    ],
  },
  {
    slug: "digital-stem",
    title: "Digital Skills, ICT & STEM",
    shortTitle: "Digital & STEM",
    icon: "digital",
    summary:
      "Computer skills, coding and hands-on science so young people are ready for a digital future.",
    intro:
      "Digital skills open doors to further learning and work. Our ICT and STEM activities give children and young people practical experience with computers, coding, robotics and science — with accessible technology for learners with disabilities.",
    activities: [
      "Computer and digital literacy training",
      "Coding and robotics clubs",
      "STEM activities and science learning",
      "Educational technology for schools",
      "Digital accessibility and assistive technology training",
    ],
    whoWeSupport: [
      "Students and young people with little access to computers",
      "Schools building digital learning capacity",
    ],
  },
  {
    slug: "youth-careers",
    title: "Youth Development, Careers & Entrepreneurship",
    shortTitle: "Youth & careers",
    icon: "youth",
    summary:
      "Career guidance, vocational training, mentoring and enterprise support for young people.",
    intro:
      "We help young people move from education into work and self-employment through career guidance, vocational training, apprenticeships, mentorship and leadership development.",
    activities: [
      "Career guidance and counselling",
      "Vocational training and apprenticeships",
      "Entrepreneurship training and support",
      "Employability skills and internships",
      "Youth mentorship and leadership programs",
    ],
    whoWeSupport: [
      "Young people preparing to leave school",
      "Young people seeking skills, work or to start a business",
    ],
  },
  {
    slug: "community-families",
    title: "Community, Family & School Partnerships",
    shortTitle: "Families & communities",
    icon: "community",
    summary:
      "Working with families, schools and community leaders so every child has people backing their education.",
    intro:
      "Lasting change happens when families, schools and communities work together. We engage parents and caregivers, build partnerships with schools and mobilise communities to identify and support vulnerable children.",
    activities: [
      "Community outreach to identify vulnerable children",
      "Parent and caregiver engagement",
      "School partnerships",
      "Family support and referrals to other services",
      "Community mobilisation and volunteer programs",
    ],
    whoWeSupport: [
      "Families and caregivers",
      "Schools, community leaders and local organisations",
    ],
  },
  {
    slug: "child-protection",
    title: "Child Protection & Wellbeing",
    shortTitle: "Child protection",
    icon: "protection",
    summary:
      "Keeping children safe, supported and heard — in our programs and in their communities.",
    intro:
      "Every child has the right to be safe. We maintain strong safeguarding procedures, respond to concerns, provide psychosocial support and work with the Department of Social Welfare and other agencies when children need protection.",
    activities: [
      "Safeguarding procedures across all programs",
      "Receiving and responding to concerns about children",
      "Psychosocial support and counselling",
      "Case management and referrals to specialist services",
      "Safeguarding training for staff and volunteers",
    ],
    whoWeSupport: [
      "Children and young people in our programs",
      "Families needing support to keep children safe",
    ],
  },
];

export function getProgram(slug: string) {
  return programs.find((program) => program.slug === slug);
}

export function programHref(program: Program) {
  return program.href ?? `/programs/${program.slug}`;
}

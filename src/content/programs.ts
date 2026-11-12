export type Program = {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  activities: string[];
  whoWeSupport: string[];
};

// EdBridge's eight programs and areas of focus, in the order the organisation numbers them. Disability inclusion,
// accessibility and child protection run through all eight rather than standing as programs of their own.
export const programs: Program[] = [
  {
    slug: "education-access",
    title: "Education Access and Inclusion",
    summary:
      "Supporting school enrolment, educational sponsorship, scholarships, school retention and inclusive educational opportunities for vulnerable children.",
    intro:
      "Many children in Ghana miss school because of fees, the cost of uniforms and books, distance, disability or family pressures. We work with families and schools to identify these children, understand what they need, and provide practical support so they can enrol, return and stay in school.",
    activities: [
      "Identifying out-of-school children and young people with communities and schools",
      "Assessing each child's education needs and the barriers they face",
      "Supporting school enrolment and re-entry, including for young mothers",
      "Educational sponsorship, scholarships and help with school fees and examination costs",
      "Uniforms, shoes, books, stationery and other school supplies",
      "Inclusive educational opportunities for children with disabilities",
      "Monitoring attendance and following up when a child is at risk of dropping out",
    ],
    whoWeSupport: [
      "Children who are out of school or at risk of dropping out",
      "Children from economically disadvantaged households",
      "Children and young people with disabilities",
    ],
  },
  {
    slug: "literacy-numeracy",
    title: "Literacy, Numeracy and Academic Development",
    summary:
      "Strengthening foundational learning, reading, mathematics, critical thinking, academic performance and educational support.",
    intro:
      "Getting into school is only the first step. We help learners build strong foundations in reading, mathematics and critical thinking through tutoring, remedial classes and reading programs, and we track progress so support reaches those who need it most.",
    activities: [
      "Foundational literacy and numeracy programs",
      "Tutoring and remedial learning",
      "Reading clubs and community libraries",
      "Critical thinking and study skills",
      "Learning assessments to measure progress",
      "Support for learners with special educational needs",
    ],
    whoWeSupport: [
      "Learners who are behind in reading or mathematics",
      "Children returning to school after time away",
      "Children with limited access to educational resources",
    ],
  },
  {
    slug: "digital-stem",
    title: "Digital, ICT, STEM and Innovation Education",
    summary:
      "Expanding access to computers, digital literacy, coding, science, technology, engineering, mathematics and innovation.",
    intro:
      "Children and young people are growing up in an increasingly technology-driven world. Our ICT and STEM activities give them practical experience with computers, coding, science and innovation — with accessible technology for learners with disabilities.",
    activities: [
      "Access to computers and digital literacy training",
      "Coding and robotics clubs",
      "Science, technology, engineering and mathematics activities",
      "Innovation challenges and problem-solving projects",
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
    title: "Career, Vocational and Entrepreneurship Development",
    summary:
      "Equipping young people with practical skills, career guidance, entrepreneurship, financial literacy and pathways to employment.",
    intro:
      "We help young people move from education into work and self-employment through career guidance, vocational and technical training, entrepreneurship support and the practical skills employers look for.",
    activities: [
      "Career guidance and counselling",
      "Vocational and technical training and apprenticeships",
      "Entrepreneurship training and support",
      "Financial literacy",
      "Employability skills, internships and pathways to employment",
    ],
    whoWeSupport: [
      "Young people preparing to leave school",
      "Young people facing unemployment or limited skills-development opportunities",
    ],
  },
  {
    slug: "community-families",
    title: "Teacher, Parent, Youth and Community Development",
    summary:
      "Supporting teacher development, parent engagement, youth leadership, mentorship and community capacity building.",
    intro:
      "Children learn best when the people around them are supported too. We strengthen teachers, parents, young leaders and communities so that every child has people backing their education.",
    activities: [
      "Teacher training and professional development",
      "Parent and caregiver engagement",
      "Youth leadership and mentorship programs",
      "Community capacity building and volunteer programs",
      "Family support and referrals to other services",
    ],
    whoWeSupport: [
      "Teachers and schools",
      "Families and caregivers",
      "Young people and community leaders",
    ],
  },
  {
    slug: "infrastructure-welfare",
    title: "Educational Infrastructure, Resources and Child Welfare",
    summary:
      "Improving learning environments, providing educational materials, supporting child welfare and promoting safe, accessible schools.",
    intro:
      "A child needs a safe place to learn and the materials to learn with. We work to improve learning environments, provide essential resources and keep children safe and well — in our programs and in their communities.",
    activities: [
      "Improving classrooms and other learning environments",
      "Educational materials and learning resources",
      "Promoting safe and accessible schools",
      "Child welfare support, including psychosocial support and referrals",
      "Safeguarding procedures and training across all our programs",
    ],
    whoWeSupport: [
      "Schools and communities with limited learning facilities",
      "Children and young people in our programs",
      "Families needing support to keep children safe and well",
    ],
  },
  {
    slug: "agriculture-climate",
    title: "Agricultural, Environmental and Climate Education",
    summary:
      "Promoting agricultural knowledge, sustainable food production, environmental conservation, climate awareness and green skills.",
    intro:
      "We encourage practical knowledge, innovation and sustainable approaches to agriculture and environmental stewardship, so young people can build livelihoods and protect the places they live.",
    activities: [
      "Agricultural knowledge and practical farming skills",
      "Sustainable food production",
      "Environmental conservation activities",
      "Climate awareness education",
      "Green skills for young people",
    ],
    whoWeSupport: [
      "Children and young people in rural communities",
      "Schools and communities working on sustainable food and the environment",
    ],
  },
  {
    slug: "research-partnerships",
    title: "Educational Research, Partnerships and Community Outreach",
    summary:
      "Identifying educational needs, conducting research, building institutional partnerships and mobilising resources for sustainable impact.",
    intro:
      "We build evidence-based interventions and partnerships that advance educational equity. Research tells us where support is needed most; partnerships and outreach make sure it arrives.",
    activities: [
      "Identifying educational needs in communities",
      "Educational research and program evaluation",
      "Partnerships with local and international institutions",
      "Community outreach to identify vulnerable children",
      "Mobilising resources for sustainable impact",
    ],
    whoWeSupport: [
      "Communities and schools with unmet educational needs",
      "Institutions and partners working on educational equity",
    ],
  },
];

export function getProgram(slug: string) {
  return programs.find((program) => program.slug === slug);
}

export function programHref(program: Program) {
  return `/programs/${program.slug}`;
}

export function programNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

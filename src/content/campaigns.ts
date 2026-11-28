import type { SceneName } from "@/components/kente-scene/scenes";

// Campaigns and initiatives, word for word from EdBridge's documents: "Campaigns & Initiatives" and "Equip EdBridge
// Africa" (sent 27 November 2026) and the Young People's Empowerment and Leadership Initiative (emailed the same week).
// The documents' instructions to the web developer are followed here, not published.

export type Block =
  | { type: "text"; paragraphs: string[] }
  | { type: "list"; items: string[]; numbered?: boolean }
  | { type: "table"; caption: string; columns: string[]; rows: string[][] }
  | { type: "terms"; items: { term: string; text: string }[] }
  | { type: "callout"; term: string; text: string }
  | { type: "subheading"; text: string };

export type Part = { heading: string; blocks: Block[] };

// Icons are named here and drawn by the page, so this file stays plain data that a CMS could hold later.
export type ProgrammeIcon = "laptop" | "rocket" | "briefcase" | "users" | "accessibility";

// Projects, training programmes and partnership opportunities can be added under a programme as they launch.
export type ProgrammeOpportunity = {
  kind: "Project" | "Training programme" | "Partnership opportunity";
  title: string;
  summary: string;
  href?: string;
};

export type Programme = {
  id: string;
  letter: string;
  title: string;
  icon: ProgrammeIcon;
  items: string[];
  opportunities?: ProgrammeOpportunity[];
};

export type CampaignSection = {
  id: string;
  heading: string;
  // Marks how soon a section is meant to happen, so long-term plans never read as urgent appeals.
  stage?: string;
  blocks?: Block[];
  parts?: Part[];
  programmes?: Programme[];
};

export type CampaignAction = { label: string; href: string };

export type Campaign = {
  slug: string;
  kind: "campaign" | "flagship";
  title: string;
  tagline: string;
  summary: string;
  facts?: { term: string; text: string }[];
  scene: SceneName;
  sections: CampaignSection[];
  closing?: { heading?: string; paragraphs: string[]; slogan: string };
  actions: CampaignAction[];
  supportHref: string;
};

export const campaignsIntro = {
  tagline:
    "Bridging the Education Gap for Vulnerable Children, Young People, and Individuals with Disabilities in Ghana.",
  paragraphs: [
    "EdBridge Africa is committed to expanding access to education, promoting disability inclusion, empowering young people, and strengthening communities across Ghana.",
    "Through our campaigns and initiatives, we seek to address educational inequalities, remove barriers to opportunity, promote digital inclusion, and support individuals and communities facing social and economic challenges.",
    "Our work recognizes that education and opportunity should be accessible to everyone, regardless of age, disability, or socioeconomic circumstances.",
    "We invite individuals, corporate institutions, foundations, universities, technology companies, nonprofit organizations, and international development partners to join us in creating meaningful and sustainable change.",
  ],
};

export const generalSupport = {
  heading: "Be Part of the Change",
  paragraphs: [
    "At EdBridge Africa, we believe that meaningful change requires collective effort.",
    "Whether you are an individual, corporate organization, technology company, educational institution, foundation, nonprofit organization, or international development partner, there is an opportunity for you to contribute to our mission.",
    "Your support can help remove educational barriers, promote disability inclusion, expand access to digital learning, and strengthen the systems needed to deliver sustainable community development programs.",
  ],
  welcomeLead: "We welcome:",
  welcome: [
    "Financial contributions.",
    "In-kind donations.",
    "Corporate sponsorships.",
    "Institutional partnerships.",
    "Technical assistance.",
    "Volunteer support.",
    "Equipment donations.",
    "Program implementation partnerships.",
  ],
  slogan: "Together, We Can Bridge the Gap.",
};

const youthInitiative: Campaign = {
  slug: "young-peoples-empowerment-and-leadership",
  kind: "flagship",
  title: "Young People’s Empowerment and Leadership Initiative",
  tagline:
    "Equipping Young People with the Knowledge, Skills, Opportunities, and Confidence to Shape Their Future.",
  summary:
    "The Young People’s Empowerment and Leadership Initiative is a flagship youth development initiative of EdBridge Africa, designed to empower young people across Africa with the education, practical skills, leadership capabilities, resources, and opportunities they need to build productive, independent, and meaningful lives.",
  scene: "converge",
  sections: [
    {
      id: "about",
      heading: "About the Initiative",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "The Young People’s Empowerment and Leadership Initiative is a flagship youth development initiative of EdBridge Africa, designed to empower young people across Africa with the education, practical skills, leadership capabilities, resources, and opportunities they need to build productive, independent, and meaningful lives.",
            "Across Africa, millions of young people face barriers to quality education, employment, entrepreneurship, digital access, professional development, and meaningful participation in decision-making. Young people from economically disadvantaged communities, out-of-school youth, and young people with disabilities often experience additional barriers that limit their opportunities and potential.",
            "EdBridge Africa recognizes that young people are not simply beneficiaries of development; they are essential partners, innovators, leaders, and contributors to Africa’s future.",
            "Through this initiative, we seek to bridge opportunity gaps by providing young people with access to relevant learning experiences, employability training, entrepreneurship support, mentorship, leadership development, and inclusive opportunities for personal and professional growth.",
            "Our ambition is to help young people move beyond surviving to becoming capable, confident, economically empowered, and socially responsible individuals.",
          ],
        },
      ],
    },
    {
      id: "goal",
      heading: "Our Goal",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "To empower young people across Africa, particularly those experiencing social, educational, and economic disadvantages, with the knowledge, skills, opportunities, and support necessary to achieve their potential and contribute to sustainable community and national development.",
          ],
        },
      ],
    },
    {
      id: "programmes",
      heading: "Key Programme Areas",
      programmes: [
        {
          id: "youth-digital-futures",
          letter: "A",
          title: "Youth Digital Futures",
          icon: "laptop",
          items: [
            "Digital literacy and computer skills training.",
            "Coding, programming, and software development.",
            "Artificial intelligence and emerging technologies.",
            "Data science, cybersecurity, and digital innovation.",
            "Access to computers, internet resources, and digital learning tools.",
            "Responsible technology use and digital entrepreneurship.",
          ],
        },
        {
          id: "youth-enterprise-accelerator",
          letter: "B",
          title: "Youth Enterprise Accelerator",
          icon: "rocket",
          items: [
            "Entrepreneurship and business management training.",
            "Business planning and financial literacy.",
            "Mentorship from experienced entrepreneurs and professionals.",
            "Support for youth-led businesses and innovative ideas.",
            "Social entrepreneurship and community-based enterprises.",
            "Connections to business development opportunities and potential funding partners.",
          ],
        },
        {
          id: "youth-career-pathways",
          letter: "C",
          title: "Youth Career Pathways",
          icon: "briefcase",
          items: [
            "Career guidance and professional development.",
            "CV writing and interview preparation.",
            "Workplace readiness and employability training.",
            "Technical and vocational skills development.",
            "Internship, apprenticeship, and work-experience opportunities.",
            "Connections with employers, industry professionals, and professional networks.",
          ],
        },
        {
          id: "young-leaders-network",
          letter: "D",
          title: "Young Leaders Network",
          icon: "users",
          items: [
            "Leadership and governance development.",
            "Communication and decision-making skills.",
            "Mentorship and professional networking.",
            "Youth participation in community development.",
            "Civic engagement and responsible citizenship.",
            "Youth-led initiatives, innovation, and social impact projects.",
          ],
        },
        {
          id: "inclusive-youth-opportunities",
          letter: "E",
          title: "Inclusive Youth Opportunities",
          icon: "accessibility",
          items: [
            "Equal access to youth development programmes for young people with disabilities.",
            "Accessible training materials and learning environments.",
            "Assistive technology and reasonable accommodation where needed.",
            "Disability-inclusive digital skills and vocational training.",
            "Mentorship, leadership, and entrepreneurship opportunities for young people with disabilities.",
            "Promotion of inclusive employment and economic participation.",
            "Meaningful involvement of young people with disabilities in programme design and implementation.",
          ],
        },
      ],
    },
    {
      id: "target-beneficiaries",
      heading: "Target Beneficiaries",
      blocks: [
        { type: "text", paragraphs: ["The initiative will prioritize:"] },
        {
          type: "list",
          items: [
            "Young people from economically disadvantaged households.",
            "Out-of-school young people seeking opportunities to continue their education.",
            "Unemployed and underemployed young people.",
            "Young people with disabilities.",
            "Young women and girls facing educational and economic barriers.",
            "Young people from underserved rural and urban communities.",
            "Aspiring young entrepreneurs and innovators.",
            "Young people seeking career guidance, mentorship, and professional development.",
          ],
        },
      ],
    },
    {
      id: "implementation-approach",
      heading: "Implementation Approach",
      blocks: [
        { type: "text", paragraphs: ["EdBridge Africa will implement the initiative through:"] },
        {
          type: "list",
          numbered: true,
          items: [
            "Practical training programmes, workshops, and boot camps.",
            "Mentorship opportunities involving professionals, entrepreneurs, and community leaders.",
            "Educational assistance and access to learning resources.",
            "Partnerships with businesses and institutions to facilitate internships and employment pathways.",
            "Entrepreneurship development and support for promising youth-led initiatives.",
            "Digital learning and technology access programmes.",
            "Youth leadership networks and community engagement activities.",
            "Partnerships with educational institutions, private-sector organizations, disability-led organizations, and development partners.",
          ],
        },
      ],
    },
    {
      id: "expected-outcomes",
      heading: "Expected Outcomes",
      blocks: [
        { type: "text", paragraphs: ["The initiative seeks to:"] },
        {
          type: "list",
          items: [
            "Increase access to education and lifelong learning.",
            "Improve digital literacy and technology competencies.",
            "Strengthen employability and career readiness.",
            "Support youth entrepreneurship and economic independence.",
            "Develop confident, responsible, and capable young leaders.",
            "Expand opportunities for young people with disabilities.",
            "Encourage meaningful youth participation in community development.",
            "Establish sustainable mentorship, collaboration, and professional networks.",
          ],
        },
      ],
    },
    {
      id: "inclusion-and-accessibility",
      heading: "Inclusion and Accessibility Commitment",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "EdBridge Africa believes that every young person deserves an opportunity to learn, develop, participate, and succeed, regardless of disability, economic circumstances, gender, geographical location, or social background.",
            "Accessibility, reasonable accommodation, equal participation, and disability-inclusive leadership must be integrated into the planning, delivery, and evaluation of this initiative.",
          ],
        },
      ],
    },
    {
      id: "partnership-and-support",
      heading: "Partnership and Support Opportunities",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "We invite individuals, educational institutions, businesses, employers, development partners, foundations, and other stakeholders to collaborate with EdBridge Africa through:",
          ],
        },
        {
          type: "list",
          items: [
            "Funding youth development programmes.",
            "Sponsoring training and educational opportunities.",
            "Donating computers and digital learning resources.",
            "Providing internships and employment opportunities.",
            "Volunteering as mentors, trainers, and facilitators.",
            "Supporting youth-led businesses and innovations.",
            "Establishing institutional and corporate partnerships.",
          ],
        },
      ],
    },
  ],
  closing: {
    paragraphs: [
      "Together, we can equip young people with the opportunities they need to transform their lives, strengthen their communities, and shape Africa’s future.",
    ],
    slogan: "Invest in Young People. Empower Potential. Transform the Future.",
  },
  actions: [
    { label: "Support This Initiative", href: "/donate" },
    { label: "Become a Youth Development Partner", href: "/partnerships" },
    { label: "Volunteer as a Mentor", href: "/volunteer" },
    { label: "Explore Programme Opportunities", href: "#programmes" },
  ],
  supportHref: "/donate",
};

const backToSchool: Campaign = {
  slug: "back-to-school",
  kind: "campaign",
  title: "Back-to-School Campaign",
  tagline: "Every Child Deserves a Chance to Learn",
  summary:
    "Through this campaign, EdBridge Africa seeks to support children from economically disadvantaged households by providing essential educational materials that enable them to enrol in school, return to school, and participate meaningfully in learning.",
  scene: "stairs",
  sections: [
    {
      id: "overview",
      heading: "Campaign Overview",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "Access to education remains a challenge for many vulnerable children and young people in Ghana. For some families, the cost of school uniforms, footwear, books, stationery, school bags, and other essential learning materials creates significant barriers to education.",
            "Through this campaign, EdBridge Africa seeks to support children from economically disadvantaged households by providing essential educational materials that enable them to enrol in school, return to school, and participate meaningfully in learning.",
          ],
        },
      ],
    },
    {
      id: "objectives",
      heading: "Campaign Objectives",
      blocks: [
        {
          type: "list",
          items: [
            "Support vulnerable children who cannot attend school because of financial difficulties.",
            "Provide essential school supplies to children from disadvantaged households.",
            "Reduce school absenteeism and the risk of school dropout.",
            "Encourage school enrolment, retention, and continued participation in education.",
            "Promote equal educational opportunities regardless of socioeconomic background.",
          ],
        },
      ],
    },
    {
      id: "target-beneficiaries",
      heading: "Target Beneficiaries",
      blocks: [
        {
          type: "list",
          items: [
            "Children from low-income households.",
            "Out-of-school children seeking to return to education.",
            "Children at risk of dropping out.",
            "Children from single-parent and economically disadvantaged households.",
            "Children with disabilities who require additional educational support.",
          ],
        },
      ],
    },
    {
      id: "planned-activities",
      heading: "Planned Activities",
      blocks: [
        {
          type: "list",
          items: [
            "Distribution of school uniforms and footwear.",
            "Provision of school bags, books, and stationery.",
            "Support for children returning to school.",
            "Mobilization of school supplies through corporate partnerships.",
            "Identification and assessment of children requiring educational assistance.",
          ],
        },
      ],
    },
    {
      id: "how-you-can-support",
      heading: "How You Can Support",
      blocks: [
        {
          type: "list",
          items: [
            "Sponsor a child's back-to-school needs.",
            "Donate uniforms and footwear.",
            "Donate books and stationery.",
            "Provide financial contributions.",
            "Organize school-supply donation drives.",
            "Partner with EdBridge Africa to reach underserved communities.",
          ],
        },
      ],
    },
    {
      id: "expected-outcomes",
      heading: "Expected Outcomes",
      blocks: [
        {
          type: "list",
          items: [
            "Increased access to essential educational materials.",
            "Improved school enrolment and retention opportunities.",
            "Reduced financial barriers to school attendance.",
            "Improved participation in classroom activities.",
            "Greater educational opportunities for vulnerable children.",
          ],
        },
      ],
    },
  ],
  actions: [
    { label: "Donate School Supplies", href: "/contact" },
    { label: "Sponsor a Child", href: "/donate#sponsor" },
    { label: "Partner With Us", href: "/partnerships" },
  ],
  supportHref: "/donate",
};

const everyAbility: Campaign = {
  slug: "every-ability-deserves-an-opportunity",
  kind: "campaign",
  title: "Every Ability Deserves an Opportunity",
  tagline: "Promoting Disability Inclusion, Dignity and Equal Opportunities",
  summary:
    "EdBridge Africa believes that disability should never be a reason for exclusion, discrimination, or the denial of opportunities.",
  scene: "ring",
  sections: [
    {
      id: "overview",
      heading: "Campaign Overview",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "Every child, young person, and individual with a disability deserves the opportunity to learn, participate, develop their abilities, and pursue their aspirations.",
            "However, individuals with disabilities may encounter significant barriers to education, mobility, healthcare-related support, and community participation. These barriers can include limited access to mobility aids, assistive devices, accessible learning materials, inclusive educational environments, and appropriate support services.",
            "EdBridge Africa believes that disability should never be a reason for exclusion, discrimination, or the denial of opportunities.",
            "Through this campaign, we aim to mobilize resources, partnerships, and community support to improve accessibility, independence, dignity, educational participation, and social inclusion for children, young people, and individuals with disabilities in Ghana.",
          ],
        },
      ],
    },
    {
      id: "objectives",
      heading: "Campaign Objectives",
      blocks: [
        {
          type: "list",
          items: [
            "Improve access to mobility aids and assistive devices.",
            "Support inclusive education and accessible learning environments.",
            "Reduce barriers preventing individuals with disabilities from participating in education and community activities.",
            "Promote disability awareness, acceptance, and inclusion.",
            "Encourage partnerships with disability-focused organizations, healthcare providers, rehabilitation professionals, and educational institutions.",
            "Promote dignity, independence, and equal opportunities for individuals with disabilities.",
          ],
        },
      ],
    },
    {
      id: "target-beneficiaries",
      heading: "Target Beneficiaries",
      blocks: [
        {
          type: "list",
          items: [
            "Children and young people with physical disabilities.",
            "Individuals with mobility difficulties.",
            "Individuals with visual impairments.",
            "Individuals with hearing impairments.",
            "Individuals with communication and other support needs.",
            "Individuals with disabilities from economically disadvantaged households.",
          ],
        },
      ],
    },
    {
      id: "planned-activities",
      heading: "Planned Activities",
      parts: [
        {
          heading: "A. Mobility and Assistive Equipment",
          blocks: [
            {
              type: "list",
              items: [
                "Manual and appropriate specialized wheelchairs.",
                "Walking frames and mobility aids.",
                "Crutches and other mobility support equipment.",
                "Assistive positioning and seating equipment.",
              ],
            },
          ],
        },
        {
          heading: "B. Vision and Hearing Support",
          blocks: [
            {
              type: "list",
              items: [
                "Prescription eyeglasses following appropriate eye examinations.",
                "Hearing aids and related assistive equipment.",
                "Accessible educational materials.",
              ],
            },
          ],
        },
        {
          heading: "C. Inclusive Education",
          blocks: [
            {
              type: "list",
              items: [
                "Accessible learning materials.",
                "Disability-friendly educational resources.",
                "Support for inclusive classroom environments.",
                "Educational assistance for children and young people with disabilities.",
              ],
            },
          ],
        },
        {
          heading: "D. Community Awareness and Inclusion",
          blocks: [
            {
              type: "list",
              items: [
                "Disability awareness activities.",
                "Community education on disability inclusion.",
                "Collaboration with schools and disability organizations.",
                "Advocacy for equal educational and social opportunities.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "suitability-and-safeguards",
      heading: "Beneficiary Suitability and Safeguards",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "All assistive equipment and support will be considered according to individual assessments, suitability, professional recommendations where necessary, and the specific needs of beneficiaries.",
          ],
        },
      ],
    },
    {
      id: "how-you-can-support",
      heading: "How You Can Support",
      blocks: [
        {
          type: "list",
          items: [
            "Sponsor assistive devices.",
            "Donate wheelchairs and mobility equipment.",
            "Support eye examinations and prescription glasses.",
            "Provide technical and professional assistance.",
            "Sponsor disability inclusion initiatives.",
            "Establish partnerships with EdBridge Africa.",
          ],
        },
      ],
    },
    {
      id: "expected-outcomes",
      heading: "Expected Outcomes",
      blocks: [
        {
          type: "list",
          items: [
            "Improved mobility and independence.",
            "Increased educational and community participation.",
            "Improved access to appropriate assistive devices.",
            "Greater disability awareness and acceptance.",
            "More inclusive learning and community environments.",
            "Improved opportunities and quality of life for beneficiaries.",
          ],
        },
      ],
    },
  ],
  actions: [
    { label: "Donate a Wheelchair", href: "/contact" },
    { label: "Support an Individual With a Disability", href: "/donate" },
    { label: "Donate Assistive Equipment", href: "/contact" },
    { label: "Partner With Us", href: "/partnerships" },
  ],
  supportHref: "/donate",
};

const oneChildOneDigitalOpportunity: Campaign = {
  slug: "one-child-one-digital-opportunity",
  kind: "campaign",
  title: "One Child, One Digital Opportunity",
  tagline: "Bridging the Digital Divide, Empowering the Next Generation",
  summary:
    "Through this campaign, we aim to expand access to digital education by mobilizing computers, accessible technology, training opportunities, and partnerships for underserved children and young people.",
  scene: "helix",
  sections: [
    {
      id: "overview",
      heading: "Campaign Overview",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "Technology has become an essential part of modern education, employment, communication, innovation, and economic development.",
            "However, many children and young people in underserved communities across Ghana have limited access to computers, internet connectivity, digital learning resources, and practical technology training.",
            "This digital divide creates unequal opportunities for children and young people to acquire the skills needed to participate in an increasingly technology-driven world.",
            "EdBridge Africa believes that every child and young person deserves an opportunity to explore technology, develop digital skills, and become an active participant in the digital economy.",
            "We also recognize the importance of accessible technology in empowering individuals with disabilities.",
            "Through this campaign, we aim to expand access to digital education by mobilizing computers, accessible technology, training opportunities, and partnerships for underserved children and young people.",
          ],
        },
      ],
    },
    {
      id: "objectives",
      heading: "Campaign Objectives",
      blocks: [
        {
          type: "list",
          items: [
            "Improve access to computers and digital learning resources.",
            "Introduce children and young people to basic computer literacy.",
            "Promote digital skills development in underserved communities.",
            "Encourage participation in STEM education.",
            "Introduce young people to coding, programming, artificial intelligence, and emerging technologies.",
            "Promote responsible and safe use of digital technology.",
            "Encourage accessible digital learning for individuals with disabilities.",
            "Establish partnerships with technology companies and educational institutions.",
          ],
        },
      ],
    },
    {
      id: "target-beneficiaries",
      heading: "Target Beneficiaries",
      blocks: [
        {
          type: "list",
          items: [
            "Children in underserved and rural communities.",
            "Young people from economically disadvantaged households.",
            "Students with limited access to digital learning facilities.",
            "Out-of-school young people seeking digital skills.",
            "Children and young people with disabilities who require accessible digital learning opportunities.",
          ],
        },
      ],
    },
    {
      id: "planned-activities",
      heading: "Planned Activities",
      parts: [
        {
          heading: "A. Computer Access",
          blocks: [
            {
              type: "list",
              items: [
                "Provide desktop and laptop computers.",
                "Establish or support community digital learning centres.",
                "Support schools with ICT equipment.",
                "Mobilize refurbished computers in good working condition.",
              ],
            },
          ],
        },
        {
          heading: "B. Digital Literacy",
          blocks: [
            {
              type: "list",
              items: [
                "Basic computer operations.",
                "Word processing and spreadsheet skills.",
                "Internet navigation and online research.",
                "Digital communication and collaboration.",
                "Online safety and digital responsibility.",
              ],
            },
          ],
        },
        {
          heading: "C. STEM and Innovation",
          blocks: [
            {
              type: "list",
              items: [
                "Introduction to coding and programming.",
                "Robotics and practical technology activities.",
                "Introduction to artificial intelligence.",
                "Science and mathematics-based technology activities.",
                "Digital creativity and problem-solving.",
              ],
            },
          ],
        },
        {
          heading: "D. Digital Skills and Career Development",
          blocks: [
            {
              type: "list",
              items: [
                "Technology-based career awareness.",
                "Introduction to digital entrepreneurship.",
                "Practical digital skills training.",
                "Opportunities to explore future careers in technology.",
              ],
            },
          ],
        },
        {
          heading: "E. Accessible Digital Learning",
          blocks: [
            {
              type: "list",
              items: [
                "Assistive technology and accessible computer interfaces.",
                "Adaptive learning resources.",
                "Digital accessibility awareness.",
                "Technology training opportunities for learners with disabilities.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "how-you-can-support",
      heading: "How You Can Support",
      blocks: [
        {
          type: "list",
          items: [
            "Donate laptops and desktop computers.",
            "Donate tablets and digital learning devices.",
            "Provide internet connectivity.",
            "Sponsor digital literacy training.",
            "Provide accessible software and learning resources.",
            "Offer technical expertise and volunteer training.",
            "Establish digital learning partnerships.",
          ],
        },
      ],
    },
    {
      id: "expected-outcomes",
      heading: "Expected Outcomes",
      blocks: [
        {
          type: "list",
          items: [
            "Increased access to computers and digital resources.",
            "Improved digital literacy.",
            "Increased exposure to STEM and emerging technologies.",
            "Improved readiness for educational and employment opportunities.",
            "Reduced digital exclusion.",
            "Greater access to accessible digital learning.",
          ],
        },
      ],
    },
  ],
  actions: [
    { label: "Donate a Computer", href: "/contact" },
    { label: "Sponsor Digital Training", href: "/donate" },
    { label: "Support Digital Education", href: "/get-involved" },
    { label: "Partner With Us", href: "/partnerships" },
  ],
  supportHref: "/donate",
};

const equip: Campaign = {
  slug: "equip-edbridge-africa",
  kind: "campaign",
  title: "Equip EdBridge Africa",
  tagline: "Building Institutional Capacity, Advancing Technology and Strengthening Our Impact",
  summary:
    "Through this initiative, the organization seeks to establish the essential foundation required to coordinate its programmes, manage its operations, strengthen partnerships, document its impact and expand its services.",
  facts: [
    {
      term: "Campaign Theme",
      text: "Equipping an Emerging Organization to Expand Educational Access, Inclusion and Opportunity.",
    },
    { term: "Geographical Focus", text: "Ghana" },
    {
      term: "Campaign Category",
      text: "Institutional Capacity Development, Technology Acquisition and Organizational Infrastructure",
    },
  ],
  scene: "loom",
  sections: [
    {
      id: "overview",
      heading: "Campaign Overview",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "Equip EdBridge Africa is an organizational capacity-building and resource mobilization initiative designed to strengthen the technological, administrative, operational and programme-delivery capabilities of EdBridge Africa.",
            "The initiative seeks to mobilize financial contributions, technology equipment, office furniture, professional services and institutional partnerships from corporations, technology companies, foundations, philanthropic organizations, development partners, diaspora communities and individuals.",
            "As an emerging nonprofit organization committed to bridging the education gap for vulnerable children, young people and individuals with disabilities in Ghana, EdBridge Africa recognizes that achieving its mission requires adequate resources, appropriate technology, functional office facilities and sustainable institutional infrastructure.",
            "Through this initiative, the organization seeks to establish the essential foundation required to coordinate its programmes, manage its operations, strengthen partnerships, document its impact and expand its services.",
            "The campaign will be implemented progressively, beginning with essential technology and office equipment acquisition, followed by operational expansion and, ultimately, the development of a permanent organizational headquarters.",
          ],
        },
      ],
    },
    {
      id: "initial-targets",
      heading: "Initial Equipment Targets",
      stage: "Immediate priority",
      blocks: [
        {
          type: "table",
          caption: "Initial equipment targets",
          columns: ["Equipment", "Initial Acquisition", "Overall Target"],
          rows: [
            ["Laptop computers", "5", "8"],
            ["Digital cameras", "1", "2"],
            ["Tablets", "2", "6"],
          ],
        },
        {
          type: "text",
          paragraphs: [
            "These figures represent proposed fundraising targets and may be adjusted as the organization develops.",
          ],
        },
      ],
    },
    {
      id: "objectives",
      heading: "Campaign Objectives",
      blocks: [
        {
          type: "list",
          numbered: true,
          items: [
            "Acquire essential computers and technology equipment to strengthen organizational operations.",
            "Establish a functional, accessible and adequately equipped administrative office.",
            "Improve digital infrastructure, communication and information management.",
            "Acquire office furniture and administrative equipment.",
            "Provide assistive technology and accessibility resources to promote disability inclusion.",
            "Strengthen educational programme implementation, monitoring, evaluation and reporting.",
            "Improve the organization's capacity for community outreach, field assessments and beneficiary engagement.",
            "Develop the technological resources required for digital literacy, ICT, STEM and innovation programmes.",
            "Strengthen organizational visibility, communications and documentation of programme impact.",
            "Work towards acquiring land and establishing a permanent EdBridge Africa headquarters as a long-term institutional development project.",
          ],
        },
      ],
    },
    {
      id: "priority-areas",
      heading: "Priority Areas and Resource Requirements",
      parts: [
        {
          heading: "A. Computer and Technology Equipment",
          blocks: [
            {
              type: "text",
              paragraphs: [
                "Technology is fundamental to the effective administration, coordination and implementation of EdBridge Africa's programmes. The organization seeks support to acquire the following:",
              ],
            },
            {
              type: "table",
              caption: "Computer and technology equipment",
              columns: ["Equipment", "Target Quantity"],
              rows: [
                ["Laptop computers", "8"],
                ["Desktop computers", "2"],
                ["Tablets", "6"],
                ["Printers/scanners/photocopiers", "1"],
                ["Projectors", "2"],
                ["External hard drives", "3"],
                ["Internet routers", "2"],
                ["UPS/power backup units", "4"],
                ["Computer accessories and peripherals", "As required"],
              ],
            },
            { type: "subheading", text: "Proposed Laptop Allocation" },
            {
              type: "list",
              items: [
                "Two for executive and administrative management.",
                "Two for education and programme coordination.",
                "One for finance and accounting.",
                "One for monitoring, evaluation and data management.",
                "One for communications and partnerships.",
                "One for field operations and project support.",
              ],
            },
            {
              type: "text",
              paragraphs: ["The allocation may be adjusted as staffing and programme requirements develop."],
            },
            { type: "subheading", text: "Proposed Tablet Allocation" },
            {
              type: "list",
              items: [
                "Three for community outreach and beneficiary registration.",
                "One for educational assessments and field data collection.",
                "One for digital literacy and STEM programme demonstrations.",
                "One for presentations, meetings and general field and administrative operations.",
              ],
            },
            {
              type: "callout",
              term: "Expected Outcome",
              text: "Improved organizational efficiency, digital capacity, programme coordination and information management.",
            },
          ],
        },
        {
          heading: "B. Photography, Videography and Media Equipment",
          blocks: [
            {
              type: "text",
              paragraphs: [
                "Effective communication and documentation are important for demonstrating organizational activities, reporting programme outcomes and engaging supporters. EdBridge Africa seeks:",
              ],
            },
            {
              type: "table",
              caption: "Photography, videography and media equipment",
              columns: ["Equipment", "Target Quantity"],
              rows: [
                ["Digital cameras", "2"],
                ["Wireless microphone sets", "2"],
                ["Camera lenses and accessories", "As required"],
                ["Camera tripods and stabilizers", "2"],
                ["Camera lighting equipment", "2 sets"],
                ["Camera memory cards", "As required"],
                ["Video recording accessories", "As required"],
              ],
            },
            { type: "subheading", text: "Proposed Camera Allocation" },
            {
              type: "list",
              items: [
                "One primary professional camera for photography, video production, organizational events and documentary work.",
                "One secondary camera for community outreach, field documentation and simultaneous event coverage.",
              ],
            },
            {
              type: "text",
              paragraphs: [
                "The microphone sets will support interviews, presentations, educational videos, online meetings, awareness campaigns and documentary production.",
              ],
            },
            {
              type: "callout",
              term: "Expected Outcome",
              text: "Improved organizational communication, project documentation, donor reporting, awareness creation and visibility.",
            },
          ],
        },
        {
          heading: "C. Office Furniture and Administrative Equipment",
          blocks: [
            {
              type: "text",
              paragraphs: ["EdBridge Africa seeks to establish a professional, functional and welcoming office environment."],
            },
            {
              type: "list",
              items: [
                "Executive office desks and chairs.",
                "Staff workstations and ergonomic chairs.",
                "Conference and boardroom tables.",
                "Meeting-room chairs.",
                "Reception desks and visitor seating.",
                "Filing cabinets and document storage units.",
                "Bookshelves and storage facilities.",
                "Office stationery and supplies.",
                "Whiteboards and presentation boards.",
                "Air conditioning and ventilation equipment.",
                "Office lighting and electrical accessories.",
                "General office appliances and maintenance equipment.",
              ],
            },
            {
              type: "callout",
              term: "Expected Outcome",
              text: "A productive working environment that supports organizational administration, staff collaboration, stakeholder engagement and effective programme management.",
            },
          ],
        },
        {
          heading: "D. Assistive Technology and Accessibility Equipment",
          blocks: [
            {
              type: "text",
              paragraphs: [
                "Disability inclusion is an integral part of EdBridge Africa's mission. The organization seeks to promote accessible working environments and improve participation for individuals with disabilities.",
              ],
            },
            {
              type: "list",
              items: [
                "Screen-reading software.",
                "Screen-magnification software.",
                "Braille displays and Braille keyboards.",
                "Accessible computer peripherals.",
                "Adaptive keyboards and pointing devices.",
                "Hearing assistance equipment.",
                "Assistive communication devices.",
                "Adjustable desks and ergonomic furniture.",
                "Accessibility signage.",
                "Accessible presentation and communication equipment.",
              ],
            },
            {
              type: "callout",
              term: "Expected Outcome",
              text: "Improved accessibility, participation and inclusion in organizational activities and programmes.",
            },
          ],
        },
        {
          heading: "E. Internet, Communication and Digital Infrastructure",
          blocks: [
            {
              type: "text",
              paragraphs: ["Reliable digital infrastructure is essential for modern organizational operations."],
            },
            {
              type: "list",
              items: [
                "Broadband internet connectivity.",
                "Wi-Fi and networking equipment.",
                "Secure cloud storage.",
                "Organizational email and communication systems.",
                "Website development and maintenance.",
                "Digital beneficiary registration systems.",
                "Volunteer and staff management systems.",
                "Project management and collaboration software.",
                "Data protection and cybersecurity solutions.",
                "Productivity software and licences.",
              ],
            },
            {
              type: "callout",
              term: "Expected Outcome",
              text: "Improved communication, information security, coordination and operational efficiency.",
            },
          ],
        },
        {
          heading: "F. Power and Office Support Infrastructure",
          blocks: [
            {
              type: "text",
              paragraphs: ["To support reliable organizational operations, EdBridge Africa seeks:"],
            },
            {
              type: "list",
              items: [
                "Solar power systems.",
                "Inverters and battery storage.",
                "Backup generators where appropriate.",
                "Surge protectors and voltage regulators.",
                "Electrical installation and safety equipment.",
                "Air conditioning and ventilation systems.",
              ],
            },
            {
              type: "callout",
              term: "Expected Outcome",
              text: "Improved operational reliability and reduced disruption caused by power interruptions.",
            },
          ],
        },
        {
          heading: "G. Educational Programme and Training Equipment",
          blocks: [
            {
              type: "text",
              paragraphs: [
                "EdBridge Africa's programmes extend beyond administration. The organization also requires resources to support its educational, technological and community development activities.",
              ],
            },
            {
              type: "list",
              items: [
                "Educational books and learning materials.",
                "Digital learning computers and tablets.",
                "STEM and robotics learning kits.",
                "Science and mathematics teaching resources.",
                "Digital literacy training equipment.",
                "Projectors and interactive displays.",
                "Vocational training tools.",
                "Educational assessment materials.",
                "Public-address systems.",
                "Portable teaching and presentation equipment.",
              ],
            },
            {
              type: "callout",
              term: "Expected Outcome",
              text: "Improved delivery of literacy, numeracy, ICT, STEM, vocational and educational development programmes.",
            },
          ],
        },
        {
          heading: "H. Transportation and Field Operations Support",
          blocks: [
            {
              type: "text",
              paragraphs: [
                "As the organization expands its community outreach and programme activities, transportation and field equipment will become increasingly important.",
              ],
            },
            {
              type: "list",
              items: [
                "A utility vehicle or organizational van.",
                "Motorcycles for community outreach where appropriate.",
                "Portable computers and tablets.",
                "Mobile internet equipment.",
                "Field communication devices.",
                "Field documentation and assessment tools.",
                "Vehicle maintenance and fuel sponsorship.",
              ],
            },
            {
              type: "callout",
              term: "Expected Outcome",
              text: "Improved access to communities, beneficiary assessments, programme monitoring and field operations.",
            },
          ],
        },
      ],
    },
    {
      id: "headquarters",
      heading: "Long-Term Institutional Infrastructure Project",
      stage: "Long-term",
      parts: [
        {
          heading: "Establishing a Permanent EdBridge Africa Headquarters",
          blocks: [
            {
              type: "text",
              paragraphs: [
                "The development of a permanent organizational headquarters represents a long-term strategic aspiration of EdBridge Africa.",
                "While the immediate priorities of this campaign focus on technology acquisition, office equipment and operational capacity, the organization recognizes the importance of establishing a permanent institutional home to support its future growth and sustainability.",
                "The proposed headquarters will eventually serve as an administrative, operational, training and programme coordination centre.",
              ],
            },
            { type: "subheading", text: "Long-Term Development Objectives" },
            {
              type: "terms",
              items: [
                {
                  term: "Land Acquisition",
                  text: "Secure suitable land for the future development of the organization's headquarters.",
                },
                {
                  term: "Architectural Planning and Design",
                  text: "Develop architectural plans that incorporate functionality, accessibility, sustainability and future organizational requirements.",
                },
                {
                  term: "Headquarters Construction",
                  text: "Construct a permanent administrative and programme facility.",
                },
                {
                  term: "Administrative Offices",
                  text: "Provide dedicated working spaces for executive management, administration, finance, programme coordination and other organizational departments.",
                },
                {
                  term: "Conference and Meeting Facilities",
                  text: "Establish spaces for board meetings, institutional partnerships, stakeholder consultations and organizational engagements.",
                },
                {
                  term: "Training and Learning Facilities",
                  text: "Develop rooms for digital literacy, STEM, vocational training, educational development and capacity-building programmes.",
                },
                {
                  term: "Accessibility and Inclusive Infrastructure",
                  text: "Incorporate universal design principles, including accessible entrances, pathways, toilets, signage and working spaces.",
                },
                {
                  term: "Technology and Innovation Facilities",
                  text: "Establish a dedicated digital learning and innovation environment to support technology education and related initiatives.",
                },
                {
                  term: "Community Engagement Facilities",
                  text: "Provide spaces for community outreach, volunteer engagement, educational activities and stakeholder participation.",
                },
              ],
            },
            { type: "subheading", text: "Long-Term Vision" },
            {
              type: "text",
              paragraphs: [
                "To establish an accessible, professionally equipped and sustainable headquarters that strengthens EdBridge Africa's institutional presence and supports its mission across Ghana.",
                "The headquarters project will be developed progressively as the organization grows and secures the necessary land, partnerships, technical expertise and financial resources.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "implementation-phases",
      heading: "Campaign Implementation Phases",
      parts: [
        {
          heading: "Phase 1: Essential Technology Acquisition — Initial Priority",
          blocks: [
            {
              type: "list",
              items: [
                "Acquire five laptop computers.",
                "Acquire one digital camera.",
                "Acquire two tablets.",
                "Obtain wireless microphone equipment.",
                "Secure essential printing and scanning equipment.",
                "Obtain internet and networking equipment.",
                "Secure basic data storage and power protection resources.",
              ],
            },
          ],
        },
        {
          heading: "Phase 2: Office Establishment and Furnishing",
          blocks: [
            {
              type: "list",
              items: [
                "Acquire essential office desks and chairs.",
                "Establish administrative workstations.",
                "Obtain reception and meeting-room furniture.",
                "Secure filing and storage equipment.",
                "Acquire essential office appliances and supplies.",
              ],
            },
          ],
        },
        {
          heading: "Phase 3: Digital and Programme Capacity Development",
          blocks: [
            {
              type: "list",
              items: [
                "Expand the computer inventory to eight laptops.",
                "Acquire the second digital camera.",
                "Expand the tablet inventory to six.",
                "Establish digital training and programme resources.",
                "Acquire assistive technology.",
                "Strengthen organizational information management systems.",
              ],
            },
          ],
        },
        {
          heading: "Phase 4: Operational and Programme Expansion",
          blocks: [
            {
              type: "list",
              items: [
                "Strengthen community outreach operations.",
                "Acquire additional field equipment.",
                "Secure transportation support.",
                "Expand training and educational resources.",
                "Improve power and infrastructure systems.",
              ],
            },
          ],
        },
        {
          heading: "Phase 5: Permanent Headquarters Development — Long-Term Strategic Project",
          blocks: [
            {
              type: "list",
              items: [
                "Identify and acquire suitable land.",
                "Develop architectural and infrastructure plans.",
                "Mobilize capital and institutional partnerships.",
                "Secure construction and technical partners.",
                "Construct and equip a permanent headquarters.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "partnership-opportunities",
      heading: "Partnership and Donor Engagement Opportunities",
      blocks: [
        { type: "text", paragraphs: ["EdBridge Africa welcomes partnerships and contributions from:"] },
        {
          type: "list",
          items: [
            "International technology companies.",
            "Computer manufacturers and distributors.",
            "Banks and financial institutions.",
            "Corporate organizations.",
            "International foundations.",
            "Philanthropic organizations.",
            "Development partners.",
            "Universities and educational institutions.",
            "Churches and faith-based organizations.",
            "Diaspora communities.",
            "Individual philanthropists.",
            "Construction and property development companies.",
          ],
        },
      ],
      parts: [
        {
          heading: "Opportunities for Support",
          blocks: [
            {
              type: "list",
              numbered: true,
              items: [
                "Donation of new or professionally refurbished computers.",
                "Sponsorship of specific technology equipment.",
                "Provision of office furniture and administrative resources.",
                "Donation of assistive technology.",
                "Financial contributions towards priority equipment.",
                "Software, internet and digital infrastructure sponsorship.",
                "Professional services and technical expertise.",
                "Corporate equipment donation partnerships.",
                "Support for long-term headquarters development.",
                "Construction materials, architectural services and land acquisition partnerships.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "transparency",
      heading: "Transparency, Accountability and Donor Recognition",
      blocks: [
        {
          type: "text",
          paragraphs: [
            "EdBridge Africa is committed to responsible resource management and transparent utilization of donated resources.",
          ],
        },
        {
          type: "list",
          items: [
            "Documented equipment procurement and donation records.",
            "Proper inventory and asset management.",
            "Financial documentation and reporting.",
            "Donor acknowledgement and recognition.",
            "Periodic campaign progress updates.",
            "Photographic documentation of donated equipment and completed projects.",
            "Monitoring and evaluation of donated resources.",
            "Appropriate safeguarding and data protection procedures.",
          ],
        },
        {
          type: "text",
          paragraphs: [
            "Donors and partners may receive updates on how their contributions strengthen the organization's operations and programme delivery.",
          ],
        },
      ],
    },
    {
      id: "expected-impact",
      heading: "Expected Organizational Impact",
      blocks: [
        {
          type: "list",
          numbered: true,
          items: [
            "Strengthen institutional and administrative capacity.",
            "Improve the quality and efficiency of programme delivery.",
            "Expand access to technology and digital learning resources.",
            "Promote disability inclusion and workplace accessibility.",
            "Improve organizational accountability and operational sustainability.",
            "Strengthen partnerships with local and international stakeholders.",
            "Improve community outreach and programme monitoring.",
            "Strengthen organizational visibility and donor communication.",
            "Establish a foundation for future institutional growth.",
            "Work towards developing a permanent organizational headquarters.",
          ],
        },
      ],
    },
  ],
  closing: {
    heading: "Help Us Equip EdBridge Africa for Greater Impact",
    paragraphs: [
      "Every meaningful intervention requires the right resources, appropriate infrastructure and committed partnerships.",
      "We invite corporations, technology companies, foundations, development partners, philanthropic institutions, diaspora communities and individuals to join us in strengthening EdBridge Africa.",
      "Your contribution, whether through equipment donations, financial support, technical expertise or institutional partnerships, will help build the capacity required to advance educational access, inclusion and opportunity.",
      "Together, we can build a stronger organization, support more communities and create lasting opportunities for vulnerable children, young people and individuals with disabilities in Ghana.",
    ],
    slogan: "Equip EdBridge Africa. Strengthen Our Capacity. Expand Our Impact.",
  },
  actions: [
    { label: "Donate a Laptop", href: "/contact" },
    { label: "Donate a Desktop Computer", href: "/contact" },
    { label: "Support Our Operations", href: "/donate" },
    { label: "Become a Corporate Partner", href: "/partnerships" },
  ],
  supportHref: "/donate",
};

export const flagshipInitiative = youthInitiative;

// The order EdBridge numbers its campaigns in.
export const campaigns: Campaign[] = [backToSchool, everyAbility, oneChildOneDigitalOpportunity, equip];

export const allCampaigns: Campaign[] = [youthInitiative, ...campaigns];

export const campaignHref = (slug: string) => `/campaigns/${slug}`;

export function getCampaign(slug: string) {
  return allCampaigns.find((campaign) => campaign.slug === slug);
}

export const campaignLabel = (campaign: Campaign) =>
  campaign.kind === "flagship" ? "Flagship programme initiative" : "Campaign";

export const supportLabel = (campaign: Campaign) =>
  campaign.kind === "flagship" ? "Support This Initiative" : "Support this campaign";

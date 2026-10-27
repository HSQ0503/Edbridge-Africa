export type Leader = {
  role: string;
  // null until EdBridge supplies names, photos and bios (PLAN.md §19).
  name: string | null;
  bio?: string;
};

export const board: Leader[] = [
  { role: "Board Chairperson", name: null },
  { role: "Vice Chairperson", name: null },
  { role: "Board Secretary", name: null },
  { role: "Board Treasurer", name: null },
  { role: "Board Member", name: null },
  { role: "Board Member", name: null },
];

export const executiveTeam: Leader[] = [
  { role: "Executive Director", name: null },
  { role: "Deputy Executive Director", name: null },
  { role: "Director of Programs", name: null },
  { role: "Director of Operations", name: null },
];

export const boardResponsibilities = [
  "Setting strategic direction and approving organisational policies",
  "Overseeing finances, approving budgets and reviewing audited accounts",
  "Reviewing organisational performance and program outcomes",
  "Ensuring accountability, safeguarding and compliance with Ghanaian law",
];

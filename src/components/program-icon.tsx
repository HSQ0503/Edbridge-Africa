import { Accessibility, BookOpen, Briefcase, GraduationCap, Laptop, ShieldCheck, Users } from "lucide-react";
import type { ProgramIcon as ProgramIconName } from "@/content/programs";

const icons = {
  education: GraduationCap,
  disability: Accessibility,
  literacy: BookOpen,
  digital: Laptop,
  youth: Briefcase,
  community: Users,
  protection: ShieldCheck,
};

export function ProgramIcon({ name, className = "size-6" }: { name: ProgramIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" className={className} />;
}

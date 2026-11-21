import { notFound } from "next/navigation";
import { requireStaff } from "../staff";
import { can, type BeneficiaryPermission } from "./permissions";

export { can, type BeneficiaryPermission };

// Pages and actions a staff member can't use are reported as not found, like inboxes they can't open.
export async function requireBeneficiaryPermission(permission: BeneficiaryPermission) {
  const staff = await requireStaff();
  if (!can(staff, permission)) notFound();
  return staff;
}

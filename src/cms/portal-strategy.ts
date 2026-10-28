import type { AuthStrategy } from "payload";
import { loadStaff } from "@/server/staff";

// The CMS has no passwords of its own: it trusts the portal session (MFA, idle timeout, lockout) and mirrors the
// person's editing roles into its users collection.
export const portalStrategy: AuthStrategy = {
  name: "portal-session",
  async authenticate({ headers, payload }) {
    const staff = await loadStaff(headers);
    if (!staff?.mfaEnabled || staff.cmsRoles.length === 0) return { user: null };

    const data = { portalUserId: staff.id, name: staff.name, email: staff.email, roles: staff.cmsRoles };
    const {
      docs: [existing],
    } = await payload.find({ collection: "users", where: { portalUserId: { equals: staff.id } }, limit: 1, depth: 0 });
    const unchanged =
      existing &&
      existing.name === data.name &&
      existing.email === data.email &&
      [...(existing.roles ?? [])].sort().join() === [...data.roles].sort().join();
    const user = !existing
      ? await payload.create({ collection: "users", data })
      : unchanged
        ? existing
        : await payload.update({ collection: "users", id: existing.id, data });

    return { user: { ...user, collection: "users", _strategy: "portal-session" } };
  },
};

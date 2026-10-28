import type { Access, CollectionConfig, PayloadRequest } from "payload";
import type { CmsRole } from "@/generated/prisma/enums";

export function hasRole(user: PayloadRequest["user"], role: CmsRole) {
  return Boolean(user && "roles" in user && user.roles?.includes(role));
}

// Every CMS user holds at least one editing role: the portal strategy turns everyone else away.
export const signedIn: Access = ({ req }) => Boolean(req.user);
export const publishers: Access = ({ req }) => hasRole(req.user, "publisher");

// The public site reads content through the server-side Local API, so anonymous REST requests get nothing.
export const editorialAccess: CollectionConfig["access"] = {
  create: signedIn,
  read: signedIn,
  readVersions: signedIn,
  update: signedIn,
  delete: publishers,
};

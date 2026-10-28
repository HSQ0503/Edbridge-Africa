import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import { redirect } from "next/navigation";
import { getStaff } from "@/server/staff";
import { importMap } from "../importMap";

type Args = PageProps<"/cms/[[...segments]]">;
// Payload's views are typed more narrowly than Next's route props.
type PayloadParams = Promise<{ segments: string[] }>;
type PayloadSearchParams = Promise<{ [key: string]: string | string[] }>;

// The editor renders per request for the signed-in person.
export const instant = false;

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params: params as PayloadParams, searchParams: searchParams as PayloadSearchParams });

// Payload would show its own sign-in screen; staff sign in through the portal instead.
export default async function CmsPage({ params, searchParams }: Args) {
  const staff = await getStaff();
  if (!staff) redirect("/portal/sign-in");
  if (!staff.mfaEnabled) redirect("/portal/set-up-mfa");
  return RootPage({ config, importMap, params: params as PayloadParams, searchParams: searchParams as PayloadSearchParams });
}

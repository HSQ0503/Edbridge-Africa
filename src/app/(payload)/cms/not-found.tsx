import config from "@payload-config";
import { NotFoundPage } from "@payloadcms/next/views";
import { importMap } from "./importMap";

export default function CmsNotFound() {
  return NotFoundPage({
    config,
    importMap,
    params: Promise.resolve({ segments: [] }),
    searchParams: Promise.resolve({}),
  });
}

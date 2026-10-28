import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, RequestContext } from "payload";

export type CmsTag = "news" | "people" | "jobs" | "settings";

export function cmsTag(tag: CmsTag) {
  return `cms:${tag}`;
}

// Scripts such as the seed run outside Next.js, where there is no cache to revalidate.
function revalidate(context: RequestContext, tags: CmsTag[]) {
  if (context.outsideNext) return;
  for (const tag of tags) revalidateTag(cmsTag(tag), "max");
}

export function revalidateOnChange(...tags: CmsTag[]): CollectionAfterChangeHook {
  return ({ doc, context }) => {
    revalidate(context, tags);
    return doc;
  };
}

export function revalidateOnDelete(...tags: CmsTag[]): CollectionAfterDeleteHook {
  return ({ doc, context }) => {
    revalidate(context, tags);
    return doc;
  };
}

export function revalidateGlobal(...tags: CmsTag[]): GlobalAfterChangeHook {
  return ({ doc, context }) => {
    revalidate(context, tags);
    return doc;
  };
}

import type { Metadata } from "next";
import Link from "next/link";
import { getGalleryPhotos } from "@/cms/queries";
import { EmptyState } from "@/components/empty-state";
import { Gallery } from "@/components/gallery";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Photo gallery",
  description: "Photos of EdBridge Africa's activities, projects and impact in Ghana.",
};

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="Photo gallery"
        intro="Our activities, projects and impact, in pictures."
      />

      <Section id="photos" title={photos.length ? undefined : "Photos"}>
        {photos.length ? (
          <Gallery photos={photos} />
        ) : (
          <EmptyState title="Photos are on their way">
            <p>
              Photos from our activities and projects will appear here as we share them. In the meantime, read the{" "}
              <Link href="/impact#stories" className="link font-medium">
                stories of children we support
              </Link>{" "}
              or see our{" "}
              <Link href="/campaigns" className="link font-medium">
                campaigns and initiatives
              </Link>
              .
            </p>
          </EmptyState>
        )}
      </Section>

      <Section id="consent" tone="sand" title="How we share photos">
        <div className="prose">
          <p>
            A photo of a child can only appear on this website with consent from the child and their family, and it
            comes down automatically when that consent ends. Location data is removed from every photo when it is
            uploaded.
          </p>
          <p>
            Have a photo of an EdBridge Africa activity you would like to share?{" "}
            <Link href="/contact">Contact us</Link>.
          </p>
        </div>
      </Section>
    </>
  );
}

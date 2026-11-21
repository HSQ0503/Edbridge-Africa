import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { getStory, stories } from "@/content/stories";

export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: PageProps<"/impact/stories/[slug]">): Promise<Metadata> {
  const story = getStory((await params).slug);
  return story ? { title: `${story.name}'s story`, description: story.summary } : {};
}

export default async function StoryPage({ params }: PageProps<"/impact/stories/[slug]">) {
  const story = getStory((await params).slug);
  if (!story) notFound();

  return (
    <article>
      <header className="bg-sand py-12 sm:py-16">
        <Container className="max-w-3xl space-y-4">
          <p>
            <Link href="/impact#stories" className="link inline-flex items-center gap-2 font-medium">
              <ArrowLeft aria-hidden="true" className="size-4" /> Stories of change
            </Link>
          </p>
          <h1 className="text-balance text-4xl sm:text-5xl">{story.title}</h1>
          <p className="text-lg text-muted">{story.summary}</p>
        </Container>
      </header>

      <Container className="max-w-3xl py-12 sm:py-16">
        <div className="prose">
          {story.parts.map((part, index) => (
            <Fragment key={part.heading ?? index}>
              {part.heading && <h2>{part.heading}</h2>}
              {part.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {part.list && (
                <ul>
                  {part.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {part.after?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </Fragment>
          ))}
          <p className="font-medium">
            EdBridge Africa, Bridging the Education Gap for Vulnerable Children and Young People in Ghana.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-line pt-8">
          <ButtonLink href="/donate">Help another child return to school</ButtonLink>
          <ButtonLink href="/impact#stories" variant="secondary">
            Read more stories
          </ButtonLink>
        </div>
      </Container>
    </article>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryPhoto } from "@/cms/queries";

const viewerButton =
  "inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/20 text-[#f3efe6] transition-colors duration-150 hover:bg-white/10 active:scale-[.97]";

// A grid of photos that each open a full-screen viewer. The viewer is a native modal dialog, so focus stays inside
// it, Escape closes it and focus returns to the photo that opened it; the arrow keys step through the photos.
export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const photo = current === null ? null : photos[current];

  useEffect(() => {
    if (current !== null && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [current]);

  function close() {
    dialogRef.current?.close();
  }

  function step(by: number) {
    setCurrent((index) => (index === null ? null : (index + by + photos.length) % photos.length));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  }

  // A click on the viewer's open margin, outside the photo and the controls, closes it.
  function closeOnBackdrop(event: React.MouseEvent<HTMLElement>) {
    if (event.target === event.currentTarget) close();
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 lg:grid-cols-3">
        {photos.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setCurrent(index)}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-sand"
            >
              <Image
                src={item.url}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(min-width: 1152px) 368px, (min-width: 1024px) 31vw, 48vw"
                className="aspect-[4/3] w-full object-cover transition-transform duration-200 ease-[var(--ease)] motion-safe:group-hover:scale-[1.02]"
              />
            </button>
            {/* A library photo's caption repeats its description, which screen readers already heard. */}
            <p aria-hidden={item.post ? undefined : true} className="mt-2 line-clamp-2 text-sm text-muted">
              {item.post?.title ?? item.alt}
            </p>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Photo viewer"
        onClose={() => setCurrent(null)}
        onKeyDown={handleKeyDown}
        className="h-dvh max-h-none w-full max-w-none bg-[#121512]/[0.97] p-0 text-[#f3efe6] [--focus-outline:#f3efe6] backdrop:bg-transparent"
      >
        {photo && current !== null && (
          <div onClick={closeOnBackdrop} className="flex h-full flex-col gap-3 p-3 sm:gap-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p aria-live="polite" className="text-sm tabular-nums text-[#c9c3b6]">
                Photo {current + 1} of {photos.length}
                <span className="sr-only">: {photo.alt}</span>
              </p>
              <button type="button" onClick={close} aria-label="Close photo viewer" className={viewerButton}>
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center">
              <Image
                key={photo.id}
                src={photo.url}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="100vw"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              {photos.length > 1 ? (
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={viewerButton}>
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
              ) : (
                <span />
              )}
              <div className="min-w-0 text-center text-base">
                <p aria-hidden="true" className="line-clamp-2">
                  {photo.alt}
                </p>
                {photo.post && (
                  <Link href={photo.post.href} className="link mt-1 inline-block text-sm text-[#f3efe6]">
                    From: {photo.post.title}
                  </Link>
                )}
              </div>
              {photos.length > 1 ? (
                <button type="button" onClick={() => step(1)} aria-label="Next photo" className={viewerButton}>
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              ) : (
                <span />
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Without JavaScript the plain #top link still jumps up. With it, the page glides (unless motion is reduced) and
// focus moves to the header, so the next Tab starts from the top instead of where the reader left off.
function goToTop(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  document.getElementById("top")?.focus({ preventScroll: true });
}

export function BackToTopLink({ className = "" }: { className?: string }) {
  return (
    <a href="#top" onClick={goToTop} className={className}>
      <ArrowUp aria-hidden="true" className="size-4" strokeWidth={2} />
      <span className="nav-link">Back to top</span>
    </a>
  );
}

// Appears once the reader is a screen and a half down, where scrolling back up starts to take effort, and steps
// aside when the footer, which has its own Back to top link, comes into view.
export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let scrolledDown = false;
    let footerInView = false;
    const update = () => setVisible(scrolledDown && !footerInView);

    function handleScroll() {
      scrolledDown = window.scrollY > window.innerHeight * 1.5;
      update();
    }

    const footer = document.querySelector("footer");
    const observer = new IntersectionObserver(([entry]) => {
      footerInView = entry.isIntersecting;
      update();
    });
    if (footer) observer.observe(footer);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <a
      href="#top"
      onClick={goToTop}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-lg border border-on-brand/25 bg-brand px-3 font-medium text-on-brand no-underline shadow-[0_6px_20px_rgb(26_26_23/0.18)] transition-[opacity,translate,visibility,background-color] duration-200 ease-[var(--ease-enter)] hover:bg-brand-strong active:scale-[.97] sm:right-6 sm:px-4 ${
        visible ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp aria-hidden="true" className="size-5" strokeWidth={2} />
      <span className="sr-only sm:not-sr-only">Back to top</span>
    </a>
  );
}

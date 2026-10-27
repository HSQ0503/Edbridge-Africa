"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, string>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

function getTurnstile() {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Cloudflare Turnstile adds a hidden `cf-turnstile-response` field to the surrounding form.
// "interaction-only" keeps it invisible unless Cloudflare needs the visitor to click.
export function Turnstile({ resetSignal }: { resetSignal: unknown }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const lastSignalRef = useRef(resetSignal);

  const renderWidget = useCallback(() => {
    const turnstile = getTurnstile();
    if (!siteKey || !turnstile || !containerRef.current || widgetIdRef.current !== undefined) return;
    widgetIdRef.current = turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "auto",
      size: "flexible",
      appearance: "interaction-only",
    });
  }, []);

  // Explicit rendering, because the script only scans the page once: forms reached by client-side
  // navigation, or shown again from Next's preserved pages, would otherwise get no widget.
  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetIdRef.current !== undefined) getTurnstile()?.remove(widgetIdRef.current);
      widgetIdRef.current = undefined;
    };
  }, [renderWidget]);

  // Tokens are single-use, so every submission needs a fresh one.
  useEffect(() => {
    if (lastSignalRef.current === resetSignal) return;
    lastSignalRef.current = resetSignal;
    if (widgetIdRef.current !== undefined) getTurnstile()?.reset(widgetIdRef.current);
  }, [resetSignal]);

  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={renderWidget} />
      <div ref={containerRef} />
    </>
  );
}

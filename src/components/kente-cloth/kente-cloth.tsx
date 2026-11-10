"use client";

import { useEffect, useRef } from "react";
import { startCloth, type ClothMode } from "./renderer";

type KenteClothProps = {
  className?: string;
  strips?: number;
  length?: number;
  mode?: ClothMode;
  shift?: number;
  // The flat woven panel: shown until the cloth draws, and kept where WebGL isn't available.
  children: React.ReactNode;
};

export function KenteCloth({ className = "", strips = 6, length = 3.4, mode = "intro", shift = 0, children }: KenteClothProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;
    const showFlat = () => frame.setAttribute("data-cloth", "flat");
    const stop = startCloth(canvas, {
      strips,
      length,
      mode,
      shift,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      onFirstFrame: () => frame.setAttribute("data-cloth", "live"),
      onLost: showFlat,
    });
    if (!stop) showFlat();
    return () => stop?.();
  }, [strips, length, mode, shift]);

  return (
    <div ref={frameRef} data-cloth="waiting" data-enter-media className={`kente-cloth relative ${className}`}>
      <div className="kente-cloth-flat absolute inset-0">{children}</div>
      <canvas ref={canvasRef} aria-hidden="true" className="kente-cloth-canvas absolute inset-0 size-full" />
    </div>
  );
}

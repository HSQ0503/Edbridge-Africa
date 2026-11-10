"use client";

import { useEffect, useId, useRef } from "react";
import { WovenPanel } from "../woven";
import { startScene } from "./renderer";
import { SCENES, type SceneMode, type SceneName } from "./scenes";

type KenteSceneProps = {
  scene: SceneName;
  className?: string;
  strips?: number;
  length?: number;
  count?: number;
  shift?: number;
  mode?: SceneMode;
  // A flat stand-in shown until the scene draws. Without one, the space stays clear while it loads.
  children?: React.ReactNode;
};

export function KenteScene({ scene, className = "", strips, length, count, shift = 0, mode, children }: KenteSceneProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patternId = `scene-weave-${useId().replace(/[^\w-]/g, "")}`;

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;
    const definition = SCENES[scene];
    const steps = count ?? definition.count ?? 0;
    const showFlat = () => frame.setAttribute("data-scene-state", "flat");
    const stop = startScene(canvas, {
      scene: definition,
      strips: strips ?? definition.strips,
      length: length ?? (typeof definition.length === "number" ? definition.length : definition.length(steps)),
      count: steps,
      shift,
      mode: mode ?? definition.mode,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      onFirstFrame: () => frame.setAttribute("data-scene-state", "live"),
      onLost: showFlat,
    });
    if (!stop) showFlat();
    return () => stop?.();
  }, [scene, strips, length, count, shift, mode]);

  return (
    <div
      ref={frameRef}
      data-scene-state="waiting"
      data-standin={children ? "" : undefined}
      data-enter-media
      className={`kente-scene relative ${className}`}
    >
      <div className="kente-scene-flat absolute inset-0">
        {children ?? <WovenPanel id={patternId} className="mx-auto h-full w-2/3" />}
      </div>
      <canvas ref={canvasRef} aria-hidden="true" className="kente-scene-canvas absolute inset-0 size-full" />
    </div>
  );
}

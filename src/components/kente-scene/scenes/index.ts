import { bridge } from "./bridge";
import { cloth } from "./cloth";
import { helix } from "./helix";
import { join } from "./join";
import { LOOM_WARPS, loom } from "./loom";
import { ring } from "./ring";
import { stairs, stairsLength } from "./stairs";

export type SceneName = "cloth" | "bridge" | "converge" | "fan" | "stairs" | "helix" | "loom" | "ring";

// intro builds once on load; reveal builds once the scene is well into view; scroll is scrubbed by scrolling.
export type SceneMode = "intro" | "reveal" | "scroll";

export type SceneSetup = { strips: number; length: number; count: number };

export type Scene = {
  source: string;
  strips: number;
  length: number | ((count: number) => number);
  count?: number;
  variant?: number;
  width?: number;
  segments?: number;
  // The width and height the camera keeps in frame.
  extent: (setup: SceneSetup) => [number, number];
  turn: number;
  tilt: number;
  sway?: number;
  spin?: number;
  buildSeconds: number;
  mode: SceneMode;
  scrollTilt?: boolean;
};

const STRIP_WIDTH = 0.42;
const STRIP_GAP = 0.025;

const clothWidth = (strips: number) => strips * (STRIP_WIDTH + STRIP_GAP) - STRIP_GAP;

export const SCENES: Record<SceneName, Scene> = {
  cloth: {
    source: cloth,
    strips: 6,
    length: 3.4,
    extent: ({ strips, length }) => [clothWidth(strips) * 1.1, length * 1.08],
    turn: -0.42,
    tilt: 0.06,
    buildSeconds: 2.6,
    mode: "intro",
    scrollTilt: true,
  },
  bridge: {
    source: bridge,
    strips: 8,
    // Five whole blocks from each bank, so the two halves meet on a block edge.
    length: 5 * STRIP_WIDTH,
    extent: () => [3.5, 2.0],
    turn: -0.45,
    tilt: 0.45,
    sway: 0.12,
    buildSeconds: 3.2,
    mode: "reveal",
  },
  converge: {
    source: join,
    strips: 4,
    length: 3.3,
    variant: 0,
    extent: () => [3.4, 3.4],
    turn: -0.25,
    tilt: 0.1,
    sway: 0.18,
    buildSeconds: 3,
    mode: "reveal",
  },
  fan: {
    source: join,
    strips: 5,
    length: 3.3,
    variant: 1,
    extent: () => [3.4, 3.4],
    turn: 0.25,
    tilt: 0.1,
    sway: 0.18,
    buildSeconds: 3,
    mode: "reveal",
  },
  stairs: {
    source: stairs,
    strips: 4,
    count: 4,
    length: stairsLength,
    segments: 240,
    extent: ({ count }) => [1.2 + count * 0.62, 1.8 + count * 0.42],
    turn: 0.5,
    tilt: 0.55,
    sway: 0.1,
    buildSeconds: 3.4,
    mode: "reveal",
  },
  helix: {
    source: helix,
    strips: 2,
    length: 10.6,
    width: 0.5,
    segments: 260,
    extent: () => [2.6, 3.7],
    turn: 0,
    tilt: 0.22,
    spin: 0.25,
    buildSeconds: 3.2,
    mode: "reveal",
  },
  loom: {
    source: loom,
    strips: LOOM_WARPS + 5,
    length: 3,
    segments: 180,
    extent: () => [3.1, 3.1],
    turn: -0.38,
    tilt: 0.12,
    sway: 0.12,
    buildSeconds: 4.4,
    mode: "reveal",
  },
  ring: {
    source: ring,
    strips: 3,
    // Twenty blocks round, a whole number of pattern repeats, so the ring closes without a seam.
    length: 20 * STRIP_WIDTH,
    segments: 260,
    extent: () => [2.9, 2.1],
    turn: 0,
    tilt: 0.42,
    spin: -0.2,
    buildSeconds: 3,
    mode: "reveal",
  },
};

export { STRIP_GAP, STRIP_WIDTH };

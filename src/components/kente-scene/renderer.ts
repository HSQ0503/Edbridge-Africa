import { multiply, perspective, rotationX, rotationY, translation } from "./matrix";
import { STRIP_GAP, STRIP_WIDTH, type Scene, type SceneMode } from "./scenes";
import { buildVertexShader, fragmentShader } from "./shaders";

export type SceneSettings = {
  scene: Scene;
  strips: number;
  length: number;
  count: number;
  shift: number;
  mode: SceneMode;
  reducedMotion: boolean;
  onFirstFrame: () => void;
  onLost: () => void;
};

// The cloth is dyed once: the light-theme brand colours, which don't flip with the colour scheme.
const DYES: Record<string, [number, number, number]> = {
  u_green: [0.122, 0.361, 0.227],
  u_gold: [0.91, 0.702, 0.227],
  u_red: [0.651, 0.239, 0.09],
  u_black: [0.102, 0.102, 0.09],
};

const UNIFORMS = [
  "u_mvp",
  "u_model",
  "u_eye",
  "u_time",
  "u_wind",
  "u_progress",
  "u_strips",
  "u_width",
  "u_gap",
  "u_length",
  "u_count",
  "u_variant",
  "u_shift",
];

const SEGMENTS_ALONG = 140;
const SEGMENTS_ACROSS = 6;
const FIELD_OF_VIEW = (30 * Math.PI) / 180;
const POINTER_TURN = 0.24;
const POINTER_TILT = 0.12;
const SCROLL_TILT = 0.45;
const SWAY_SPEED = 0.35;
const EASING = 0.06;
const REVEAL_SHARE = 0.3;
const MAX_PIXEL_RATIO = 2;
const STILL_TIME = 1.3;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGL2RenderingContext, sceneSource: string) {
  const vertex = compile(gl, gl.VERTEX_SHADER, buildVertexShader(sceneSource));
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

// One grid per strip: u runs down the strip, v across it.
function buildStrips(strips: number, segmentsAlong: number) {
  const columns = SEGMENTS_ACROSS + 1;
  const rows = segmentsAlong + 1;
  const perStrip = rows * columns;
  const uv = new Float32Array(strips * perStrip * 2);
  const stripIndex = new Float32Array(strips * perStrip);
  const indices = new Uint16Array(strips * segmentsAlong * SEGMENTS_ACROSS * 6);
  let cursor = 0;
  for (let strip = 0; strip < strips; strip++) {
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const vertex = strip * perStrip + row * columns + column;
        uv.set([row / segmentsAlong, column / SEGMENTS_ACROSS], vertex * 2);
        stripIndex[vertex] = strip;
        if (row === segmentsAlong || column === SEGMENTS_ACROSS) continue;
        const below = vertex + columns;
        indices.set([vertex, below, below + 1, vertex, below + 1, vertex + 1], cursor);
        cursor += 6;
      }
    }
  }
  return { uv, stripIndex, indices };
}

function uploadStrips(gl: WebGL2RenderingContext, program: WebGLProgram, strips: number, segmentsAlong: number) {
  const { uv, stripIndex, indices } = buildStrips(strips, segmentsAlong);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const attribute = (name: string, data: Float32Array, size: number) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    return buffer;
  };
  const indexBuffer = gl.createBuffer();
  const buffers = [attribute("a_uv", uv, 2), attribute("a_strip", stripIndex, 1), indexBuffer];
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return { vao, buffers, count: indices.length };
}

// Far enough back that the whole scene fits the canvas, whatever its shape.
function cameraDistance(aspect: number, [width, height]: [number, number]) {
  const halfView = Math.tan(FIELD_OF_VIEW / 2);
  return Math.max(height / 2 / halfView, width / 2 / (halfView * aspect)) + 0.3;
}

// How much of the element is on screen, from 0 to 1.
function shareInView(rect: DOMRect) {
  const shown = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return clamp(shown / Math.max(rect.height, 1), 0, 1);
}

export function startScene(canvas: HTMLCanvasElement, settings: SceneSettings): (() => void) | null {
  const context = canvas.getContext("webgl2", { antialias: true, alpha: true, powerPreference: "low-power" });
  if (!context) return null;
  const gl: WebGL2RenderingContext = context;
  const { scene } = settings;
  const program = createProgram(gl, scene.source);
  if (!program) return null;

  const width = scene.width ?? STRIP_WIDTH;
  const { vao, buffers, count } = uploadStrips(gl, program, settings.strips, scene.segments ?? SEGMENTS_ALONG);
  const uniforms = Object.fromEntries(
    [...UNIFORMS, ...Object.keys(DYES)].map((name) => [name, gl.getUniformLocation(program, name)]),
  );
  gl.useProgram(program);
  Object.entries(DYES).forEach(([name, rgb]) => gl.uniform3fv(uniforms[name], rgb));
  gl.uniform1f(uniforms.u_strips, settings.strips);
  gl.uniform1f(uniforms.u_width, width);
  gl.uniform1f(uniforms.u_gap, STRIP_GAP);
  gl.uniform1f(uniforms.u_length, settings.length);
  gl.uniform1f(uniforms.u_count, settings.count);
  gl.uniform1f(uniforms.u_variant, scene.variant ?? 0);
  gl.uniform1f(uniforms.u_shift, settings.shift);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  const extent = scene.extent({ strips: settings.strips, length: settings.length, count: settings.count });
  const still = settings.reducedMotion;
  let pointer = { x: 0, y: 0 };
  let turn = 0;
  let tilt = 0;
  let scrollTilt = 0;
  let gust = 0;
  let progress = still ? 1 : 0;
  let time = STILL_TIME;
  let buildStart = -1;
  let visible = false;
  let frame = 0;
  let drawn = false;
  let stopped = false;

  function advanceBuild(seconds: number, rect: DOMRect) {
    if (settings.mode === "scroll") {
      // Scrubbed by scroll: builds as it rises from the bottom of the screen to its upper third.
      const target = clamp((window.innerHeight * 0.95 - rect.top) / (window.innerHeight * 0.6), 0, 1);
      progress += (target - progress) * EASING * 1.5;
      return;
    }
    const ready = settings.mode === "intro" || shareInView(rect) >= REVEAL_SHARE;
    if (buildStart < 0 && ready) buildStart = seconds;
    if (buildStart >= 0) progress = Math.min((seconds - buildStart) / scene.buildSeconds, 1);
  }

  function step(now: number) {
    const seconds = now / 1000;
    const rect = canvas.getBoundingClientRect();
    advanceBuild(seconds, rect);
    if (scene.scrollTilt) scrollTilt = clamp(-rect.top / Math.max(rect.height, 1), 0, 1) * SCROLL_TILT;
    turn += (pointer.x * POINTER_TURN - turn) * EASING;
    tilt += (pointer.y * POINTER_TILT - tilt) * EASING;
    gust *= 0.97;
    time = seconds;
  }

  function draw() {
    const { width: pixelsWide, height: pixelsHigh } = canvas;
    if (!pixelsWide || !pixelsHigh) return;
    const aspect = pixelsWide / pixelsHigh;
    const distance = cameraDistance(aspect, extent);
    const sway = (scene.sway ?? 0) * Math.sin(time * SWAY_SPEED);
    const yaw = scene.turn + sway + (scene.spin ?? 0) * time + turn;
    const model = multiply(rotationY(yaw), rotationX(scene.tilt + tilt + scrollTilt));
    const camera = multiply(perspective(FIELD_OF_VIEW, aspect, 0.1, 50), translation(0, 0, -distance));
    gl.viewport(0, 0, pixelsWide, pixelsHigh);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniformMatrix4fv(uniforms.u_mvp, false, multiply(camera, model));
    gl.uniformMatrix4fv(uniforms.u_model, false, model);
    gl.uniform3f(uniforms.u_eye, 0, 0, distance);
    gl.uniform1f(uniforms.u_time, time);
    gl.uniform1f(uniforms.u_wind, 1 + gust);
    gl.uniform1f(uniforms.u_progress, progress);
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
    if (!drawn) {
      drawn = true;
      settings.onFirstFrame();
    }
  }

  function tick(now: number) {
    frame = 0;
    step(now);
    draw();
    schedule();
  }

  function schedule() {
    if (stopped || !visible || document.hidden) return;
    if (still) draw();
    else if (!frame) frame = requestAnimationFrame(tick);
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    if (visible) draw();
  }

  // A moving mouse turns the scene toward it and stirs the breeze; touch scrolling leaves it alone.
  function onPointerMove(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    const rect = canvas.getBoundingClientRect();
    const next = {
      x: clamp((event.clientX - rect.left - rect.width / 2) / (window.innerWidth / 2), -1, 1),
      y: clamp((event.clientY - rect.top - rect.height / 2) / (window.innerHeight / 2), -1, 1),
    };
    gust = Math.min(gust + Math.hypot(next.x - pointer.x, next.y - pointer.y) * 1.5, 1.2);
    pointer = next;
  }

  function stop() {
    stopped = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibility.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("visibilitychange", schedule);
    canvas.removeEventListener("webglcontextlost", onLost);
  }

  function onLost(event: Event) {
    event.preventDefault();
    stop();
    settings.onLost();
  }

  const resizeObserver = new ResizeObserver(resize);
  // Wakes a little before the scene scrolls in, so its first frame is ready when it appears.
  const visibility = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    },
    { rootMargin: "25% 0px" },
  );
  resizeObserver.observe(canvas);
  visibility.observe(canvas);
  if (!still) window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", schedule);
  canvas.addEventListener("webglcontextlost", onLost);

  return () => {
    stop();
    buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    gl.deleteVertexArray(vao);
    gl.deleteProgram(program);
  };
}

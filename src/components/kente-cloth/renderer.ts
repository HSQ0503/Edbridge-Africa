import { multiply, perspective, rotationX, rotationY, translation } from "./matrix";
import { fragmentShader, vertexShader } from "./shaders";

export type ClothMode = "intro" | "scroll";

export type ClothSettings = {
  strips: number;
  length: number;
  mode: ClothMode;
  shift: number;
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

const STRIP_WIDTH = 0.42;
const STRIP_GAP = 0.025;
const SEGMENTS_ALONG = 140;
const SEGMENTS_ACROSS = 6;
const FIELD_OF_VIEW = (30 * Math.PI) / 180;
const INTRO_SECONDS = 2.6;
const RESTING_TURN = -0.42;
const RESTING_TILT = 0.06;
const POINTER_TURN = 0.24;
const POINTER_TILT = 0.12;
const SCROLL_TILT = 0.45;
const EASING = 0.06;
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

function createProgram(gl: WebGL2RenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
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
function buildStrips(strips: number) {
  const columns = SEGMENTS_ACROSS + 1;
  const rows = SEGMENTS_ALONG + 1;
  const perStrip = rows * columns;
  const uv = new Float32Array(strips * perStrip * 2);
  const stripIndex = new Float32Array(strips * perStrip);
  const indices = new Uint16Array(strips * SEGMENTS_ALONG * SEGMENTS_ACROSS * 6);
  let cursor = 0;
  for (let strip = 0; strip < strips; strip++) {
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const vertex = strip * perStrip + row * columns + column;
        uv.set([row / SEGMENTS_ALONG, column / SEGMENTS_ACROSS], vertex * 2);
        stripIndex[vertex] = strip;
        if (row === SEGMENTS_ALONG || column === SEGMENTS_ACROSS) continue;
        const below = vertex + columns;
        indices.set([vertex, below, below + 1, vertex, below + 1, vertex + 1], cursor);
        cursor += 6;
      }
    }
  }
  return { uv, stripIndex, indices };
}

function uploadStrips(gl: WebGL2RenderingContext, program: WebGLProgram, strips: number) {
  const { uv, stripIndex, indices } = buildStrips(strips);
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

// Far enough back that the whole cloth fits the canvas, whatever its shape.
function cameraDistance(aspect: number, clothWidth: number, clothLength: number) {
  const halfView = Math.tan(FIELD_OF_VIEW / 2);
  const fitLength = (clothLength * 1.08) / 2 / halfView;
  const fitWidth = (clothWidth * 1.1) / 2 / (halfView * aspect);
  return Math.max(fitLength, fitWidth) + 0.3;
}

export function startCloth(canvas: HTMLCanvasElement, settings: ClothSettings): (() => void) | null {
  const context = canvas.getContext("webgl2", { antialias: true, alpha: true, powerPreference: "low-power" });
  if (!context) return null;
  const gl: WebGL2RenderingContext = context;
  const program = createProgram(gl);
  if (!program) return null;

  const { vao, buffers, count } = uploadStrips(gl, program, settings.strips);
  const names = ["u_mvp", "u_model", "u_eye", "u_time", "u_wind", "u_unroll", "u_strips", "u_width", "u_gap", "u_length", "u_shift"];
  const uniforms = Object.fromEntries(
    [...names, ...Object.keys(DYES)].map((name) => [name, gl.getUniformLocation(program, name)]),
  );
  gl.useProgram(program);
  Object.entries(DYES).forEach(([name, rgb]) => gl.uniform3fv(uniforms[name], rgb));
  gl.uniform1f(uniforms.u_strips, settings.strips);
  gl.uniform1f(uniforms.u_width, STRIP_WIDTH);
  gl.uniform1f(uniforms.u_gap, STRIP_GAP);
  gl.uniform1f(uniforms.u_length, settings.length);
  gl.uniform1f(uniforms.u_shift, settings.shift);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  const clothWidth = settings.strips * (STRIP_WIDTH + STRIP_GAP) - STRIP_GAP;
  const still = settings.reducedMotion;
  let pointer = { x: 0, y: 0 };
  let turn = 0;
  let tilt = 0;
  let scrollTilt = 0;
  let gust = 0;
  let unroll = still ? 1 : 0;
  let time = STILL_TIME;
  let introStart = -1;
  let visible = false;
  let frame = 0;
  let drawn = false;
  let stopped = false;

  function step(now: number) {
    const seconds = now / 1000;
    if (introStart < 0) introStart = seconds;
    const rect = canvas.getBoundingClientRect();
    const viewport = window.innerHeight;
    if (settings.mode === "intro") {
      unroll = Math.min((seconds - introStart) / INTRO_SECONDS, 1);
    } else {
      // Scrubbed by scroll: unrolls as it rises from the bottom of the screen to its upper third.
      const target = clamp((viewport * 0.95 - rect.top) / (viewport * 0.6), 0, 1);
      unroll += (target - unroll) * EASING * 1.5;
    }
    scrollTilt = clamp(-rect.top / Math.max(rect.height, 1), 0, 1) * SCROLL_TILT;
    turn += (pointer.x * POINTER_TURN - turn) * EASING;
    tilt += (pointer.y * POINTER_TILT - tilt) * EASING;
    gust *= 0.97;
    time = seconds;
  }

  function draw() {
    const { width, height } = canvas;
    if (!width || !height) return;
    const aspect = width / height;
    const distance = cameraDistance(aspect, clothWidth, settings.length);
    const model = multiply(rotationY(RESTING_TURN + turn), rotationX(RESTING_TILT + tilt + scrollTilt));
    const camera = multiply(perspective(FIELD_OF_VIEW, aspect, 0.1, 50), translation(0, 0, -distance));
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniformMatrix4fv(uniforms.u_mvp, false, multiply(camera, model));
    gl.uniformMatrix4fv(uniforms.u_model, false, model);
    gl.uniform3f(uniforms.u_eye, 0, 0, distance);
    gl.uniform1f(uniforms.u_time, time);
    gl.uniform1f(uniforms.u_wind, 1 + gust);
    gl.uniform1f(uniforms.u_unroll, unroll);
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

  // A moving mouse turns the cloth toward it and stirs the breeze; touch scrolling leaves it alone.
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
  // Wakes a little before the cloth scrolls in, so its first frame is ready when it appears.
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

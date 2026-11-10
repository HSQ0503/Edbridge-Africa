// Every scene is made of kente strips: ribbons of square woven blocks. A scene only says where each point of
// each strip sits (its `ribbon` function); lighting, weave and pattern are shared, so every scene looks like
// the same cloth.
const vertexHeader = /* glsl */ `#version 300 es
precision highp float;

in vec2 a_uv;
in float a_strip;

uniform mat4 u_mvp;
uniform mat4 u_model;
uniform float u_time;
uniform float u_progress;
uniform float u_wind;
uniform float u_strips;
uniform float u_width;
uniform float u_gap;
uniform float u_length;
uniform float u_count;
uniform float u_variant;

out vec2 v_cloth;
out float v_strip;
out vec3 v_normal;
out vec3 v_world;

const float PI = 3.14159265;
const float ROLL_RADIUS = 0.1;
const float ROLL_TIGHTEN = 0.003;

float ease(float t) {
  t = clamp(t, 0.0, 1.0);
  return 1.0 - pow(1.0 - t, 3.0);
}

// Strips start building one after another; spread is the share of the build spent waiting for the last one.
float stripProgress(float strip, float spread) {
  float start = strip / max(u_strips - 1.0, 1.0) * spread;
  return ease((u_progress - start) / (1.0 - spread));
}

vec3 bezier(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
  float s = 1.0 - t;
  return s * s * s * a + 3.0 * s * s * t * b + 3.0 * s * t * t * c + t * t * t * d;
}

vec3 rotateAround(vec3 v, vec3 axis, float angle) {
  return v * cos(angle) + cross(axis, v) * sin(angle) + axis * dot(axis, v) * (1.0 - cos(angle));
}

// The length of a strip not yet laid out waits in a tight roll at its front, on the side facing up.
vec3 rollUp(vec3 tangent, vec3 up, float rolled) {
  if (rolled <= 0.0) return vec3(0.0);
  float turn = rolled / ROLL_RADIUS;
  float radius = max(ROLL_RADIUS - ROLL_TIGHTEN * turn, 0.03);
  return tangent * radius * sin(turn) + up * (ROLL_RADIUS - radius * cos(turn));
}
`;

const vertexMain = /* glsl */ `
void main() {
  float along = a_uv.x * u_length;
  float across = a_uv.y;
  vec3 p = ribbon(a_strip, along, across);
  vec3 normal = cross(ribbon(a_strip, along + 0.01, across) - p, ribbon(a_strip, along, across + 0.01) - p);
  normal = dot(normal, normal) > 1e-12 ? normalize(normal) : vec3(0.0, 0.0, 1.0);
  v_normal = mat3(u_model) * normal;
  v_world = (u_model * vec4(p, 1.0)).xyz;
  v_cloth = vec2(across, along / u_width + flow(a_strip));
  v_strip = a_strip;
  gl_Position = u_mvp * vec4(p, 1.0);
}
`;

export function buildVertexShader(sceneSource: string) {
  return vertexHeader + sceneSource + vertexMain;
}

export const fragmentShader = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_cloth;
in float v_strip;
in vec3 v_normal;
in vec3 v_world;

uniform vec3 u_green;
uniform vec3 u_gold;
uniform vec3 u_red;
uniform vec3 u_black;
uniform vec3 u_eye;
uniform float u_shift;

out vec4 outColor;

float edge(float threshold, float x, float blur) {
  return smoothstep(threshold - blur, threshold + blur, x);
}

float band(float low, float high, float x, float blur) {
  return edge(low, x, blur) - edge(high, x, blur);
}

// The same four blocks as the flat woven band (woven.tsx), so the 3D cloth and the SVG agree.
vec3 block(float kind, vec2 cell, vec2 blur) {
  float stripes = band(0.31, 0.44, cell.x, blur.x) + band(0.56, 0.69, cell.x, blur.x);
  float bar = band(0.44, 0.56, cell.y, blur.y);
  float diamond = 1.0 - edge(0.31, abs(cell.x - 0.5) + abs(cell.y - 0.5), blur.x + blur.y);
  vec3 greenBlock = mix(u_green, u_gold, stripes);
  vec3 goldBlock = mix(u_gold, u_black, bar);
  vec3 redBlock = mix(u_red, u_gold, diamond);
  vec3 blackBlock = mix(u_black, u_green, stripes);
  return kind < 0.5 ? greenBlock : kind < 1.5 ? goldBlock : kind < 2.5 ? redBlock : blackBlock;
}

void main() {
  vec2 blur = fwidth(v_cloth) * 0.75;
  vec2 cell = vec2(v_cloth.x, fract(v_cloth.y));
  float kind = mod(floor(v_cloth.y) + v_strip * 2.0 + u_shift, 4.0);
  vec3 base = block(kind, cell, blur);

  // Threads fade out before they are fine enough to shimmer.
  vec2 threads = v_cloth * 18.0;
  vec2 threadSize = fwidth(threads);
  float detail = 1.0 - smoothstep(0.35, 0.7, max(threadSize.x, threadSize.y));
  float weave = 0.5 + 0.25 * sin(threads.x * 6.2832) + 0.25 * sin(threads.y * 6.2832);
  base *= mix(1.0, 0.9 + 0.12 * weave, detail);

  float selvedge = 1.0 - edge(0.03, v_cloth.x, blur.x) + edge(0.97, v_cloth.x, blur.x);
  base *= 1.0 - 0.3 * selvedge;

  vec3 normal = normalize(v_normal);
  vec3 toEye = normalize(u_eye - v_world);
  float facing = dot(normal, toEye);
  normal *= sign(facing + 1e-4);
  vec3 light = normalize(vec3(-0.45, 0.55, 0.75));
  float diffuse = clamp((dot(normal, light) + 0.35) / 1.35, 0.0, 1.0);
  float sheen = pow(max(dot(normal, normalize(light + toEye)), 0.0), 28.0) * 0.2;
  float rim = pow(1.0 - abs(facing), 3.0) * 0.1;
  vec3 color = base * (0.38 + 0.72 * diffuse) + vec3(1.0, 0.94, 0.82) * (sheen + rim);
  color *= facing < 0.0 ? 0.6 : 1.0;
  outColor = vec4(color, 1.0);
}
`;

// Kente is woven in narrow strips that are sewn edge to edge; each strip here is a ribbon of square blocks
// that unrolls from a roll at its top, then moves in a slow breeze.
export const vertexShader = /* glsl */ `#version 300 es
precision highp float;

in vec2 a_uv;
in float a_strip;

uniform mat4 u_mvp;
uniform mat4 u_model;
uniform float u_time;
uniform float u_wind;
uniform float u_unroll;
uniform float u_strips;
uniform float u_width;
uniform float u_gap;
uniform float u_length;

out vec2 v_cloth;
out float v_strip;
out vec3 v_normal;
out vec3 v_world;

const float ROLL_RADIUS = 0.1;
const float ROLL_TIGHTEN = 0.003;

float stripProgress() {
  float start = (a_strip / max(u_strips - 1.0, 1.0)) * 0.4;
  float t = clamp((u_unroll - start) / 0.6, 0.0, 1.0);
  return 1.0 - pow(1.0 - t, 3.0);
}

float breeze(vec2 p) {
  return 0.09 * sin(p.y * 2.2 - u_time * 1.1 + p.x * 0.8)
       + 0.05 * sin(p.x * 2.6 + u_time * 0.7 + p.y * 1.2)
       + 0.03 * sin(p.y * 5.1 - u_time * 1.8 + a_strip * 1.7);
}

vec3 clothPoint(float along, float across, float unrolled) {
  float x = (a_strip - (u_strips - 1.0) * 0.5) * (u_width + u_gap) + (across - 0.5) * u_width;
  float flatAlong = min(along, unrolled);
  // The top edge hangs from a fixed bar, so the breeze grows down the cloth.
  float hang = smoothstep(0.0, 0.9, flatAlong);
  vec3 p = vec3(x, u_length * 0.5 - flatAlong, 0.0);
  p.z = 0.2 * cos(x * 0.85) + breeze(p.xy) * u_wind * hang;
  float rolled = along - unrolled;
  if (rolled > 0.0) {
    float turn = rolled / ROLL_RADIUS;
    float radius = max(ROLL_RADIUS - ROLL_TIGHTEN * turn, 0.03);
    p.y -= radius * sin(turn);
    p.z += ROLL_RADIUS - radius * cos(turn);
  }
  return p;
}

void main() {
  float along = a_uv.x * u_length;
  float across = a_uv.y;
  float unrolled = stripProgress() * u_length;
  vec3 p = clothPoint(along, across, unrolled);
  vec3 towardHem = clothPoint(along + 0.01, across, unrolled) - p;
  vec3 towardRight = clothPoint(along, across + 0.01, unrolled) - p;
  v_normal = mat3(u_model) * normalize(cross(towardHem, towardRight));
  v_world = (u_model * vec4(p, 1.0)).xyz;
  v_cloth = vec2(across, along / u_width);
  v_strip = a_strip;
  gl_Position = u_mvp * vec4(p, 1.0);
}
`;

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

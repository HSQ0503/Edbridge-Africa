// Strips that run sewn together as one cloth (the trunk), then part and fan out to loose, drifting ends.
// u_variant 1 is a fan: it grows from the trunk out to the ends, the pattern flowing outward (one gift, many uses).
// u_variant 0 converges: turned upside down, loose strands grow in from below and join into one cloth.
export const join = /* glsl */ `
const float TRUNK = 0.36;

float spreadOf(float strip) {
  return (strip - (u_strips - 1.0) * 0.5) / max((u_strips - 1.0) * 0.5, 1.0);
}

vec3 strandPoint(float strip, float t) {
  float laneX = (strip - (u_strips - 1.0) * 0.5) * (u_width + u_gap);
  vec3 trunkStart = vec3(laneX, -1.55, 0.0);
  vec3 trunkEnd = vec3(laneX, -0.55, 0.0);
  if (t <= TRUNK) return mix(trunkStart, trunkEnd, t / TRUNK);
  float b = (t - TRUNK) / (1.0 - TRUNK);
  float spread = spreadOf(strip);
  vec3 tip = vec3(spread * 1.9, 1.5 - abs(spread) * 0.35, sin(strip * 2.4 + 0.6) * 1.1);
  vec3 p = bezier(trunkEnd, trunkEnd + vec3(0.0, 0.75, 0.0), vec3(tip.x * 0.55, tip.y - 0.85, tip.z * 0.4), tip, b);
  return p + vec3(0.04, 0.05, 0.12) * sin(u_time * 1.3 + strip * 1.9 + b * 3.0) * b * b * u_wind;
}

vec3 ribbon(float strip, float along, float across) {
  bool fan = u_variant > 0.5;
  float grow = stripProgress(strip, 0.3);
  float t = along / u_length;
  float shown = fan ? min(t, grow) : max(t, 1.0 - grow);
  vec3 center = strandPoint(strip, shown);
  vec3 tangent = normalize(strandPoint(strip, shown + 0.003) - strandPoint(strip, shown - 0.003));
  vec3 side = normalize(vec3(1.0, 0.0, 0.0) - tangent * tangent.x);
  float twist = spreadOf(strip) * 0.6 * smoothstep(TRUNK, 1.0, shown);
  vec3 p = center + rotateAround(side, tangent, twist) * (across - 0.5) * u_width;
  return fan ? p : vec3(p.x, -p.y, p.z);
}

float flow(float strip) {
  return u_variant > 0.5 ? -u_time * 0.3 : u_time * 0.3;
}
`;

// Two strips spiralling upward and outward, the pattern climbing them: growth that keeps widening.
export const helix = /* glsl */ `
const float TURNS = 2.2;
const float INNER = 0.32;
const float OUTER = 1.15;

// Spends equal length on every block: the spiral widens, so its angle slows as it climbs.
float spiralParam(float share) {
  float widen = OUTER - INNER;
  return (-INNER + sqrt(INNER * INNER + 2.0 * widen * share * (INNER + widen * 0.5))) / widen;
}

vec3 helixPoint(float strip, float t) {
  float angle = t * TURNS * 2.0 * PI + strip * PI;
  float radius = mix(INNER, OUTER, t);
  return vec3(cos(angle) * radius, mix(-1.5, 1.5, t), sin(angle) * radius);
}

vec3 ribbon(float strip, float along, float across) {
  float t = spiralParam(min(along / u_length, stripProgress(strip, 0.15)));
  vec3 center = helixPoint(strip, t);
  vec3 tangent = normalize(helixPoint(strip, t + 0.002) - helixPoint(strip, t - 0.002));
  vec3 outward = normalize(vec3(center.x, 0.0, center.z));
  vec3 side = normalize(cross(outward, tangent));
  return center + side * (across - 0.5) * u_width;
}

float flow(float strip) {
  return -u_time * 0.25;
}
`;

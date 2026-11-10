// Stacked bands that roll around until they close into a ring: a circle of care around every child.
// The strip length is the ring's circumference, a whole number of pattern repeats, so the seam disappears.
export const ring = /* glsl */ `
vec3 ribbon(float strip, float along, float across) {
  float radius = u_length / (2.0 * PI);
  float built = stripProgress(strip, 0.25) * u_length;
  float angle = min(along, built) / radius;
  vec3 outward = vec3(cos(angle), 0.0, sin(angle));
  vec3 tangent = vec3(-sin(angle), 0.0, cos(angle));
  float y = (strip - (u_strips - 1.0) * 0.5) * (u_width + u_gap) + (across - 0.5) * u_width;
  y += 0.06 * sin(angle * 3.0 + u_time * 1.2 + strip * 0.7);
  return outward * radius + vec3(0.0, y, 0.0) + rollUp(tangent, outward, along - built);
}

float flow(float strip) {
  return 0.0;
}
`;

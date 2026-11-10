// A humpback footbridge: flat banks on either side and a smooth arch between. Its deck rolls out from both
// banks at once and meets in the middle: closing the gap. Strips 0..n/2-1 start on the left bank, the rest on
// the right; each pair forms one lane of the deck.
export const bridge = /* glsl */ `
const float RISE = 0.95;
const float HALF_SPAN = 1.4;

vec3 ribbon(float strip, float along, float across) {
  float lanes = u_strips * 0.5;
  float side = strip < lanes ? -1.0 : 1.0;
  float lane = strip < lanes ? strip : strip - lanes;
  float built = ease((u_progress - lane * 0.1) / (1.0 - (lanes - 1.0) * 0.1)) * u_length;
  float x = side * (u_length - min(along, built));
  // A squared cosine rises from the banks with no kink, so the deck leaves level ground smoothly.
  float onArch = step(abs(x), HALF_SPAN);
  float phase = 0.5 * PI * x / HALF_SPAN;
  float y = RISE * cos(phase) * cos(phase) * onArch - RISE * 0.4;
  float slope = -RISE * (0.5 * PI / HALF_SPAN) * sin(2.0 * phase) * onArch;
  y += 0.025 * sin(u_time * 1.1 + x * 1.4 + lane * 0.8) * onArch * cos(phase);
  float z = (lane - (lanes - 1.0) * 0.5) * (u_width + u_gap) + (across - 0.5) * u_width;
  vec3 tangent = normalize(vec3(-side, -side * slope, 0.0));
  vec3 up = vec3(-tangent.y, tangent.x, 0.0) * sign(tangent.x);
  return vec3(x, y, z) + rollUp(tangent, up, along - built);
}

float flow(float strip) {
  return 0.0;
}
`;

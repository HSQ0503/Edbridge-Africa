// Strips sewn edge to edge into one cloth that unrolls from a roll at its top, then moves in a slow breeze.
export const cloth = /* glsl */ `
float breeze(vec2 p, float strip) {
  return 0.09 * sin(p.y * 2.2 - u_time * 1.1 + p.x * 0.8)
       + 0.05 * sin(p.x * 2.6 + u_time * 0.7 + p.y * 1.2)
       + 0.03 * sin(p.y * 5.1 - u_time * 1.8 + strip * 1.7);
}

vec3 ribbon(float strip, float along, float across) {
  float x = (strip - (u_strips - 1.0) * 0.5) * (u_width + u_gap) + (across - 0.5) * u_width;
  float unrolled = stripProgress(strip, 0.4) * u_length;
  float flatAlong = min(along, unrolled);
  // The top edge hangs from a fixed bar, so the breeze grows down the cloth.
  float hang = smoothstep(0.0, 0.9, flatAlong);
  vec3 p = vec3(x, u_length * 0.5 - flatAlong, 0.0);
  p.z = 0.2 * cos(x * 0.85) + breeze(p.xy, strip) * u_wind * hang;
  return p + rollUp(vec3(0.0, -1.0, 0.0), vec3(0.0, 0.0, 1.0), along - unrolled);
}

float flow(float strip) {
  return 0.0;
}
`;

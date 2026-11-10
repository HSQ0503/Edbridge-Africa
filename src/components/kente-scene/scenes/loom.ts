// A loom: six warp strips hang still while weft strips are drawn through them one row at a time, over and
// under, until the cloth is whole. The first six strips are warps; the rest are wefts, bottom row first.
export const LOOM_WARPS = 6;

export const loom = /* glsl */ `
const float WARPS = ${LOOM_WARPS}.0;
const float ROW = 0.5;
const float LIFT = 0.055;

float pitch() {
  return u_width + 0.07;
}

float warpX(float warp) {
  return (warp - (WARPS - 1.0) * 0.5) * pitch();
}

float weftFront(float row) {
  float rows = u_strips - WARPS;
  float drawn = ease((u_progress - row * 0.15) / (1.0 - (rows - 1.0) * 0.15));
  return (drawn - 0.5) * u_length;
}

// The same slow swell runs through warp and weft, so they move as one cloth.
float swell(vec2 p) {
  return 0.05 * sin(p.x * 1.3 + u_time * 0.8) + 0.04 * sin(p.y * 1.7 - u_time * 1.1);
}

vec3 ribbon(float strip, float along, float across) {
  float rows = u_strips - WARPS;
  float firstRow = -(rows - 1.0) * 0.5 * ROW;
  if (strip < WARPS) {
    float x = warpX(strip) + (across - 0.5) * u_width;
    float y = u_length * 0.5 - along;
    float rowCoord = (y - firstRow) / ROW;
    float row = clamp(floor(rowCoord + 0.5), 0.0, rows - 1.0);
    float inWeave = step(-0.5, rowCoord) * step(rowCoord, rows - 0.5);
    float reached = smoothstep(warpX(strip) - pitch() * 0.5, warpX(strip) + pitch() * 0.5, weftFront(row));
    float z = -LIFT * cos(PI * (rowCoord + strip)) * inWeave * reached;
    return vec3(x, y, z + swell(vec2(x, y)));
  }
  float row = strip - WARPS;
  float x = min(along - u_length * 0.5, weftFront(row));
  float y = firstRow + row * ROW + (across - 0.5) * u_width;
  float z = LIFT * cos(PI * ((x - warpX(0.0)) / pitch() + row));
  return vec3(x, y, z + swell(vec2(x, y)));
}

float flow(float strip) {
  return 0.0;
}
`;

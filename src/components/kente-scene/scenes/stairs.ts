// A kente runner that rolls itself up a flight of stairs, one step at a time; u_count is the number of steps.
// The runner's side profile is measured by arc length, with rounded nosings so the roll turns smoothly.
export const STAIR = { riser: 0.42, tread: 0.66, lead: 0.6, landing: 0.5, fillet: 0.08 };

export function stairsLength(steps: number) {
  const { riser, tread, lead, landing, fillet } = STAIR;
  const arc = (Math.PI / 2) * fillet;
  const unit = riser + tread - 4 * fillet + 2 * arc;
  return lead - fillet + arc + (steps - 1) * unit + (riser - 2 * fillet) + arc + (tread - 2 * fillet) + landing;
}

export const stairs = /* glsl */ `
const float RISER = ${STAIR.riser};
const float TREAD = ${STAIR.tread};
const float LEAD = ${STAIR.lead};
const float LANDING = ${STAIR.landing};
const float FILLET = ${STAIR.fillet};

vec2 arcPoint(vec2 center, float angle, out vec2 dir, float turn) {
  dir = turn * vec2(-sin(angle), cos(angle));
  return center + FILLET * vec2(cos(angle), sin(angle));
}

vec2 stairProfile(float s, out vec2 dir) {
  float arc = 0.5 * PI * FILLET;
  float leadStraight = LEAD - FILLET;
  dir = vec2(1.0, 0.0);
  if (s < leadStraight) return vec2(s, 0.0);
  s -= leadStraight;
  if (s < arc) return arcPoint(vec2(leadStraight, FILLET), -0.5 * PI + s / FILLET, dir, 1.0);
  s -= arc;
  float riserStraight = RISER - 2.0 * FILLET;
  float treadStraight = TREAD - 2.0 * FILLET;
  float unit = riserStraight + treadStraight + 2.0 * arc;
  float flight = min(floor(s / unit), u_count - 1.0);
  float u = s - flight * unit;
  vec2 start = vec2(LEAD + flight * TREAD, FILLET + flight * RISER);
  if (u < riserStraight) {
    dir = vec2(0.0, 1.0);
    return start + vec2(0.0, u);
  }
  u -= riserStraight;
  vec2 nosing = start + vec2(0.0, riserStraight);
  if (u < arc) return arcPoint(nosing + vec2(FILLET, 0.0), PI - u / FILLET, dir, -1.0);
  u -= arc;
  vec2 treadStart = nosing + vec2(FILLET, FILLET);
  if (u < treadStraight || flight >= u_count - 1.0) return treadStart + vec2(u, 0.0);
  u -= treadStraight;
  return arcPoint(treadStart + vec2(treadStraight, FILLET), -0.5 * PI + u / FILLET, dir, 1.0);
}

vec3 ribbon(float strip, float along, float across) {
  float built = stripProgress(strip, 0.2) * u_length;
  vec2 dir;
  vec2 front = stairProfile(min(along, built), dir);
  vec2 middle = vec2(LEAD + u_count * TREAD + LANDING - FILLET, u_count * RISER) * 0.5;
  float z = (strip - (u_strips - 1.0) * 0.5) * (u_width + u_gap) + (across - 0.5) * u_width;
  vec3 p = vec3(front - middle, z);
  return p + rollUp(vec3(dir, 0.0), vec3(-dir.y, dir.x, 0.0), along - built);
}

float flow(float strip) {
  return 0.0;
}
`;

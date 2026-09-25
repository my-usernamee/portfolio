// Follow-the-gap planner with a racing-line look-ahead. Pure functions so the same code drives the
// browser playground and a headless test (scripts/sim-test.ts).
export type Pt = { x: number; y: number };
export type Obstacle = { x: number; y: number; r: number };
export type Car = { x: number; y: number; h: number; v: number; laps: number; crashes: number; lastIdx: number; crashedAt: number };

export const W = 900, H = 520;
export const HALF = 42, RAYS = 61, FOV = (200 * Math.PI) / 180, RANGE = 240;
export const OB_R = 9;
export const TUNE = { clear: 30, margin: 12, bubble: 2, lookAhead: 8, crossGain: 0, lineClear: 80, frontCone: 0.2, lineCone: (12 * Math.PI) / 180, forwardWindow: (80 * Math.PI) / 180, steerRate: 4.2, steerGain: 9, vMin: 30, vMax: 300, vGain: 4, hitDist: 7 };

const CONTROL: Pt[] = [
  { x: 110, y: 390 }, { x: 80, y: 260 }, { x: 130, y: 140 }, { x: 290, y: 90 }, { x: 460, y: 110 }, { x: 540, y: 190 },
  { x: 630, y: 130 }, { x: 790, y: 100 }, { x: 850, y: 210 }, { x: 800, y: 330 }, { x: 680, y: 380 }, { x: 600, y: 300 },
  { x: 520, y: 340 }, { x: 540, y: 430 }, { x: 400, y: 450 }, { x: 260, y: 430 },
];
function catmull(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const t2 = t * t, t3 = t2 * t;
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}
export type Track = ReturnType<typeof buildTrack>;
export function buildTrack() {
  const c: Pt[] = [];
  const n = CONTROL.length;
  for (let i = 0; i < n; i++) for (let s = 0; s < 16; s++) c.push(catmull(CONTROL[(i - 1 + n) % n], CONTROL[i], CONTROL[(i + 1) % n], CONTROL[(i + 2) % n], s / 16));
  const left: Pt[] = [], right: Pt[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[(i - 1 + c.length) % c.length], b = c[(i + 1) % c.length];
    const h = Math.atan2(b.y - a.y, b.x - a.x);
    left.push({ x: c[i].x - Math.sin(h) * HALF, y: c[i].y + Math.cos(h) * HALF });
    right.push({ x: c[i].x + Math.sin(h) * HALF, y: c[i].y - Math.cos(h) * HALF });
  }
  return { centre: c, left, right, startHeading: Math.atan2(c[1].y - c[0].y, c[1].x - c[0].x) };
}
export function raySeg(ox: number, oy: number, dx: number, dy: number, a: Pt, b: Pt) {
  const ex = b.x - a.x, ey = b.y - a.y, den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-9) return Infinity;
  const wx = a.x - ox, wy = a.y - oy, t = (wx * ey - wy * ex) / den, u = (wx * dy - wy * dx) / den;
  return t >= 0 && u >= 0 && u <= 1 ? t : Infinity;
}
export function rayCircle(ox: number, oy: number, dx: number, dy: number, c: Pt, r: number) {
  const fx = ox - c.x, fy = oy - c.y, b = 2 * (fx * dx + fy * dy), cc = fx * fx + fy * fy - r * r;
  const disc = b * b - 4 * cc;
  if (disc < 0) return Infinity;
  const t = (-b - Math.sqrt(disc)) / 2;
  return t >= 0 ? t : Infinity;
}
export function nearestIdx(track: Track, x: number, y: number) {
  let best = 0, bd = Infinity;
  for (let i = 0; i < track.centre.length; i++) {
    const d = (track.centre[i].x - x) ** 2 + (track.centre[i].y - y) ** 2;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}
export function newCar(track: Track): Car {
  return { x: track.centre[0].x, y: track.centre[0].y, h: track.startHeading, v: 0, laps: 0, crashes: 0, lastIdx: 0, crashedAt: 0 };
}
export function respawn(track: Track, car: Car, obs: Obstacle[], now: number) {
  const m = track.centre.length;
  let back = (nearestIdx(track, car.x, car.y) - 20 + m) % m;
  for (let tries = 0; tries < 12; tries++) {
    const p = track.centre[back];
    if (obs.every((o) => Math.hypot(o.x - p.x, o.y - p.y) > o.r + TUNE.margin + 20)) break;
    back = (back - 8 + m) % m;
  }
  car.x = track.centre[back].x; car.y = track.centre[back].y;
  const nx = track.centre[(back + 1) % m];
  car.h = Math.atan2(nx.y - car.y, nx.x - car.x);
  car.v = 0; car.crashes++; car.crashedAt = now; car.lastIdx = back;
}

export type Sense = { dists: number[]; plan: number[]; angs: number[]; minFront: number; ahead: Pt; lineRel: number; bestStart: number; bestLen: number; target: number; mode: "line" | "gap" };

// One planning step: sense, choose a heading. Doesn't move the car.
export function plan(track: Track, car: Car, obs: Obstacle[]): Sense {
  const m = track.centre.length;
  const dists: number[] = [], planD: number[] = [], angs: number[] = [];
  let minFront = Infinity;
  for (let r = 0; r < RAYS; r++) {
    const rel = -FOV / 2 + (FOV * r) / (RAYS - 1);
    const a = car.h + rel, dx = Math.cos(a), dy = Math.sin(a);
    let t = RANGE;
    for (let k = 0; k < m; k++) {
      const l1 = raySeg(car.x, car.y, dx, dy, track.left[k], track.left[(k + 1) % m]); if (l1 < t) t = l1;
      const r1 = raySeg(car.x, car.y, dx, dy, track.right[k], track.right[(k + 1) % m]); if (r1 < t) t = r1;
    }
    let tp = t;
    for (const o of obs) {
      const oc = rayCircle(car.x, car.y, dx, dy, o, o.r); if (oc < t) t = oc;
      const op = rayCircle(car.x, car.y, dx, dy, o, o.r + TUNE.margin); if (op < tp) tp = op;
    }
    dists.push(t); planD.push(Math.min(t, tp)); angs.push(rel);
    if (Math.abs(rel) < TUNE.frontCone && tp < minFront) minFront = tp;
  }
  const ni = nearestIdx(track, car.x, car.y);
  const ahead = track.centre[(ni + TUNE.lookAhead) % m];
  const tn = track.centre[(ni + 1) % m], tp = track.centre[(ni - 1 + m) % m];
  const th = Math.atan2(tn.y - tp.y, tn.x - tp.x);
  const cross = -Math.sin(th) * (car.x - track.centre[ni].x) + Math.cos(th) * (car.y - track.centre[ni].y);
  let lineRel = Math.atan2(ahead.y - car.y, ahead.x - car.x) - car.h;
  while (lineRel > Math.PI) lineRel -= 2 * Math.PI;
  while (lineRel < -Math.PI) lineRel += 2 * Math.PI;

  const minI = planD.indexOf(Math.min(...planD));
  const work = planD.map((d, i) => (Math.abs(angs[i] - lineRel) > TUNE.forwardWindow ? 0 : d));
  for (let k = -TUNE.bubble; k <= TUNE.bubble; k++) if (work[minI + k] !== undefined) work[minI + k] = 0;
  let bestStart = 0, bestLen = 0, s = -1;
  for (let i = 0; i <= RAYS; i++) {
    const clear = i < RAYS && work[i] > TUNE.clear;
    if (clear && s < 0) s = i;
    if ((!clear || i === RAYS) && s >= 0) { if (i - s > bestLen) { bestLen = i - s; bestStart = s; } s = -1; }
  }
  // Is the racing line itself clear? Look down a narrow cone toward the look-ahead point.
  let lineMin = Infinity;
  for (let i = 0; i < RAYS; i++) if (Math.abs(angs[i] - lineRel) <= TUNE.lineCone) lineMin = Math.min(lineMin, planD[i]);
  const lineClear = lineMin > TUNE.lineClear;

  let target: number, mode: "line" | "gap";
  if (lineClear) {
    // pure pursuit: chase the point on the line, plus a nudge back toward the centre
    target = lineRel - cross * TUNE.crossGain; mode = "line";
  } else if (bestLen > 0) {
    // follow the gap: deepest ray in the widest clear run, nudged toward its middle
    let deep = bestStart, dd = 0;
    for (let i = bestStart; i < bestStart + bestLen; i++) if (work[i] > dd) { dd = work[i]; deep = i; }
    target = 0.6 * angs[deep] + 0.4 * angs[bestStart + Math.floor(bestLen / 2)]; mode = "gap";
  } else {
    let deep = -1, dd = 0;
    for (let i = 0; i < RAYS; i++) if (work[i] > dd) { dd = work[i]; deep = i; }
    target = deep >= 0 ? angs[deep] : lineRel; mode = "gap";
  }
  target = Math.max(-1.3, Math.min(1.3, target));
  return { dists, plan: planD, angs, minFront, ahead, lineRel, bestStart, bestLen, target, mode };
}

// Move the car for dt seconds using a plan. Returns true if it crashed (and respawned).
export function step(track: Track, car: Car, obs: Obstacle[], sense: Sense, dt: number, now: number): boolean {
  const m = track.centre.length;
  const urgency = sense.minFront < 70 ? 1.8 : 1;
  const steerRate = TUNE.steerRate * urgency;
  car.h += Math.max(-steerRate * dt, Math.min(steerRate * dt, sense.target * TUNE.steerGain * urgency * dt));
  const vTarget = Math.max(TUNE.vMin, Math.min(TUNE.vMax, (sense.minFront - TUNE.clear) * TUNE.vGain)) * (1 - Math.min(0.65, Math.abs(sense.target) * 1.3));
  car.v += (vTarget - car.v) * Math.min(1, dt * (vTarget < car.v ? 5 : 1.8));
  car.x += Math.cos(car.h) * car.v * dt;
  car.y += Math.sin(car.h) * car.v * dt;
  let crashed = false;
  if (Math.min(...sense.dists) < TUNE.hitDist) { respawn(track, car, obs, now); crashed = true; }
  const idx = nearestIdx(track, car.x, car.y);
  if (car.lastIdx > m - 30 && idx < 30) car.laps++;
  car.lastIdx = idx;
  return crashed;
}

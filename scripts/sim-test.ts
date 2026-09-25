// Headless run of the playground planner: same track, an obstacle layout, N seconds of sim time.
//   npx tsx scripts/sim-test.ts
import { buildTrack, newCar, plan, step, OB_R, TUNE, type Obstacle } from "../src/lib/gapFollower";

const track = buildTrack();
const layouts: Record<string, Obstacle[]> = {
  default: [{ x: 700, y: 108, r: OB_R }, { x: 452, y: 447, r: OB_R }],
  browserTest: [{ x: 460, y: 132, r: OB_R }, { x: 452, y: 447, r: OB_R }, { x: 300, y: 95, r: OB_R }, { x: 830, y: 220, r: OB_R }, { x: 610, y: 330, r: OB_R }],
  centreLine: track.centre.filter((_, i) => i % 40 === 20).map((p) => ({ ...p, r: OB_R })),
  none: [],
};
const secs = Number(process.argv[2] ?? 60);
let allOk = true;
for (const [name, obs] of Object.entries(layouts)) {
  const car = newCar(track);
  const dt = 1 / 60;
  const crashAt: string[] = [];
  let minV = Infinity, stuck = 0;
  for (let t = 0; t < secs; t += dt) {
    const s = plan(track, car, obs);
    const before = { x: car.x, y: car.y };
    if (step(track, car, obs, s, dt, t * 1000)) crashAt.push(`${Math.round(before.x)},${Math.round(before.y)}@${t.toFixed(1)}s`);
    if (t > 3) { minV = Math.min(minV, car.v); if (car.v < 12) stuck += dt; }
  }
  const ok = car.crashes === 0 && car.laps >= secs / 25;
  allOk &&= ok;
  console.log(`${ok ? "ok  " : "FAIL"} ${name.padEnd(12)} laps ${car.laps}  crashes ${car.crashes}  minV ${minV.toFixed(0)}  slow ${stuck.toFixed(1)}s ${crashAt.slice(0, 4).join(" ")}`);
}
process.exit(allOk ? 0 : 1);

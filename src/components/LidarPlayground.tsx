"use client";

import { useEffect, useRef, useState } from "react";

// A small follow-the-gap demo: LiDAR rays fan out from a car on a track, the widest clear gap
// picks the heading, speed follows the clearance ahead. Drag the obstacles around and watch it re-plan.
// Opens on the "hari:lidar" event (the button on the DeepSpeed card).

type Pt = { x: number; y: number };
const W = 900, H = 520;
const CONTROL: Pt[] = [
  { x: 110, y: 390 }, { x: 80, y: 260 }, { x: 130, y: 140 }, { x: 290, y: 90 }, { x: 460, y: 110 }, { x: 540, y: 190 },
  { x: 630, y: 130 }, { x: 790, y: 100 }, { x: 850, y: 210 }, { x: 800, y: 330 }, { x: 680, y: 380 }, { x: 600, y: 300 },
  { x: 520, y: 340 }, { x: 540, y: 430 }, { x: 400, y: 450 }, { x: 260, y: 430 },
];
const HALF = 42, RAYS = 61, FOV = (200 * Math.PI) / 180, RANGE = 240, CLEAR = 30;

function catmull(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const t2 = t * t, t3 = t2 * t;
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}
function buildTrack() {
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
function raySeg(ox: number, oy: number, dx: number, dy: number, a: Pt, b: Pt) {
  const ex = b.x - a.x, ey = b.y - a.y, den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-9) return Infinity;
  const wx = a.x - ox, wy = a.y - oy, t = (wx * ey - wy * ex) / den, u = (wx * dy - wy * dx) / den;
  return t >= 0 && u >= 0 && u <= 1 ? t : Infinity;
}
function rayCircle(ox: number, oy: number, dx: number, dy: number, c: Pt, r: number) {
  const fx = ox - c.x, fy = oy - c.y, b = 2 * (fx * dx + fy * dy), cc = fx * fx + fy * fy - r * r;
  const disc = b * b - 4 * cc;
  if (disc < 0) return Infinity;
  const t = (-b - Math.sqrt(disc)) / 2;
  return t >= 0 ? t : Infinity;
}

type Obstacle = { x: number; y: number; r: number };

export default function LidarPlayground() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statRef = useRef<HTMLDivElement>(null);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const obsRef = useRef<Obstacle[]>([]);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    obsRef.current = obstacles;
  }, [obstacles]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const on = () => {
      // a couple of obstacles to start with, on the back straight and before the last corner
      setObstacles([{ x: 700, y: 108, r: 14 }, { x: 452, y: 447, r: 14 }]);
      setOpen(true);
    };
    window.addEventListener("hari:lidar", on);
    return () => window.removeEventListener("hari:lidar", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const track = buildTrack();
    const m = track.centre.length;
    const car = { x: track.centre[0].x, y: track.centre[0].y, h: track.startHeading, v: 0, laps: 0, crashes: 0, lastIdx: 0, crashedAt: 0 };
    let raf = 0, last = performance.now();
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform((canvas.clientWidth * dpr) / W, 0, 0, (canvas.clientHeight * dpr) / H, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const nearest = () => {
      let best = 0, bd = Infinity;
      for (let i = 0; i < m; i++) {
        const d = (track.centre[i].x - car.x) ** 2 + (track.centre[i].y - car.y) ** 2;
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    };
    const respawn = () => {
      const i = nearest();
      const back = (i - 20 + m) % m;
      car.x = track.centre[back].x; car.y = track.centre[back].y;
      const nx = track.centre[(back + 1) % m];
      car.h = Math.atan2(nx.y - car.y, nx.x - car.x);
      car.v = 0; car.crashes++; car.crashedAt = performance.now(); car.lastIdx = back;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const obs = obsRef.current;
      // ---- sense ----
      const dists: number[] = [], angs: number[] = [];
      let minFront = Infinity;
      for (let r = 0; r < RAYS; r++) {
        const rel = -FOV / 2 + (FOV * r) / (RAYS - 1);
        const a = car.h + rel, dx = Math.cos(a), dy = Math.sin(a);
        let t = RANGE;
        for (let k = 0; k < m; k++) {
          const l1 = raySeg(car.x, car.y, dx, dy, track.left[k], track.left[(k + 1) % m]); if (l1 < t) t = l1;
          const r1 = raySeg(car.x, car.y, dx, dy, track.right[k], track.right[(k + 1) % m]); if (r1 < t) t = r1;
        }
        for (const o of obs) { const oc = rayCircle(car.x, car.y, dx, dy, o, o.r); if (oc < t) t = oc; }
        dists.push(t); angs.push(rel);
        if (Math.abs(rel) < 0.35 && t < minFront) minFront = t;
      }
      // ---- plan: follow the gap. "bubble" the nearest hit, then pick the widest run of clear rays ----
      const minI = dists.indexOf(Math.min(...dists));
      const work = [...dists];
      for (let k = -3; k <= 3; k++) if (work[minI + k] !== undefined) work[minI + k] = 0;
      let bestStart = 0, bestLen = 0, s = -1;
      for (let i = 0; i <= RAYS; i++) {
        const clear = i < RAYS && work[i] > CLEAR + 30;
        if (clear && s < 0) s = i;
        if ((!clear || i === RAYS) && s >= 0) { if (i - s > bestLen) { bestLen = i - s; bestStart = s; } s = -1; }
      }
      let target = 0;
      if (bestLen > 0) {
        // aim at the deepest ray inside the widest gap, biased toward the gap's middle
        let deep = bestStart, dd = 0;
        for (let i = bestStart; i < bestStart + bestLen; i++) if (work[i] > dd) { dd = work[i]; deep = i; }
        target = 0.6 * angs[deep] + 0.4 * angs[bestStart + Math.floor(bestLen / 2)];
      }
      // ---- act ----
      if (!pausedRef.current) {
        const steerRate = 3.2;
        car.h += Math.max(-steerRate * dt, Math.min(steerRate * dt, target * 4 * dt));
        const vTarget = Math.max(40, Math.min(230, (minFront - CLEAR) * 1.6)) * (1 - Math.min(0.6, Math.abs(target) * 1.2));
        car.v += (vTarget - car.v) * Math.min(1, dt * (vTarget < car.v ? 5 : 1.8));
        car.x += Math.cos(car.h) * car.v * dt;
        car.y += Math.sin(car.h) * car.v * dt;
        if (Math.min(...dists) < 9) respawn();
        const idx = nearest();
        if (car.lastIdx > m - 30 && idx < 30) car.laps++;
        car.lastIdx = idx;
      }
      // ---- draw ----
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath(); track.centre.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
      ctx.lineWidth = HALF * 2; ctx.lineJoin = "round"; ctx.strokeStyle = "#ece8e0"; ctx.stroke();
      for (const side of [track.left, track.right]) { ctx.beginPath(); side.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(21,23,26,0.5)"; ctx.stroke(); }
      ctx.beginPath(); track.centre.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
      ctx.setLineDash([6, 12]); ctx.lineWidth = 1; ctx.strokeStyle = "rgba(21,23,26,0.18)"; ctx.stroke(); ctx.setLineDash([]);
      // start line
      const s0 = track.centre[0], h0 = track.startHeading;
      ctx.save(); ctx.translate(s0.x, s0.y); ctx.rotate(h0);
      for (let i = -4; i < 4; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? "#15171a" : "#f4f1eb"; ctx.fillRect(j * 5 - 5, i * 10, 5, 10); }
      ctx.restore();
      // rays
      ctx.beginPath();
      for (let r = 0; r < RAYS; r++) { const a = car.h + angs[r]; ctx.moveTo(car.x, car.y); ctx.lineTo(car.x + Math.cos(a) * dists[r], car.y + Math.sin(a) * dists[r]); }
      ctx.lineWidth = 0.7; ctx.strokeStyle = "rgba(0,210,190,0.35)"; ctx.stroke();
      ctx.fillStyle = "#00d2be";
      for (let r = 0; r < RAYS; r++) { const a = car.h + angs[r]; if (dists[r] < RANGE) { ctx.beginPath(); ctx.arc(car.x + Math.cos(a) * dists[r], car.y + Math.sin(a) * dists[r], 1.8, 0, Math.PI * 2); ctx.fill(); } }
      // chosen gap + heading
      if (bestLen > 0) {
        ctx.beginPath(); ctx.moveTo(car.x, car.y);
        for (let i = bestStart; i < bestStart + bestLen; i++) { const a = car.h + angs[i]; ctx.lineTo(car.x + Math.cos(a) * Math.min(dists[i], 90), car.y + Math.sin(a) * Math.min(dists[i], 90)); }
        ctx.closePath(); ctx.fillStyle = "rgba(0,210,190,0.14)"; ctx.fill();
        ctx.beginPath(); ctx.moveTo(car.x, car.y); ctx.lineTo(car.x + Math.cos(car.h + target) * 70, car.y + Math.sin(car.h + target) * 70);
        ctx.lineWidth = 2; ctx.strokeStyle = "#00958f"; ctx.stroke();
      }
      // obstacles
      for (const o of obs) { ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fillStyle = "#e8843a"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#15171a"; ctx.stroke(); }
      // car
      ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.h);
      const flash = now - car.crashedAt < 600 && Math.floor(now / 80) % 2 === 0;
      ctx.fillStyle = flash ? "#ff8f8f" : "#00d2be"; ctx.strokeStyle = "#15171a"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-13, -6, 26, 12, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#15171a"; ctx.fillRect(3, -4, 5, 8); ctx.fillRect(-14, -8, 3, 16); ctx.fillRect(10, -8, 2, 16);
      ctx.restore();
      if (statRef.current) statRef.current.textContent = `${Math.round(car.v / 10)} m/s · gap ${bestLen} of ${RAYS} rays · laps ${car.laps} · crashes ${car.crashes}`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [open]);

  // drag obstacles (and add one with a click on empty track)
  const dragIdx = useRef<number>(-1);
  const toWorld = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const onDown = (e: React.PointerEvent) => {
    const p = toWorld(e);
    const i = obstacles.findIndex((o) => Math.hypot(o.x - p.x, o.y - p.y) < o.r + 14);
    if (i >= 0) { dragIdx.current = i; canvasRef.current!.setPointerCapture(e.pointerId); }
    else if (obstacles.length < 8) setObstacles((o) => [...o, { x: p.x, y: p.y, r: 14 }]);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragIdx.current < 0) return;
    const p = toWorld(e);
    setObstacles((o) => o.map((ob, i) => (i === dragIdx.current ? { ...ob, x: p.x, y: p.y } : ob)));
  };
  const onUp = () => (dragIdx.current = -1);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="LiDAR playground" onClick={() => setOpen(false)}>
      <div className="card w-full max-w-4xl bg-paper" onClick={(e) => e.stopPropagation()}>
        <div className="card-head">
          <span>follow-the-gap · 61 rays · 200° fov</span>
          <span className="flex items-center gap-3">
            <button type="button" onClick={() => setPaused((p) => !p)} className="link-under text-teal">{paused ? "resume" : "pause"}</button>
            <button type="button" onClick={() => setObstacles([])} className="link-under">clear</button>
            <button type="button" onClick={() => setOpen(false)} className="link-under">close ✕</button>
          </span>
        </div>
        <div className="px-4 pt-4 sm:px-5">
          <h2 className="display text-2xl text-ink sm:text-3xl">
            this is roughly how the car <span className="hl">sees and steers</span>
          </h2>
          <p className="mt-1 text-sm text-graphite">
            Teal rays are the LiDAR. The shaded wedge is the widest clear gap, the dark line is where it decides to go. <span className="text-ink">Drag the orange obstacles</span>, or click the track to add one, and watch it re-plan.
          </p>
        </div>
        <div className="relative m-4 overflow-hidden border border-line-strong bg-paper sm:m-5" style={{ aspectRatio: `${W} / ${H}` }}>
          <canvas ref={canvasRef} className="block h-full w-full touch-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
          <div ref={statRef} className="pointer-events-none absolute left-3 top-2 font-mono text-[10px] tracking-[0.14em] text-graphite" />
        </div>
        <p className="px-4 pb-4 font-mono text-[10px] text-dim sm:px-5">the real car runs this idea plus a spline planner on top, at 12 m/s, on a 4 kg chassis. this one runs in your browser.</p>
      </div>
    </div>
  );
}

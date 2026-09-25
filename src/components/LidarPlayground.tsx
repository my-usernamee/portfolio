"use client";

import { useEffect, useRef, useState } from "react";

// A small follow-the-gap demo: LiDAR rays fan out from a car on a track, the widest clear gap
// picks the heading, speed follows the clearance ahead. Drag the obstacles around and watch it re-plan.
// Opens on the "hari:lidar" event (the button on the DeepSpeed card).

import { buildTrack, newCar, plan, step, HALF, RAYS, RANGE, OB_R, W, H, type Obstacle } from "@/lib/gapFollower";



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
      setObstacles([{ x: 700, y: 108, r: OB_R }, { x: 452, y: 447, r: OB_R }]);
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
    const car = newCar(track);
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

    const frame = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const obs = obsRef.current;
      const sense = plan(track, car, obs);
      const { dists, angs, bestStart, bestLen, target, ahead, mode } = sense;
      if (!pausedRef.current) step(track, car, obs, sense, dt, now);
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
      // look-ahead point on the line
      ctx.beginPath(); ctx.arc(ahead.x, ahead.y, 3.5, 0, Math.PI * 2); ctx.fillStyle = "#00958f"; ctx.fill();
      ctx.beginPath(); ctx.setLineDash([3, 4]); ctx.moveTo(car.x, car.y); ctx.lineTo(ahead.x, ahead.y); ctx.lineWidth = 1; ctx.strokeStyle = "rgba(0,149,143,0.5)"; ctx.stroke(); ctx.setLineDash([]);
      // obstacles
      for (const o of obs) { ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fillStyle = "#e8843a"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#15171a"; ctx.stroke(); }
      // car
      ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.h);
      const flash = now - car.crashedAt < 600 && Math.floor(now / 80) % 2 === 0;
      ctx.fillStyle = flash ? "#ff8f8f" : "#00d2be"; ctx.strokeStyle = "#15171a"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-13, -6, 26, 12, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#15171a"; ctx.fillRect(3, -4, 5, 8); ctx.fillRect(-14, -8, 3, 16); ctx.fillRect(10, -8, 2, 16);
      ctx.restore();
      if (statRef.current) statRef.current.textContent = `${mode === "line" ? "pure pursuit" : "follow the gap"} · ${Math.round(car.v / 10)} m/s · gap ${bestLen} of ${RAYS} rays · laps ${car.laps} · crashes ${car.crashes}`;
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
    else if (obstacles.length < 8) setObstacles((o) => [...o, { x: p.x, y: p.y, r: OB_R }]);
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
            Teal rays are the LiDAR. The shaded wedge is the widest clear gap ahead, the dotted line is the racing line it follows, the solid line is where it decides to go. <span className="text-ink">Drag the orange obstacles</span>, or click the track to add one, and watch it re-plan.
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

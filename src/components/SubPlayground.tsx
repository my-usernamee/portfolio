"use client";

import { useEffect, useRef, useState } from "react";
import { missionAim, missionStep, newMission, RAYS, TANK, type Obstacle, type SubMission } from "@/lib/gapFollower";

// The Mecatron twin of the LiDAR demo: a tank, a sub with sonar, a gate to pass, a buoy to touch, then home.
// Same planner underneath. Drag the debris (or the buoy) and watch it re-plan. Opens on "hari:sub".
const W = TANK.w, H = TANK.h;
const STAGE = ["through the gate", "touch the buoy", "back to base", "mission complete"];

export default function SubPlayground() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statRef = useRef<HTMLDivElement>(null);
  const [debris, setDebris] = useState<Obstacle[]>([]);
  const debrisRef = useRef<Obstacle[]>([]);
  const msRef = useRef<SubMission>(newMission());
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => { debrisRef.current = debris; }, [debris]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const on = () => {
      setDebris([{ x: 560, y: 300, r: 10 }, { x: 250, y: 200, r: 10 }]);
      msRef.current = newMission();
      setOpen(true);
    };
    window.addEventListener("hari:sub", on);
    return () => window.removeEventListener("hari:sub", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, last = performance.now();
    const pings: { x: number; y: number; t: number }[] = [];
    const bubbles: { x: number; y: number; t: number; r: number }[] = [];
    let lastPing = 0, lastBubble = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform((canvas.clientWidth * dpr) / W, 0, 0, (canvas.clientHeight * dpr) / H, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    const frame = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      const ms = msRef.current;
      const sense = pausedRef.current ? missionStep({ ...ms, stage: 3, done: now } as SubMission, debrisRef.current, 0, now) : missionStep(ms, debrisRef.current, dt, now);
      const { sub, gate, buoy, home } = ms;
      const aim = missionAim(ms);
      // sonar: a ping every 0.9s leaves an expanding ring; echoes are where rays hit
      if (now - lastPing > 900) { pings.push({ x: sub.x, y: sub.y, t: now }); lastPing = now; }
      while (pings.length && now - pings[0].t > 1400) pings.shift();
      if (now - lastBubble > 140 && sub.v > 20) { bubbles.push({ x: sub.x - Math.cos(sub.h) * 16, y: sub.y - Math.sin(sub.h) * 16, t: now, r: 1.5 + Math.random() * 2 }); lastBubble = now; }
      while (bubbles.length && now - bubbles[0].t > 1800) bubbles.shift();

      // ---- draw ----
      ctx.clearRect(0, 0, W, H);
      // water
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#d6e9e6"); g.addColorStop(1, "#b9d6d6");
      ctx.fillStyle = g; ctx.fillRect(TANK.pad, TANK.pad, W - 2 * TANK.pad, H - 2 * TANK.pad);
      // caustics: faint wavy lines
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1;
      for (let y = TANK.pad + 30; y < H - TANK.pad; y += 46) {
        ctx.beginPath();
        for (let x = TANK.pad; x <= W - TANK.pad; x += 12) { const yy = y + Math.sin(x / 38 + now / 900 + y) * 4; if (x === TANK.pad) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
        ctx.stroke();
      }
      // tank wall
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(21,23,26,0.6)"; ctx.strokeRect(TANK.pad, TANK.pad, W - 2 * TANK.pad, H - 2 * TANK.pad);
      // home pad
      ctx.beginPath(); ctx.arc(home.x, home.y, 22, 0, Math.PI * 2); ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(21,23,26,0.5)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(21,23,26,0.5)"; ctx.font = "10px monospace"; ctx.textAlign = "center"; ctx.fillText("BASE", home.x, home.y + 36);
      // gate
      for (const sy of [-1, 1]) { ctx.beginPath(); ctx.arc(gate.x, gate.y + sy * gate.half, gate.postR, 0, Math.PI * 2); ctx.fillStyle = ms.stage === 0 ? "#e8843a" : "#8a7f72"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#15171a"; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(gate.x, gate.y - gate.half + gate.postR); ctx.lineTo(gate.x, gate.y + gate.half - gate.postR); ctx.setLineDash([3, 5]); ctx.strokeStyle = ms.stage === 0 ? "#e8843a" : "rgba(21,23,26,0.3)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(21,23,26,0.5)"; ctx.fillText("GATE", gate.x, gate.y - gate.half - 14);
      // buoy (with a mooring line)
      ctx.beginPath(); ctx.moveTo(buoy.x, buoy.y); ctx.lineTo(buoy.x + 6, H - TANK.pad); ctx.strokeStyle = "rgba(21,23,26,0.25)"; ctx.lineWidth = 1; ctx.stroke();
      const touched = ms.stage >= 2;
      ctx.beginPath(); ctx.arc(buoy.x, buoy.y, buoy.r, 0, Math.PI * 2); ctx.fillStyle = touched ? "#00d2be" : "#f2c94c"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#15171a"; ctx.stroke();
      ctx.fillText("BUOY", buoy.x, buoy.y - buoy.r - 8);
      // debris
      for (const o of debrisRef.current) { ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fillStyle = "#8a7f72"; ctx.fill(); ctx.strokeStyle = "#15171a"; ctx.lineWidth = 1.5; ctx.stroke(); }
      // sonar rings
      for (const p of pings) { const a = (now - p.t) / 1400; ctx.beginPath(); ctx.arc(p.x, p.y, 10 + a * 150, 0, Math.PI * 2); ctx.strokeStyle = `rgba(0,149,143,${0.5 * (1 - a)})`; ctx.lineWidth = 1.2; ctx.stroke(); }
      // echoes: where the forward rays hit, drawn as dots (no lines, sonar returns)
      ctx.fillStyle = "#00958f";
      for (let r = 0; r < RAYS; r++) { const a = sub.h + sense.angs[r]; if (sense.dists[r] < 200) { ctx.beginPath(); ctx.arc(sub.x + Math.cos(a) * sense.dists[r], sub.y + Math.sin(a) * sense.dists[r], 1.6, 0, Math.PI * 2); ctx.fill(); } }
      // chosen heading + aim
      ctx.beginPath(); ctx.setLineDash([3, 4]); ctx.moveTo(sub.x, sub.y); ctx.lineTo(aim.x, aim.y); ctx.strokeStyle = "rgba(0,149,143,0.5)"; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(sub.x, sub.y); ctx.lineTo(sub.x + Math.cos(sub.h + sense.target) * 50, sub.y + Math.sin(sub.h + sense.target) * 50); ctx.strokeStyle = "#00958f"; ctx.lineWidth = 2; ctx.stroke();
      // bubbles
      for (const b of bubbles) { const a = (now - b.t) / 1800; ctx.beginPath(); ctx.arc(b.x, b.y - a * 40, b.r, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - a)})`; ctx.lineWidth = 1; ctx.stroke(); }
      // sub
      ctx.save(); ctx.translate(sub.x, sub.y); ctx.rotate(sub.h);
      ctx.fillStyle = "#3b6fd6"; ctx.strokeStyle = "#15171a"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#2f5bb5"; ctx.beginPath(); ctx.roundRect(-6, -9, 10, 4, 1); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#00d2be"; ctx.beginPath(); ctx.arc(9, 0, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#15171a"; ctx.fillRect(-19, -3, 4, 6);
      ctx.restore();
      // mission banner
      if (ms.stage === 3) { ctx.fillStyle = "rgba(21,23,26,0.75)"; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center"; ctx.fillText(`mission complete · ${ms.t.toFixed(1)}s`, W / 2, H / 2); }
      if (statRef.current) statRef.current.textContent = `${sense.mode === "line" ? "waypoint" : "avoiding"} · task ${Math.min(ms.stage + 1, 3)}/3 ${STAGE[ms.stage]} · ${ms.t.toFixed(1)}s${ms.best ? ` · best ${ms.best.toFixed(1)}s` : ""} · runs ${ms.runs}`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [open]);

  // drag debris or the buoy; click empty water to drop debris
  const drag = useRef<{ kind: "debris"; i: number } | { kind: "buoy" } | null>(null);
  const toWorld = (e: React.PointerEvent) => { const r = canvasRef.current!.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
  const onDown = (e: React.PointerEvent) => {
    const p = toWorld(e);
    const ms = msRef.current;
    if (Math.hypot(ms.buoy.x - p.x, ms.buoy.y - p.y) < ms.buoy.r + 14) { drag.current = { kind: "buoy" }; canvasRef.current!.setPointerCapture(e.pointerId); return; }
    const i = debris.findIndex((o) => Math.hypot(o.x - p.x, o.y - p.y) < o.r + 14);
    if (i >= 0) { drag.current = { kind: "debris", i }; canvasRef.current!.setPointerCapture(e.pointerId); }
    else if (debris.length < 8 && p.x > TANK.pad + 20 && p.x < W - TANK.pad - 20 && p.y > TANK.pad + 20 && p.y < H - TANK.pad - 20) setDebris((o) => [...o, { x: p.x, y: p.y, r: 10 }]);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const p = { x: Math.min(W - TANK.pad - 20, Math.max(TANK.pad + 20, toWorld(e).x)), y: Math.min(H - TANK.pad - 20, Math.max(TANK.pad + 20, toWorld(e).y)) };
    if (drag.current.kind === "buoy") { msRef.current.buoy.x = p.x; msRef.current.buoy.y = p.y; }
    else { const i = drag.current.i; setDebris((o) => o.map((ob, k) => (k === i ? { ...ob, x: p.x, y: p.y } : ob))); }
  };
  const onUp = () => (drag.current = null);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Sub playground" onClick={() => setOpen(false)}>
      <div className="card w-full max-w-4xl bg-paper" onClick={(e) => e.stopPropagation()}>
        <div className="card-head">
          <span>sonar · gate → buoy → base</span>
          <span className="flex items-center gap-3">
            <button type="button" onClick={() => setPaused((p) => !p)} className="link-under text-teal">{paused ? "resume" : "pause"}</button>
            <button type="button" onClick={() => { setDebris([]); msRef.current = newMission(); }} className="link-under">reset</button>
            <button type="button" onClick={() => setOpen(false)} className="link-under">close ✕</button>
          </span>
        </div>
        <div className="px-4 pt-4 sm:px-5">
          <h2 className="display text-2xl text-ink sm:text-3xl">
            this is roughly how the sub <span className="hl">finds its way</span>
          </h2>
          <p className="mt-1 text-sm text-graphite">
            Rings are sonar pings, dots are the echoes. It has three tasks, like a competition run: through the gate, touch the buoy, back to base. <span className="text-ink">Drag the buoy or the debris</span>, or click the water to drop more, and watch it re-plan.
          </p>
        </div>
        <div className="relative m-4 overflow-hidden border border-line-strong bg-paper sm:m-5" style={{ aspectRatio: `${W} / ${H}` }}>
          <canvas ref={canvasRef} className="block h-full w-full touch-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
          <div ref={statRef} className="pointer-events-none absolute left-3 top-2 font-mono text-[10px] tracking-[0.14em] text-graphite" />
        </div>
        <p className="px-4 pb-4 font-mono text-[10px] text-dim sm:px-5">the real one does this with cameras and sonar in a pool, and the gates don&apos;t hold still either. this one runs in your browser.</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export function CarSvg({ className = "" }: { className?: string }) {
  // top-down F1 car, nose pointing down the page
  return (
    <svg viewBox="0 0 44 84" width="44" height="84" className={className} aria-hidden="true">
      <g stroke="var(--ink)" strokeWidth="1.5" fill="var(--paper)" strokeLinejoin="round">
        <rect x="6" y="6" width="32" height="5" rx="1" />
        <rect x="0" y="10" width="8" height="16" rx="2" fill="var(--ink)" />
        <rect x="36" y="10" width="8" height="16" rx="2" fill="var(--ink)" />
        <rect x="8" y="30" width="7" height="22" rx="3" />
        <rect x="29" y="30" width="7" height="22" rx="3" />
        <rect x="15" y="14" width="14" height="44" rx="6" />
        <path d="M18 58 L26 58 L25 70 L19 70 Z" />
        <rect x="0" y="56" width="7" height="14" rx="2" fill="var(--ink)" />
        <rect x="37" y="56" width="7" height="14" rx="2" fill="var(--ink)" />
        <rect x="4" y="70" width="36" height="6" rx="1" />
        <ellipse cx="22" cy="38" rx="4" ry="6" fill="var(--teal-bright)" />
        <path d="M16 33 A6 6 0 0 1 28 33" fill="none" />
      </g>
      <text x="22" y="52" textAnchor="middle" fontSize="6" fontFamily="var(--font-plex-mono)" fill="var(--ink)">63</text>
    </svg>
  );
}

export function SubSvg({ className = "" }: { className?: string }) {
  // top-down submarine, nose pointing down the page, same footprint as the car
  return (
    <svg viewBox="0 0 44 84" width="44" height="84" className={className} aria-hidden="true">
      <g stroke="var(--ink)" strokeWidth="1.5" fill="#3b6fd6" strokeLinejoin="round">
        <path d="M22 4 C34 4 36 22 36 40 V62 C36 72 30 78 22 78 C14 78 8 72 8 62 V40 C8 22 10 4 22 4 Z" />
        <rect x="16" y="26" width="12" height="18" rx="4" fill="#2f5bb5" />
        <circle cx="22" cy="20" r="3" fill="var(--teal-bright)" />
        <path d="M2 50 L8 46 V58 L2 54 Z M42 50 L36 46 V58 L42 54 Z" fill="#2f5bb5" />
        <path d="M18 78 L26 78 L24 84 L20 84 Z" fill="var(--ink)" />
        <path d="M22 26 V12" />
      </g>
    </svg>
  );
}

const ROAD_W = 96; // vertical road column width (desktop)
const ROAD_H = 44; // horizontal road strip height (mobile)
const AMP_V = 15;
const AMP_H = 6;
const PERIOD_V = 300;
const PERIOD_H = 220;

function progress() {
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

// Binary-search the path length whose point has coordinate `target` on axis `axis`. Paths are monotonic along that axis.
function lengthAt(path: SVGPathElement, len: number, axis: "x" | "y", target: number) {
  let lo = 0;
  let hi = len;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid)[axis] < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function place(car: HTMLDivElement, path: SVGPathElement, len: number, s: number, scale: number) {
  const a = path.getPointAtLength(Math.max(0, s - 3));
  const b = path.getPointAtLength(Math.min(len, s + 3));
  const pt = path.getPointAtLength(s);
  const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI - 90;
  car.style.transform = `translate(${pt.x}px, ${pt.y}px) rotate(${deg}deg) scale(${scale}) translate(-50%, -50%)`;
}

// Desktop: a wiggly road down the left edge. Mobile: a wiggly road along the bottom edge.
// The car follows whichever is visible as the page scrolls.
export default function ScrollCar() {
  const vPath = useRef<SVGPathElement>(null);
  const vSvg = useRef<SVGSVGElement>(null);
  const vCar = useRef<HTMLDivElement>(null);
  const hPath = useRef<SVGPathElement>(null);
  const hSvg = useRef<SVGSVGElement>(null);
  const hCar = useRef<HTMLDivElement>(null);

  const hudRef = useRef<HTMLDivElement>(null);
  const [racing, setRacing] = useState(false);
  const [diving, setDiving] = useState(false);
  useEffect(() => {
    const t = () => setDiving(document.documentElement.classList.contains("dive"));
    const mo = new MutationObserver(t);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  const racingRef = useRef(false);

  useEffect(() => {
    let raf = 0;
    let vLen = 0;
    let hLen = 0;
    const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

    // ---- race mode: arrow keys drive the car up and down the road, a lap is down and back ----
    const race = { p: 0, v: 0, up: false, down: false, t0: 0, reachedBottom: false, best: 0, last: 0, lastFrame: 0, loop: 0, note: "", noteUntil: 0 };
    try {
      race.best = Number(localStorage.getItem("hari-best-lap") ?? 0) || 0;
    } catch {
      /* ignore */
    }
    const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}.${String(Math.floor((ms % 1000) / 10)).padStart(2, "0")}`;
    const hud = (msg?: string) => {
      const el = hudRef.current;
      if (!el) return;
      const now = race.t0 ? performance.now() - race.t0 : 0;
      el.querySelector("[data-lap]")!.textContent = race.t0 ? fmt(now) : "0:00.00";
      el.querySelector("[data-best]")!.textContent = race.best ? fmt(race.best) : "--:--.--";
      if (msg) { race.note = msg; race.noteUntil = performance.now() + 4000; }
      const note = performance.now() < race.noteUntil ? race.note : "";
      el.querySelector("[data-msg]")!.textContent = note || (race.t0 ? (race.reachedBottom ? "now back to the top" : "to the bottom…") : "↑ ↓ to drive · q to quit");
    };
    const tick = (now: number) => {
      if (!racingRef.current) return;
      const dt = Math.min(0.05, (now - (race.lastFrame || now)) / 1000);
      race.lastFrame = now;
      const ACC = 1.6, MAX = 0.9, DRAG = 2.4;
      if (race.down) race.v += ACC * dt;
      if (race.up) race.v -= ACC * dt;
      if (!race.down && !race.up) race.v -= race.v * DRAG * dt;
      race.v = Math.max(-MAX, Math.min(MAX, race.v));
      let p = race.p + race.v * dt;
      if (p <= 0) { p = 0; if (race.v < 0) race.v = 0; }
      if (p >= 1) { p = 1; if (race.v > 0) race.v = 0; }
      if (!race.t0 && p > 0.01) race.t0 = now;
      if (race.t0 && p >= 0.985) race.reachedBottom = true;
      let msg: string | undefined;
      if (race.t0 && race.reachedBottom && p <= 0.015) {
        race.last = now - race.t0;
        const pb = !race.best || race.last < race.best;
        if (pb) {
          race.best = race.last;
          try { localStorage.setItem("hari-best-lap", String(Math.round(race.best))); } catch { /* ignore */ }
        }
        msg = `${fmt(race.last)}${pb ? " · new best!" : ""} · again?`;
        race.t0 = 0;
        race.reachedBottom = false;
        race.v = 0;
      }
      race.p = p;
      if (vCar.current && vPath.current && vLen) {
        const y = window.innerHeight * (0.12 + 0.76 * p);
        place(vCar.current, vPath.current, vLen, lengthAt(vPath.current, vLen, "y", y), 1 + Math.abs(race.v) * 0.08);
      }
      hud(msg);
      race.loop = requestAnimationFrame(tick);
    };
    const startRace = () => {
      if (!isDesktop() || racingRef.current) return;
      racingRef.current = true;
      setRacing(true);
      race.p = 0; race.v = 0; race.t0 = 0; race.reachedBottom = false; race.lastFrame = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
      hud();
      race.loop = requestAnimationFrame(tick);
    };
    const stopRace = () => {
      if (!racingRef.current) return;
      racingRef.current = false;
      setRacing(false);
      cancelAnimationFrame(race.loop);
      race.up = race.down = false;
      update();
    };
    const toggleRace = () => (racingRef.current ? stopRace() : startRace());
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let konami: string[] = [];
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable;
      if (!typing) {
        konami = [...konami, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
        if (KONAMI.every((k, i) => konami[i] === k)) { konami = []; startRace(); }
      }
      if (!racingRef.current) return;
      if (e.key === "ArrowDown") { race.down = true; e.preventDefault(); }
      else if (e.key === "ArrowUp") { race.up = true; e.preventDefault(); }
      else if (e.key === "q" || e.key === "Q" || e.key === "`" || e.key === "Escape") { e.preventDefault(); stopRace(); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") race.down = false;
      if (e.key === "ArrowUp") race.up = false;
    };
    const onRaceEvent = () => toggleRace();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("hari:race", onRaceEvent);

    const build = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      if (vSvg.current && vPath.current) {
        vSvg.current.setAttribute("viewBox", `0 0 ${ROAD_W} ${vh}`);
        vSvg.current.setAttribute("height", `${vh}`);
        const cx = 44;
        const half = PERIOD_V / 2;
        let d = `M ${cx} -60`;
        let y = -60;
        let sign = 1;
        while (y < vh + 60) {
          const y2 = y + half;
          d += ` C ${cx + sign * AMP_V * 1.6} ${y + half * 0.4}, ${cx + sign * AMP_V * 1.6} ${y2 - half * 0.4}, ${cx} ${y2}`;
          y = y2;
          sign = -sign;
        }
        vPath.current.setAttribute("d", d);
        vLen = vPath.current.getTotalLength();
      }
      if (hSvg.current && hPath.current) {
        hSvg.current.setAttribute("viewBox", `0 0 ${vw} ${ROAD_H}`);
        hSvg.current.setAttribute("width", `${vw}`);
        const cy = ROAD_H / 2 + 4;
        const half = PERIOD_H / 2;
        let d = `M -60 ${cy}`;
        let x = -60;
        let sign = 1;
        while (x < vw + 60) {
          const x2 = x + half;
          d += ` C ${x + half * 0.4} ${cy + sign * AMP_H * 1.6}, ${x2 - half * 0.4} ${cy + sign * AMP_H * 1.6}, ${x2} ${cy}`;
          x = x2;
          sign = -sign;
        }
        hPath.current.setAttribute("d", d);
        hLen = hPath.current.getTotalLength();
      }
    };

    const update = () => {
      raf = 0;
      if (racingRef.current) return;
      const p = progress();
      if (isDesktop()) {
        if (vCar.current && vPath.current && vLen) {
          const y = window.innerHeight * (0.12 + 0.76 * p);
          place(vCar.current, vPath.current, vLen, lengthAt(vPath.current, vLen, "y", y), 1);
        }
      } else if (hCar.current && hPath.current && hLen) {
        const x = window.innerWidth * (0.08 + 0.84 * p);
        place(hCar.current, hPath.current, hLen, lengthAt(hPath.current, hLen, "x", x), 0.62);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      build();
      onScroll();
    };
    build();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("hari:race", onRaceEvent);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(race.loop);
    };
  }, []);

  return (
    <>
      {/* desktop: vertical road */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden lg:block" style={{ width: ROAD_W }}>
        <svg ref={vSvg} width={ROAD_W} className="absolute inset-0">
          <defs>
            <path ref={vPath} id="road-v" />
          </defs>
          <use href="#road-v" className="road-edge" />
          <use href="#road-v" className="road-surface" />
          <use href="#road-v" className="road-centre" />
        </svg>
        <div ref={vCar} className="car">
          {diving ? <SubSvg /> : <CarSvg />}
        </div>
      </div>
      {/* race mode HUD */}
      <div ref={hudRef} className={`race-hud ${racing ? "is-on" : ""}`} aria-live="polite" aria-hidden={!racing}>
        <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-teal-bright">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-bright" /> RACE MODE
        </div>
        <div className="mt-1 flex gap-4">
          <span>
            <span className="text-paper/50">LAP </span>
            <span data-lap className="text-paper">0:00.00</span>
          </span>
          <span>
            <span className="text-paper/50">BEST </span>
            <span data-best className="text-teal-bright">--:--.--</span>
          </span>
        </div>
        <div data-msg className="mt-1 text-[10px] text-paper/60">↑ ↓ to drive · q to quit</div>
      </div>
      {/* mobile: horizontal road along the bottom */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden" style={{ height: ROAD_H }}>
        <svg ref={hSvg} height={ROAD_H} className="absolute inset-0">
          <defs>
            <path ref={hPath} id="road-h" />
          </defs>
          <use href="#road-h" className="road-edge road-edge-sm" />
          <use href="#road-h" className="road-surface road-surface-sm" />
          <use href="#road-h" className="road-centre" />
        </svg>
        <div ref={hCar} className="car">
          {diving ? <SubSvg /> : <CarSvg />}
        </div>
      </div>
    </>
  );
}

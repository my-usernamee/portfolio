"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    let raf = 0;
    let vLen = 0;
    let hLen = 0;
    const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

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
      cancelAnimationFrame(raf);
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
          <CarSvg />
        </div>
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
          <CarSvg />
        </div>
      </div>
    </>
  );
}

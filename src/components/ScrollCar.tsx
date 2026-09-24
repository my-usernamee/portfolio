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

const ROAD_W = 96; // fixed column width
const CX = 44; // road centre x
const AMP = 15; // wiggle amplitude
const PERIOD = 300; // px per full S

// A wiggly road down the left edge. The car follows the path as the page scrolls.
export default function ScrollCar() {
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let len = 0;

    const build = () => {
      const h = window.innerHeight;
      const svg = svgRef.current;
      const path = pathRef.current;
      if (!svg || !path) return;
      svg.setAttribute("viewBox", `0 0 ${ROAD_W} ${h}`);
      svg.setAttribute("height", `${h}`);
      const half = PERIOD / 2;
      let d = `M ${CX} -60`;
      let y = -60;
      let sign = 1;
      while (y < h + 60) {
        const y2 = y + half;
        d += ` C ${CX + sign * AMP * 1.6} ${y + half * 0.4}, ${CX + sign * AMP * 1.6} ${y2 - half * 0.4}, ${CX} ${y2}`;
        y = y2;
        sign = -sign;
      }
      path.setAttribute("d", d);
      len = path.getTotalLength();
    };

    const update = () => {
      raf = 0;
      const car = carRef.current;
      const path = pathRef.current;
      if (!car || !path || !len) return;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // the road extends 60px past both edges; keep the car between 12% and 88% of the viewport
      const yTarget = vh * (0.12 + 0.76 * p);
      // find the path length that lands on yTarget (path is monotonic in y)
      let lo = 0;
      let hi = len;
      for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        if (path.getPointAtLength(mid).y < yTarget) lo = mid;
        else hi = mid;
      }
      const s = (lo + hi) / 2;
      const a = path.getPointAtLength(Math.max(0, s - 3));
      const b = path.getPointAtLength(Math.min(len, s + 3));
      const pt = path.getPointAtLength(s);
      const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI - 90;
      car.style.transform = `translate(${pt.x}px, ${pt.y}px) rotate(${deg}deg) translate(-50%, -50%)`;
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
    <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden lg:block" style={{ width: ROAD_W }}>
      <svg ref={svgRef} width={ROAD_W} className="absolute inset-0">
        <defs>
          <path ref={pathRef} id="road-path" />
        </defs>
        <use href="#road-path" className="road-edge" />
        <use href="#road-path" className="road-surface" />
        <use href="#road-path" className="road-centre" />
      </svg>
      <div ref={carRef} className="car">
        <CarSvg />
      </div>
    </div>
  );
}

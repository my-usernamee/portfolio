"use client";

import { useEffect, useRef } from "react";

// A teal ring follows the pointer with a little lag. The glyph next to it changes by zone:
// hand over climbing holds, robot over the teams, laptop over projects, flag on F1 pages,
// camera on photo pages. Links grow the ring. Off on touch devices and with reduced motion.
type Mode = "ring" | "link" | "hand" | "robot" | "code" | "flag" | "camera" | "country";

const stroke = { fill: "var(--paper)", stroke: "var(--ink)", strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Glyphs() {
  return (
    <>
      <svg data-glyph="hand" viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
        <g {...stroke}>
          <path d="M12 22 V12 a2 2 0 0 1 4 0 V20" />
          <path d="M16 20 V9 a2 2 0 0 1 4 0 V20" />
          <path d="M20 20 V10 a2 2 0 0 1 4 0 V20" />
          <path d="M24 20 V13 a2 2 0 0 1 4 0 V24" />
          <path d="M12 22 L8 18 a2 2 0 0 0 -3 3 L11 30 C13 34 17 36 21 36 C26 36 28 33 28 29 V24" />
        </g>
      </svg>
      <svg data-glyph="robot" viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
        <g {...stroke}>
          <rect x="8" y="12" width="24" height="20" rx="4" />
          <path d="M20 12 V6" />
          <circle cx="20" cy="5" r="2" fill="var(--teal-bright)" />
          <circle cx="15" cy="21" r="2.5" fill="var(--teal-bright)" />
          <circle cx="25" cy="21" r="2.5" fill="var(--teal-bright)" />
          <path d="M15 28 H25" />
          <path d="M8 18 H4 M32 18 H36" />
        </g>
      </svg>
      <svg data-glyph="code" viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
        <g {...stroke}>
          <rect x="6" y="9" width="28" height="18" rx="2" />
          <path d="M2 31 H38 L34 27 H6 Z" />
          <path d="M14 15 L11 18 L14 21" stroke="var(--teal)" strokeWidth="2" fill="none" />
          <path d="M26 15 L29 18 L26 21" stroke="var(--teal)" strokeWidth="2" fill="none" />
          <path d="M22 14 L18 22" stroke="var(--teal)" strokeWidth="2" />
        </g>
      </svg>
      <svg data-glyph="flag" viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
        <g {...stroke}>
          <path d="M8 36 V6" />
          <path d="M8 6 H32 V24 H8 Z" />
        </g>
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => ((r + c) % 2 ? <rect key={`${r}${c}`} x={8 + c * 8} y={6 + r * 6} width="8" height="6" fill="var(--ink)" /> : null)),
        )}
      </svg>
      <svg data-glyph="camera" viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
        <g {...stroke}>
          <rect x="4" y="12" width="32" height="20" rx="3" />
          <path d="M14 12 L17 7 H23 L26 12" />
          <circle cx="20" cy="22" r="6" />
          <circle cx="20" cy="22" r="2.5" fill="var(--teal-bright)" />
          <circle cx="31" cy="16" r="1.2" fill="var(--ink)" />
        </g>
      </svg>
    </>
  );
}

export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const glyph = useRef<HTMLDivElement>(null);
  const flag = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    let mode: Mode = "ring";

    const setMode = (m: Mode) => {
      if (m === mode) return;
      mode = m;
      ring.current?.setAttribute("data-mode", m);
      glyph.current?.setAttribute("data-mode", m);
    };

    const toFlag = (cc: string) => String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
    const modeFor = (t: Element | null): Mode => {
      if (!t) return "ring";
      if (t.closest("[data-hold]")) return "hand";
      const tile = t.closest<HTMLElement>("[data-flag]");
      if (tile?.dataset.flag) {
        if (flag.current) flag.current.textContent = toFlag(tile.dataset.flag);
        return "country";
      }
      if (t.closest("a, button, input[type=range], [role=button]")) return "link";
      const z = t.closest<HTMLElement>("[data-cursor]")?.dataset.cursor as Mode | undefined;
      return z ?? "ring";
    };

    const tick = () => {
      raf = 0;
      rx += (x - rx) * 0.35;
      ry += (y - ry) * 0.35;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      if (glyph.current) glyph.current.style.transform = `translate(${x + 10}px, ${y + 10}px)`;
      if (Math.abs(x - rx) > 0.3 || Math.abs(y - ry) > 0.3) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      setMode(modeFor(e.target as Element | null));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      x = -100;
      y = -100;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" data-mode="ring" aria-hidden="true" />
      <div ref={glyph} className="cursor-glyph" data-mode="ring" aria-hidden="true">
        <Glyphs />
        <span ref={flag} data-glyph="country" className="cursor-flag" />
      </div>
    </>
  );
}

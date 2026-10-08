"use client";

import { useEffect, useRef } from "react";

// A teal ring follows the pointer with a little lag. The glyph next to it changes by zone:
// hand over climbing holds, robot over the teams, laptop over projects, flag on F1 pages,
// camera on photo pages, the NYT logo on anything wordle. Links grow the ring. Off on touch devices and with reduced motion.
type Mode = "ring" | "link" | "hand" | "robot" | "code" | "flag" | "camera" | "country" | "wordle";

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
      if (t.closest('[data-cursor="wordle"]')) return "wordle";
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
        {/* the NYT "T", from Wikimedia Commons: New_York_Times_T_icon.svg */}
        <span data-glyph="wordle" className="cursor-nyt">
          <svg viewBox="0 0 13.9 18.6" width="13" height="17" fill="var(--ink)">
            <path d="M13.9,2.5C13.9.5,12,0,10.5,0V.3c.9,0,1.6.3,1.6,1a1.05872,1.05872,0,0,1-1.2,1,12.95853,12.95853,0,0,1-3.3-.8A13.27527,13.27527,0,0,0,4.1.7,3.27043,3.27043,0,0,0,.7,3.9,2.31777,2.31777,0,0,0,2.2,6.1l.1-.2a1.05381,1.05381,0,0,1-.6-1A1.26593,1.26593,0,0,1,3.1,3.8a14.776,14.776,0,0,1,3.7.9,28.25773,28.25773,0,0,0,3.7.8V8.6L9,9.9V10l1.5,1.3v4.3a4.6179,4.6179,0,0,1-2.5.6,4.92913,4.92913,0,0,1-3.9-1.6l4.1-2v-7l-5,2.2A6.68515,6.68515,0,0,1,5.8,4.9l-.1-.2A7.47133,7.47133,0,0,0,0,11.6a7.01948,7.01948,0,0,0,7,7,6.50532,6.50532,0,0,0,6.6-6.5h-.2a6.69748,6.69748,0,0,1-2.6,3.1V11.1l1.6-1.3V9.7L10.9,8.4v-3A2.85791,2.85791,0,0,0,13.9,2.5Zm-8.7,11L4,14.1a5.93247,5.93247,0,0,1-1.1-3.8,7.10647,7.10647,0,0,1,.3-2.1l2.1-.9Z" />
          </svg>
        </span>
      </div>
    </>
  );
}

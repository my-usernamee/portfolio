"use client";

import { useEffect, useRef } from "react";

// A small teal ring that follows the pointer with a little lag. Over a climbing hold it becomes a
// chalky hand; over links it grows. Hidden on touch devices and when reduced motion is on.
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const hand = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    let mode: "ring" | "hand" | "link" = "ring";

    const setMode = (m: typeof mode) => {
      if (m === mode) return;
      mode = m;
      ring.current?.setAttribute("data-mode", m);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as Element | null;
      if (t?.closest("[data-hold]")) setMode("hand");
      else if (t?.closest("a, button, input[type=range], [role=button]")) setMode("link");
      else setMode("ring");
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      raf = 0;
      rx += (x - rx) * 0.35;
      ry += (y - ry) * 0.35;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      if (hand.current) hand.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      if (Math.abs(x - rx) > 0.3 || Math.abs(y - ry) > 0.3) raf = requestAnimationFrame(tick);
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
      <div ref={hand} className="cursor-hand" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
            <g fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
              <path d="M12 22 V12 a2 2 0 0 1 4 0 V20" />
              <path d="M16 20 V9 a2 2 0 0 1 4 0 V20" />
              <path d="M20 20 V10 a2 2 0 0 1 4 0 V20" />
              <path d="M24 20 V13 a2 2 0 0 1 4 0 V24" />
              <path d="M12 22 L8 18 a2 2 0 0 0 -3 3 L11 30 C13 34 17 36 21 36 C26 36 28 33 28 29 V24" />
            </g>
            <circle cx="10" cy="8" r="1.5" fill="var(--paper)" opacity="0.9" />
            <circle cx="30" cy="10" r="1" fill="var(--paper)" opacity="0.9" />
          </svg>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

// Underwater mode: the page tints blue-green, bubbles rise, the car on the road becomes a sub.
// Toggled by the "hari:dive" event (the button on the Mecatron card).
export default function DiveMode() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const toggle = () => setOn((v) => !v);
    window.addEventListener("hari:dive", toggle);
    return () => window.removeEventListener("hari:dive", toggle);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dive", on);
    return () => document.documentElement.classList.remove("dive");
  }, [on]);
  if (!on) return null;
  const bubbles = Array.from({ length: 18 }, (_, i) => ({ left: (i * 53) % 100, size: 6 + ((i * 7) % 14), dur: 6 + ((i * 3) % 7), delay: -((i * 1.7) % 8) }));
  return (
    <>
      <div className="dive-tint" aria-hidden="true" />
      <div className="dive-bubbles" aria-hidden="true">
        {bubbles.map((b, i) => (
          <span key={i} style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
        ))}
      </div>
      <button type="button" onClick={() => setOn(false)} className="dive-surface route-tag !rotate-0" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
        ↑ surface
      </button>
    </>
  );
}

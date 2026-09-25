"use client";

import { useEffect, useState } from "react";

// Rain on the road when it's raining at NTU. Add ?rain=1 to the URL to force it and see the effect.
type W = { raining: boolean; expected: boolean; forecast: string; tempC: number | null; validUntil: string };

export default function Weather() {
  const [w, setW] = useState<W | null>(null);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const force = new URLSearchParams(window.location.search).get("rain") === "1";
    setForced(force);
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch("/api/weather");
        if (r.ok && !stop) setW(await r.json());
      } catch {
        /* offline: no rain, no chip */
      }
    };
    load();
    const t = window.setInterval(load, 10 * 60_000);
    return () => {
      stop = true;
      window.clearInterval(t);
    };
  }, []);

  const raining = forced || !!w?.raining;
  useEffect(() => {
    document.documentElement.classList.toggle("rain", raining);
    return () => document.documentElement.classList.remove("rain");
  }, [raining]);

  if (!w && !forced) return null;
  const drops = Array.from({ length: 26 }, (_, i) => ({ left: (i * 37) % 100, delay: -((i * 0.37) % 1.3), dur: 0.9 + ((i * 0.13) % 0.5) }));
  return (
    <>
      {raining && (
        <>
          <div className="rain-layer rain-v" aria-hidden="true">
            {drops.map((d, i) => (
              <span key={i} style={{ left: `${d.left}%`, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
            ))}
          </div>
          <div className="rain-layer rain-h" aria-hidden="true">
            {drops.map((d, i) => (
              <span key={i} style={{ left: `${d.left}%`, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
            ))}
          </div>
        </>
      )}
      <div className={`weather-chip ${raining ? "is-wet" : ""}`} title={w ? `${w.forecast || "no forecast"} · ${w.validUntil}` : "forced rain"} aria-live="polite">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M7 15a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8a3.5 3.5 0 0 1 0 7Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          {raining && <path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" stroke="var(--teal-bright)" strokeWidth="1.6" strokeLinecap="round" />}
        </svg>
        <span>
          {raining ? "raining at ntu" : w?.expected ? "rain due at ntu" : "dry at ntu"}
          {w?.tempC != null && ` · ${Math.round(w.tempC)}°`}
        </span>
      </div>
    </>
  );
}

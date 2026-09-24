"use client";

import { useEffect, useState } from "react";
import type { TravelPhoto } from "@/data/travel";

// Masonry that fills the shortest column each time, so the bottom edge ends level
// instead of CSS columns' top-to-bottom fill that leaves one column hanging.
function distribute(photos: TravelPhoto[], cols: number) {
  const heights = Array(cols).fill(0);
  const out: TravelPhoto[][] = Array.from({ length: cols }, () => []);
  for (const p of photos) {
    const i = heights.indexOf(Math.min(...heights));
    out[i].push(p);
    heights[i] += p.height / p.width;
  }
  return out;
}

export default function PhotoWall({ photos }: { photos: TravelPhoto[] }) {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setCols(mq.matches ? 3 : 2);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const columns = distribute(photos, cols);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-3">
          {col.map((p) => (
            <figure key={p.slug} className="tile" tabIndex={0} data-flag={p.cc}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={`${p.place}, ${p.country}`} width={p.width} height={p.height} loading="lazy" decoding="async" className="block h-auto w-full" />
              <figcaption className="cap">
                <span className="display block text-lg leading-tight">{p.place}</span>
                <span className="font-mono text-[11px] tracking-[0.18em] opacity-90">
                  {p.country.toUpperCase()}
                  {p.when && ` · ${p.when.toUpperCase()}`}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}

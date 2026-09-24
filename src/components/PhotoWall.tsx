"use client";

import { useEffect, useState } from "react";
import type { TravelPhoto } from "@/data/travel";

// Masonry that ends level. Greedy shortest-column fill first, then a local search that moves or
// swaps single photos between the tallest and shortest columns until the bottoms line up.
// Same-country vertical neighbours count against a layout too, so the spread survives.
const ratio = (p: TravelPhoto) => p.height / p.width;

function score(cols: TravelPhoto[][]) {
  const h = cols.map((c) => c.reduce((a, p) => a + ratio(p), 0));
  let clashes = 0;
  for (const c of cols) for (let i = 1; i < c.length; i++) if (c[i].country === c[i - 1].country) clashes++;
  return Math.max(...h) - Math.min(...h) + clashes * 0.25;
}

function distribute(photos: TravelPhoto[], n: number) {
  const cols: TravelPhoto[][] = Array.from({ length: n }, () => []);
  const h = Array(n).fill(0);
  for (const p of photos) {
    const i = h.indexOf(Math.min(...h));
    cols[i].push(p);
    h[i] += ratio(p);
  }
  let best = score(cols);
  for (let pass = 0; pass < 40; pass++) {
    let improved = false;
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        if (a === b) continue;
        // move any item a -> end of b
        for (let i = 0; i < cols[a].length; i++) {
          const trial = cols.map((c) => [...c]);
          trial[b].push(trial[a].splice(i, 1)[0]);
          const sc = score(trial);
          if (sc < best - 1e-9) { best = sc; cols.splice(0, n, ...trial); improved = true; }
        }
        // swap any item of a with any item of b
        for (let i = 0; i < cols[a].length; i++) {
          for (let j = 0; j < cols[b].length; j++) {
            const trial = cols.map((c) => [...c]);
            [trial[a][i], trial[b][j]] = [trial[b][j], trial[a][i]];
            const sc = score(trial);
            if (sc < best - 1e-9) { best = sc; cols.splice(0, n, ...trial); improved = true; }
          }
        }
      }
    }
    if (!improved) break;
  }
  return cols;
}

export default function PhotoWall({ photos }: { photos: TravelPhoto[] }) {
  const [cols, setCols] = useState(3);
  // on touch screens a tap shows the caption; tapping the same photo, another photo, or elsewhere hides it
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => {
      if (!(e.target as Element).closest(".tile")) setOpen(null);
    };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [open]);
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
            <figure
              key={p.slug}
              className={`tile ${open === p.slug ? "is-open" : ""}`}
              tabIndex={0}
              data-flag={p.cc}
              onClick={() => setOpen((o) => (o === p.slug ? null : p.slug))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen((o) => (o === p.slug ? null : p.slug));
                }
              }}
            >
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

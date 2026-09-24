"use client";

import { useEffect, useState } from "react";
import world from "@/data/world.json";
import type { TravelPhoto } from "@/data/travel";

// Line-art world map with a teal dot per photo. Hover (or tap) a dot to see the photo.
export default function TravelMap({ photos }: { photos: TravelPhoto[] }) {
  const [active, setActive] = useState<string | null>(null);
  const bySlug = new Map(photos.map((p) => [p.slug, p]));
  const pt = world.points.find((p) => p.slug === active);
  const photo = active ? bySlug.get(active) : undefined;

  useEffect(() => {
    if (!active) return;
    const off = (e: PointerEvent) => {
      if (!(e.target as Element).closest("[data-map-dot], [data-map-pop]")) setActive(null);
    };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [active]);

  // pop-up sits above the dot, flipped below near the top edge, and clamped inside the map horizontally
  const popLeft = pt ? Math.min(Math.max((pt.x / world.w) * 100, 14), 86) : 0;
  const popTop = pt ? (pt.y / world.h) * 100 : 0;
  const below = popTop < 30;

  return (
    <div className="relative mb-10 select-none" data-cursor="camera">
      <svg viewBox={`0 0 ${world.w} ${world.h}`} className="block h-auto w-full" aria-label="Map of places photographed">
        <path d={world.land} fill="var(--paper-2)" stroke="var(--line-strong)" strokeWidth="1" strokeLinejoin="round" />
        {world.points.map((p) => {
          const on = active === p.slug;
          return (
            <g
              key={p.slug}
              data-map-dot=""
              className="cursor-pointer"
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.slug)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive((a) => (a === p.slug ? null : a))}
              onClick={() => setActive((a) => (a === p.slug ? null : p.slug))}
              role="button"
              tabIndex={0}
              aria-label={bySlug.get(p.slug)?.place}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive((a) => (a === p.slug ? null : p.slug))}
            >
              {/* generous invisible hit area so dots are easy to catch on any screen */}
              <circle cx={p.x} cy={p.y} r="7" fill="transparent" />
              {on && <circle cx={p.x} cy={p.y} r="11" fill="none" stroke="var(--teal)" strokeWidth="1.5" className="map-ping" />}
              <circle cx={p.x} cy={p.y} r={on ? 6 : 4.5} fill="var(--teal-bright)" stroke="var(--ink)" strokeWidth="1.2" />
            </g>
          );
        })}
      </svg>

      {photo && pt && (
        <figure
          data-map-pop=""
          className="pointer-events-none absolute z-10 w-40 -translate-x-1/2 sm:w-52"
          style={{ left: `${popLeft}%`, top: `${popTop}%`, transform: `translate(-50%, ${below ? "18px" : "calc(-100% - 18px)"})` }}
        >
          <div className="polaroid rotate-1 !p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={photo.place} className="aspect-[4/3] w-full object-cover" />
            <figcaption className="mt-1.5">
              <span className="display block text-sm leading-tight text-ink">{photo.place}</span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-graphite">
                {photo.country.toUpperCase()}
                {photo.when && ` · ${photo.when.toUpperCase()}`}
              </span>
            </figcaption>
          </div>
        </figure>
      )}
      <p className="mt-2 text-right font-mono text-[10px] tracking-[0.14em] text-dim">
        <span className="hidden md:inline">hover</span>
        <span className="md:hidden">tap</span> a dot · map: natural earth
      </p>
    </div>
  );
}

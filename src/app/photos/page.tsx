import type { Metadata } from "next";
import { HoldField } from "@/components/Doodles";
import PageHeader from "@/components/PageHeader";
import Photo from "@/components/Photo";
import { places } from "@/data/travel";

export const metadata: Metadata = { title: "photos" };

export default function Photos() {
  const tiles = places.flatMap((p) => Array.from({ length: p.photos }, (_, i) => ({ ...p, i: i + 1, wide: p.wide && i === 0 })));
  return (
    <main className="relative" data-cursor="camera">
      <HoldField n={5} />
      <PageHeader eyebrow="TRAVEL" title="places & photos">
        {places.length} places so far. Hover for where and when.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((t) => (
            <figure key={`${t.slug}-${t.i}`} className={`tile aspect-square ${t.wide ? "col-span-2 md:aspect-[2/1]" : ""}`} tabIndex={0}>
              <Photo src={`/images/travel/${t.slug}-${t.i}.jpg`} alt={`${t.place}, ${t.year}`} label={t.place.toUpperCase()} mono={false} className="h-full w-full object-cover" />
              <figcaption className="cap">
                <span className="display block text-lg leading-tight">{t.place}</span>
                <span className="font-mono text-[11px] tracking-[0.18em] opacity-90">
                  {t.country.toUpperCase()} · {t.year}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 font-mono text-xs text-dim">drop photos in /public/images/travel/ as &lt;place&gt;-1.jpg, -2.jpg. years marked 20XX still need filling in.</p>
      </section>
    </main>
  );
}

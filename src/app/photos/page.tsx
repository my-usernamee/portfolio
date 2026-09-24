import type { Metadata } from "next";
import { HoldField } from "@/components/Doodles";
import PageHeader from "@/components/PageHeader";
import { countries, photos } from "@/data/travel";

export const metadata: Metadata = { title: "photos" };

export default function Photos() {
  return (
    <main className="relative" data-cursor="camera">
      <HoldField n={5} />
      <PageHeader eyebrow="TRAVEL" title="places & photos">
        {photos.length} photos from {countries.length} countries. Hover for where and when.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <div className="columns-2 gap-3 md:columns-3 [&>*]:mb-3">
          {photos.map((p) => (
            <figure key={p.slug} className="tile break-inside-avoid" tabIndex={0}>
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
      </section>
    </main>
  );
}

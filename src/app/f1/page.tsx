import type { Metadata } from "next";
import Circuit from "@/components/Circuit";
import { HoldField } from "@/components/Doodles";
import Hl from "@/components/Hl";
import PageHeader from "@/components/PageHeader";
import Photo from "@/components/Photo";
import { fan, trips, wishlist } from "@/data/f1";

export const metadata: Metadata = { title: "f1 trips" };

export default function F1() {
  return (
    <main className="relative" data-cursor="flag">
      <HoldField n={3} />
      <PageHeader eyebrow="F1 TRIPS" title="circuits i've stood at">
        Three circuits, four weekends. <Hl>{fan.line}</Hl>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <ul className="grid gap-6 md:grid-cols-3">
          {trips.map((t) => (
            <li key={t.slug} className="card lift flex flex-col">
              <div className="card-head">
                <span>{t.city.toLowerCase()}</span>
                <span className="text-dim">{t.year}</span>
              </div>
              <div className="zoom relative aspect-[4/3] w-full border-b border-line">
                <Photo src={t.image} alt={`${t.gp} photo`} label={t.city.toUpperCase()} mono={false} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <Circuit slug={t.slug} className="h-24 w-full" />
                <h2 className="display mt-3 text-2xl text-ink">{t.gp}</h2>
                <p className="font-mono text-xs text-dim">{t.circuit}</p>
                <p className="mt-3 text-sm text-graphite">
                  <Hl>{t.note}</Hl>
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 md:grid-cols-12">
          <div className="card p-6 md:col-span-7">
            <p className="font-mono text-[10px] tracking-[0.2em] text-dim">GARAGE ALLEGIANCE</p>
            <div className="mt-4 flex items-center gap-6">
              <span className="display-wide text-7xl text-teal">{fan.number}</span>
              <div>
                <p className="display text-2xl text-ink">{fan.driver}</p>
                <p className="text-graphite">{fan.team}</p>
              </div>
            </div>
          </div>
          <div className="card p-6 md:col-span-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-dim">NEXT ON THE LIST</p>
            <ul className="mt-4 space-y-2 font-mono text-sm text-ink">
              {wishlist.map((w, i) => (
                <li key={w} className="flex items-center gap-3 border-b border-line pb-2">
                  <span className="text-dim">P{i + 1}</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Photo from "@/components/Photo";
import { logs } from "@/data/travel";

export const metadata: Metadata = { title: "photos" };

export default function Photos() {
  return (
    <main>
      <PageHeader eyebrow="TRAVEL LOGS" title="places & photos">
        Treks, race weekends, and the food in between. Photos go in <code className="font-mono text-ink">/public/images/travel/</code>.
      </PageHeader>
      <section className="mx-auto max-w-6xl space-y-16 px-5 pb-16 sm:px-8 lg:pl-28">
        {logs.map((l) => (
          <article key={l.slug} className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono text-xs tracking-[0.18em] text-teal">
                {l.when.toUpperCase()}
                {l.example && <span className="ml-2 bg-paper-3 px-1.5 py-0.5 text-[10px] text-graphite">EXAMPLE</span>}
              </p>
              <h2 className="display mt-2 text-4xl text-ink">{l.place}</h2>
              <p className="font-mono text-sm text-dim">{l.country}</p>
              <p className="mt-4 max-w-sm text-graphite">{l.note}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:col-span-8 md:grid-cols-3">
              {Array.from({ length: l.photos }).map((_, i) => (
                <div key={i} className={`polaroid relative ${i === 0 ? "col-span-2 md:col-span-2 md:row-span-2" : ""}`}>
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Photo src={`/images/travel/${l.slug}-${i + 1}.jpg`} alt={`${l.place} photo ${i + 1}`} label={l.place.toUpperCase()} mono={false} className="h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

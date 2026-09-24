import type { Metadata } from "next";
import { HoldField } from "@/components/Doodles";
import Hl from "@/components/Hl";
import PageHeader from "@/components/PageHeader";
import Photo from "@/components/Photo";
import { climbing } from "@/data/climbing";

export const metadata: Metadata = { title: "climbing" };

export default function Climbing() {
  return (
    <main className="relative" data-cursor="hand">
      <HoldField n={8} />
      <PageHeader eyebrow="BOULDERING" title="problems, not routes">
        <Hl>{climbing.line}</Hl> Mostly at {climbing.gym}.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <dl className="mb-10 grid max-w-2xl gap-x-8 gap-y-2 font-mono text-sm sm:grid-cols-2">
          {climbing.facts.map(([k, v]) => (
            <div key={k} className="flex gap-3 border-b border-line py-2">
              <dt className="w-14 shrink-0 text-[11px] uppercase tracking-[0.18em] text-teal">{k}</dt>
              <dd className="text-graphite">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-8 md:grid-cols-3">
          {climbing.photos.map((p, i) => (
            <figure key={p.src} className={`polaroid lift relative ${["md:rotate-1", "md:mt-10 md:-rotate-1", "md:mt-4 md:rotate-[0.5deg]"][i]}`}>
              <span className="tape" />
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Photo src={p.src} alt={p.alt} className="h-full w-full object-cover" />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-graphite">{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}

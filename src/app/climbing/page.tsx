import type { Metadata } from "next";
import { HoldField } from "@/components/Doodles";
import PageHeader from "@/components/PageHeader";
import Photo from "@/components/Photo";
import { climbing } from "@/data/climbing";

export const metadata: Metadata = { title: "climbing" };

export default function Climbing() {
  return (
    <main className="relative" data-cursor="hand">
      <HoldField n={8} />
      <PageHeader eyebrow="BOULDERING" title="problems, not routes">
        {climbing.line} Mostly at {climbing.gym}.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <div className="grid gap-8 md:grid-cols-2">
          {climbing.photos.map((p, i) => (
            <figure key={p.src} className={`polaroid lift relative ${i ? "md:mt-12 md:-rotate-1" : "md:rotate-1"}`}>
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

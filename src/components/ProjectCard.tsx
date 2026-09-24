import type { Project } from "@/data/profile";
import { illustrations } from "./Illustrations";
import Hl from "./Hl";
import Photo from "./Photo";

export default function ProjectCard({ p }: { p: Project }) {
  const Illo = illustrations[p.slug];
  return (
    <article className="card lift h-full">
      <div className="card-head">
        <span className="truncate">{p.slug}.app</span>
        <span className="text-dim">{p.year}</span>
      </div>
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line">
        {Illo ? <Illo className="h-full w-full" /> : <Photo src={p.image ?? `/images/projects/${p.slug}.png`} alt={`${p.name} screenshot`} label="SCREENSHOT" className="h-full w-full object-cover object-top" />}
      </div>
      <div className="p-4">
        <span className="kind">{p.kind}</span>
        <h3 className="display mt-3 text-2xl text-ink">{p.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-graphite">
          <Hl>{p.blurb}</Hl>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {p.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
          {p.link && (
            <a href={p.link} target="_blank" rel="noreferrer" className="link-under ml-auto font-mono text-xs text-teal">
              {p.linkLabel ?? "github"} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

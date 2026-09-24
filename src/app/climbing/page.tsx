import type { Metadata } from "next";
import { HoldField } from "@/components/Doodles";
import PageHeader from "@/components/PageHeader";
import Photo from "@/components/Photo";
import { climbing, gradeKey, outdoorWishlist, sends } from "@/data/climbing";

export const metadata: Metadata = { title: "climbing" };

export default function Climbing() {
  return (
    <main className="relative">
      <HoldField n={8} />
      <PageHeader eyebrow="BOULDERING" title="problems, not routes">
        Short walls, hard moves, lots of falling. Best debugging practice there is: same problem, try again, change one thing.
      </PageHeader>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">

        {/* stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["WHY", climbing.grade, climbing.gradeNote],
            ["HOME GYM", climbing.homeGym, `climbing since ${climbing.since}`],
            ["STYLE", "slab · crimps", climbing.style],
          ].map(([k, v, sub]) => (
            <div key={k} className="card p-5">
              <p className="font-mono text-[10px] tracking-[0.2em] text-dim">{k}</p>
              <p className="display mt-2 text-3xl text-ink">{v}</p>
              <p className="mt-1 text-sm text-graphite">{sub}</p>
            </div>
          ))}
        </div>

        {/* grade key + current project */}
        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <div className="card p-5 md:col-span-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-dim">GYM COLOURS → V-SCALE, ROUGHLY</p>
            <ul className="mt-4 space-y-2">
              {gradeKey.map((g) => (
                <li key={g.name} className="flex items-center gap-3 font-mono text-sm text-graphite">
                  <span className="h-4 w-4 rounded-full border border-line-strong" style={{ background: g.color }} />
                  <span className="w-16">{g.name}</span>
                  <span>{g.v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5 md:col-span-7">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-[0.2em] text-dim">CURRENT PROJECT</p>
              <span className="kind">{climbing.currentProject.attempts} attempts</span>
            </div>
            <h2 className="display mt-3 text-3xl text-ink">{climbing.currentProject.name}</h2>
            <p className="font-mono text-xs text-dim">
              {climbing.currentProject.gym} · {climbing.currentProject.grade}
            </p>
            <p className="mt-3 text-graphite">{climbing.currentProject.note}</p>
            <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden">
              <Photo src="/images/climbing/project.jpg" alt="Current project" label="PROJECT" mono={false} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        {/* send log */}
        <div className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="display text-3xl text-ink">send log</h2>
            <p className="font-mono text-xs text-dim">edit src/data/climbing.ts</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line-strong font-mono text-[10px] tracking-[0.18em] text-dim">
                  <th className="py-2 text-left font-normal">WHEN</th>
                  <th className="py-2 text-left font-normal">PROBLEM</th>
                  <th className="py-2 text-left font-normal">GYM</th>
                  <th className="py-2 text-left font-normal">GRADE</th>
                  <th className="py-2 text-left font-normal">STYLE</th>
                  <th className="py-2 text-left font-normal">NOTE</th>
                </tr>
              </thead>
              <tbody>
                {sends.map((s) => {
                  const g = gradeKey.find((k) => k.name === s.grade);
                  return (
                    <tr key={s.date + s.problem} className="border-b border-line align-top">
                      <td className="py-3 pr-4 font-mono text-xs text-dim">{s.date}</td>
                      <td className="py-3 pr-4 text-ink">
                        {s.problem}
                        {s.example && <span className="ml-2 bg-paper-3 px-1.5 py-0.5 font-mono text-[10px] text-graphite">EXAMPLE</span>}
                      </td>
                      <td className="py-3 pr-4 text-graphite">{s.gym}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-2 font-mono text-xs text-ink">
                          <span className="h-3 w-3 rounded-full border border-line-strong" style={{ background: g?.color ?? "var(--paper-3)" }} />
                          {s.grade}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-graphite">{s.style}</td>
                      <td className="py-3 text-graphite">{s.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* outdoors */}
        <div className="mt-12">
          <h2 className="display text-3xl text-ink">real rock, eventually</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {outdoorWishlist.map((o) => (
              <li key={o.place} className="polaroid relative">
                <span className="tape" />
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Photo src={`/images/climbing/${o.place.toLowerCase().replace(/[^a-z]+/g, "-")}.jpg`} alt={o.place} label={o.place.toUpperCase()} className="h-full w-full object-cover" />
                </div>
                <h3 className="display mt-3 text-xl text-ink">{o.place}</h3>
                <p className="font-mono text-xs text-dim">{o.where}</p>
                <p className="mt-1 text-sm text-graphite">{o.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

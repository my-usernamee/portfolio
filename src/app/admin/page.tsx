import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { signedIn } from "@/lib/session";
import { dayKey, read, storage, type Day } from "@/lib/stats";
import { logout } from "./actions";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "admin", robots: { index: false, follow: false } };

const SPANS = [7, 30, 90];
const wrap = "mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28";
const n = (v: number) => v.toLocaleString("en-SG");
const short = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-SG", { day: "numeric", month: "short", timeZone: "UTC" });

function Tile({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="card p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-graphite">{label}</p>
      <p className="display mt-2 text-4xl text-ink">{n(value)}</p>
      {note && <p className="mt-1 font-mono text-[11px] text-dim">{note}</p>}
    </div>
  );
}

function Columns({ days }: { days: Day[] }) {
  const max = Math.max(1, ...days.map((d) => d.views));
  const top = Math.ceil(max / 4) * 4; // a clean axis maximum that splits into quarters
  const every = days.length > 30 ? 14 : days.length > 7 ? 5 : 1;
  return (
    <div className="flex gap-3">
      <div className="flex h-48 flex-col justify-between text-right font-mono text-[10px] text-dim">
        {[top, top / 2, 0].map((t) => (
          <span key={t} className="leading-none">{n(t)}</span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative flex h-48 items-end border-b border-line-strong">
          <span className="absolute inset-x-0 top-0 border-t border-line" />
          <span className="absolute inset-x-0 top-1/2 border-t border-line" />
          {days.map((d, i) => (
            <div key={d.date} tabIndex={0} className="group relative flex h-full flex-1 items-end justify-center outline-none hover:bg-ink/5 focus-visible:bg-ink/5">
              <div className="w-full max-w-6 rounded-t bg-teal px-px" style={{ height: `${(d.views / top) * 100}%`, minHeight: d.views ? 2 : 0, width: "calc(100% - 2px)" }} />
              <div className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap border border-line-strong bg-paper px-2 py-1.5 font-mono text-[11px] text-ink shadow-[2px_3px_0_rgba(21,23,26,0.1)] group-hover:block group-focus-visible:block ${i < days.length / 2 ? "left-0" : "right-0"}`}>
                <span className="block text-graphite">{short(d.date)}</span>
                {n(d.views)} views · {n(d.visitors)} visitors
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex font-mono text-[10px] text-dim">
          {days.map((d, i) => (
            <span key={d.date} className="flex-1 overflow-visible whitespace-nowrap text-center">
              {(days.length - 1 - i) % every === 0 ? short(d.date) : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Ranked({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <section className="card">
      <div className="card-head">
        <span>{title}</span>
        <span>VIEWS</span>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 font-mono text-xs text-dim">{empty}</p>
      ) : (
        <ol className="flex flex-col gap-2.5 p-4">
          {rows.map(([name, v]) => (
            <li key={name} className="font-mono text-xs">
              <div className="flex justify-between gap-3">
                <span className="truncate text-ink">{name}</span>
                <span className="text-graphite">{n(v)}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-r bg-teal" style={{ width: `${Math.max(1, (v / max) * 100)}%` }} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function Admin({ searchParams }: PageProps<"/admin">) {
  if (!(await signedIn())) {
    return (
      <main>
        <PageHeader eyebrow="ADMIN" title="pit wall">
          Owner only.
        </PageHeader>
        <section className={wrap}>
          <LoginForm />
        </section>
      </main>
    );
  }

  const asked = Number((await searchParams).days);
  const span = SPANS.includes(asked) ? asked : 30;
  const s = await read(span).catch(() => null);
  const today = s?.days.at(-1);
  const views = s?.days.reduce((a, d) => a + d.views, 0) ?? 0;
  const countries = new Intl.DisplayNames(["en"], { type: "region" });

  return (
    <main>
      <PageHeader eyebrow="ADMIN" title="pit wall">
        Who&apos;s been reading. Your own visits from this browser aren&apos;t counted.
      </PageHeader>
      <section className={wrap}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Time range" className="flex gap-2">
            {SPANS.map((d) => (
              <Link key={d} href={`/admin?days=${d}`} aria-current={d === span ? "page" : undefined} className="route-tag">
                {d} days
              </Link>
            ))}
          </nav>
          <form action={logout}>
            <button className="link-under font-mono text-xs text-graphite hover:text-ink">sign out</button>
          </form>
        </div>

        {storage === "none" && (
          <p className="card mb-6 p-4 font-mono text-xs text-graphite">
            Nothing is being saved yet: this deployment has no database. Add Upstash Redis from the Vercel Storage tab (it sets KV_REST_API_URL and KV_REST_API_TOKEN), then redeploy.
          </p>
        )}
        {!s && <p className="card mb-6 p-4 font-mono text-xs text-[#b3402a]">Couldn&apos;t reach the stats database. Try again in a minute.</p>}

        {s && today && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Tile label="views today" value={today.views} note={`${n(today.visitors)} visitors · ${short(dayKey())}`} />
              <Tile label={`views, ${span} days`} value={views} />
              <Tile label="views, all time" value={s.total} />
              <Tile label="visitors, all time" value={s.visitors} note="approximate" />
            </div>

            <section className="card mt-6">
              <div className="card-head">
                <span>VIEWS PER DAY</span>
                <span>LAST {span} DAYS · SGT</span>
              </div>
              <div className="p-4">
                <Columns days={s.days} />
                <details className="mt-4 font-mono text-xs text-graphite">
                  <summary className="cursor-pointer text-teal">show as a table</summary>
                  <table className="mt-3 w-full max-w-md text-left">
                    <thead>
                      <tr className="border-b border-line-strong text-[11px] uppercase tracking-[0.12em]">
                        <th className="py-1.5 font-normal">day</th>
                        <th className="py-1.5 text-right font-normal">views</th>
                        <th className="py-1.5 text-right font-normal">visitors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...s.days].reverse().map((d) => (
                        <tr key={d.date} className="border-b border-line">
                          <td className="py-1.5">{short(d.date)}</td>
                          <td className="py-1.5 text-right text-ink">{n(d.views)}</td>
                          <td className="py-1.5 text-right">{n(d.visitors)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </div>
            </section>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Ranked title="PAGES" rows={s.pages} empty="No views in this range yet." />
              <Ranked title="CAME FROM" rows={s.refs} empty="No outside links yet. Direct visits aren't listed." />
              <Ranked
                title="COUNTRIES"
                rows={s.countries.map(([c, v]) => [/^[A-Z]{2}$/.test(c) ? (countries.of(c) ?? c) : "unknown", v])}
                empty="No views in this range yet."
              />
              <Ranked title="DEVICES" rows={s.devices} empty="No views in this range yet." />
              <Ranked title="BROWSERS" rows={s.browsers} empty="No views in this range yet." />
            </div>

            <section className="card mt-6">
              <div className="card-head">
                <span>LATEST VISITS</span>
                <span>SGT</span>
              </div>
              {s.recent.length === 0 ? (
                <p className="p-4 font-mono text-xs text-dim">No visits yet.</p>
              ) : (
                <ul className="divide-y divide-line px-4 font-mono text-xs">
                  {s.recent.map((r, i) => (
                    <li key={`${r.t}-${i}`} className="flex flex-wrap gap-x-4 gap-y-0.5 py-2">
                      <span className="w-32 shrink-0 text-dim">
                        {new Date(r.t).toLocaleString("en-SG", { timeZone: "Asia/Singapore", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })}
                      </span>
                      <span className="min-w-24 flex-1 truncate text-ink">{r.path}</span>
                      <span className="text-graphite">
                        {[/^[A-Z]{2}$/.test(r.country) ? countries.of(r.country) : null, r.device, r.ref ? `via ${r.ref}` : null].filter(Boolean).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import { HoldField } from "@/components/Doodles";
import Photo from "@/components/Photo";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import { honors, interests, photo, pointers, profile, projects, skills, stints, teams } from "@/data/profile";

export default function Home() {
  return (
    <main className="relative mx-auto max-w-6xl px-5 sm:px-8 lg:pl-28">
      <HoldField n={9} />
      {/* intro */}
      <section className="grid gap-10 pt-10 sm:pt-16 md:grid-cols-12 md:items-start">
        <div className="md:col-span-7 md:pt-4">
          <h1 className="display-wide text-6xl text-ink sm:text-8xl">
            hey, i&apos;m <span className="hl">hari</span>
            <span className="text-teal">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-ink sm:text-2xl">
            I&apos;m into <span className="hl">robotics</span>, <span className="hl">machine learning</span>, and building random things that seem
            interesting. Usually learning by doing, tinkering with ideas, and turning half-baked concepts into actual projects.
          </p>

          <ul className="mt-7 space-y-2.5 font-mono text-sm text-graphite">
            {pointers.map((f) => (
              <li key={f.text} className="flex gap-3">
                <span className="text-teal">&gt;</span>
                {f.href ? (
                  <a href={f.href} target={f.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="link-under hover:text-ink">
                    {f.text}
                  </a>
                ) : (
                  <span>{f.text}</span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs">
            {[
              ["email", `mailto:${profile.email}`],
              ["github", profile.links.github],
              ["linkedin", profile.links.linkedin],
              ["resume", profile.links.resume],
            ].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="link-under text-graphite hover:text-ink">
                {label} ↗
              </a>
            ))}
          </div>
        </div>

        <div className="order-first md:order-none md:col-span-5 md:pl-6">
          <figure className="polaroid polaroid-hero lift relative mx-auto max-w-[250px] sm:max-w-[300px] md:ml-auto md:mr-2">
            <span className="tape" />
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Photo src={photo.src} alt={photo.alt} label="HARI" className="h-full w-full object-cover object-center" />
            </div>
            <figcaption className="mt-3">
              <span className="display text-sm text-ink">{photo.caption}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* teams */}
      <section className="mt-16 sm:mt-20" data-cursor="robot">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="display text-3xl text-ink">teams</h2>
          <p className="font-mono text-xs text-dim">the robots i spend most weekends with</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {teams.map((t, i) => (
            <Reveal key={t.slug} delay={i * 0.05}>
              <article className="card lift flex h-full flex-col">
                <div className="card-head">
                  <span>{t.what.toLowerCase()}</span>
                  <span className="text-dim">since {t.since}</span>
                </div>
                <div className="zoom relative aspect-[16/9] w-full border-b border-line">
                  <Photo src={`/images/teams/${t.slug}.jpg`} alt={`${t.name} photo`} label={t.name.toUpperCase()} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="kind self-start">{t.role}</span>
                  <h3 className="display mt-3 text-3xl text-ink">
                    <a href={t.link} target="_blank" rel="noreferrer" className="hover:text-teal">
                      {t.name} ↗
                    </a>
                  </h3>
                  <div className="mt-3 space-y-2 text-sm leading-relaxed text-graphite">
                    {t.lines.map((l, j) => (
                      <p key={j}>{l}</p>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* projects */}
      <section className="mt-16 sm:mt-20" data-cursor="code">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="display text-3xl text-ink">things i&apos;ve built</h2>
          <a href={profile.links.github} target="_blank" rel="noreferrer" className="link-under font-mono text-xs text-dim hover:text-ink">
            more on github ↗
          </a>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.05}>
              <ProjectCard p={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* experience + skills */}
      <section className="relative mt-20 grid gap-12 border-t border-line pt-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <h2 className="display text-3xl text-ink">where i&apos;ve been</h2>
          <ul className="mt-6 divide-y divide-line">
            {stints.map((s) => (
              <li key={s.org + s.period} className="grid gap-1 py-5 sm:grid-cols-[150px_1fr]">
                <p className="font-mono text-xs text-dim">{s.period}</p>
                <div>
                  <p className="font-semibold text-ink">{s.org}</p>
                  <p className="text-sm text-graphite">{s.role}</p>
                  <p className="mt-2 text-sm text-graphite">{s.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-10 md:col-span-5">
          <div>
            <h2 className="display text-3xl text-ink">stack</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="route-tag" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="display text-3xl text-ink">shelf</h2>
            <ul className="mt-5 space-y-2 font-mono text-sm text-graphite">
              {honors.map((h) => (
                <li key={h.title} className="flex justify-between gap-4 border-b border-line pb-2">
                  <span>{h.title}</span>
                  <span className="text-dim">{h.year}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* otherwise */}
      <section className="relative mt-16 border-t border-line pt-10 pb-6">
        <p className="font-mono text-xs tracking-[0.18em] text-teal">OTHERWISE</p>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          {interests.map((it) => (
            <li key={it.href}>
              <Link href={it.href} className="link-under display text-xl text-ink hover:text-teal">
                {it.label}
              </Link>
              <span className="ml-2 font-mono text-xs text-dim">{it.note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-xs text-dim">
          all of it lives under{" "}
          <Link href="/interests" className="link-under text-graphite hover:text-ink">
            /interests
          </Link>
        </p>
      </section>
    </main>
  );
}

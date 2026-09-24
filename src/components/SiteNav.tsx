"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { interests, pages, profile } from "@/data/profile";

const colors: Record<string, string> = { "/climbing": "#3f9a5a", "/f1": "var(--teal-bright)", "/photos": "#d9643a", "/writing": "#e2b53c" };

export default function SiteNav() {
  const path = usePathname();
  return (
    <header className="z-50 bg-paper/85 backdrop-blur-md md:sticky md:top-0">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:pl-28">
        <Link href="/" className="display text-lg text-ink">
          hari<span className="text-teal">.</span>
        </Link>
        <nav aria-label="Pages" className="flex flex-wrap items-center gap-2">
          {pages.map((p) =>
            p.href === "/interests" ? (
              <div key={p.href} className="group relative">
                <Link
                  href={p.href}
                  aria-current={path.startsWith(p.href) || interests.some((i) => path === i.href) ? "page" : undefined}
                  aria-haspopup="true"
                  className="route-tag"
                  style={{ ["--tag" as string]: p.color }}
                >
                  {p.label} <span className="text-dim transition-transform group-hover:translate-y-0.5">↓</span>
                </Link>
                <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="flex w-64 flex-col gap-1.5">
                    {interests.map((i) => (
                      <li key={i.href}>
                        <Link
                          href={i.href}
                          className={`menu-box block border border-line-strong bg-paper px-3 py-2.5 shadow-[2px_3px_0_rgba(21,23,26,0.1)] ${path === i.href ? "is-active" : ""}`}
                          style={{ ["--tag" as string]: colors[i.href] ?? "var(--teal-bright)" }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full border border-ink/40" style={{ background: "var(--tag)" }} />
                            <span className="display text-base text-ink">{i.label}</span>
                          </span>
                          <span className="mt-0.5 block font-mono text-[11px] leading-snug text-graphite">{i.note}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link key={p.href} href={p.href} aria-current={path === p.href ? "page" : undefined} className="route-tag" style={{ ["--tag" as string]: p.color }}>
                {p.label}
              </Link>
            ),
          )}
          <a href={profile.links.resume} target="_blank" rel="noreferrer" className="route-tag" style={{ ["--tag" as string]: "var(--ink)" }}>
            resume ↗
          </a>
        </nav>
      </div>
    </header>
  );
}

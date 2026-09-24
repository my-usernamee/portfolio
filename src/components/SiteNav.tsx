"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { interests, pages, profile } from "@/data/profile";

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
                {/* hover / focus menu */}
                <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="card w-72 p-2">
                    {interests.map((i) => (
                      <li key={i.href}>
                        <Link href={i.href} className={`block px-3 py-2 hover:bg-paper ${path === i.href ? "bg-paper" : ""}`}>
                          <span className="display text-base text-ink">{i.label}</span>
                          <span className="mt-0.5 block font-mono text-[11px] text-graphite">{i.note}</span>
                        </Link>
                      </li>
                    ))}
                    <li className="border-t border-line px-3 pb-1 pt-2">
                      <Link href="/interests" className="link-under font-mono text-[11px] text-dim hover:text-ink">
                        all of it →
                      </Link>
                    </li>
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

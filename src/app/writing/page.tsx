import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { manualPosts, mediumHandle, type Post } from "@/data/writing";

export const metadata: Metadata = { title: "writing" };
export const revalidate = 3600;

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

async function fetchMedium(handle: string): Promise<Post[]> {
  if (!handle) return [];
  try {
    const res = await fetch(`https://medium.com/feed/@${handle}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    return items.map((it) => {
      const get = (tag: string) => decode(it.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? "");
      const body = get("content:encoded") || get("description");
      return {
        title: get("title"),
        link: get("link").split("?")[0],
        date: new Date(get("pubDate")).toISOString().slice(0, 10),
        snippet: body.slice(0, 220) + (body.length > 220 ? "…" : ""),
        source: "medium" as const,
      };
    });
  } catch {
    return [];
  }
}

export default async function Writing() {
  const medium = await fetchMedium(mediumHandle);
  const posts = [...manualPosts, ...medium].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main>
      <PageHeader eyebrow="WRITING" title="notes & posts">
        Longer things I&apos;ve written. {mediumHandle ? "Pulled from Medium." : "Medium feed not connected yet."}
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        {posts.length === 0 ? (
          <div className="card max-w-xl p-6">
            <p className="font-mono text-xs tracking-[0.18em] text-teal">EMPTY GRID</p>
            <p className="mt-3 text-graphite">
              Nothing published yet. Set <code className="font-mono text-ink">mediumHandle</code> in{" "}
              <code className="font-mono text-ink">src/data/writing.ts</code> and posts appear here automatically, or add entries to{" "}
              <code className="font-mono text-ink">manualPosts</code>.
            </p>
          </div>
        ) : (
          <ul className="max-w-3xl divide-y divide-line">
            {posts.map((p) => (
              <li key={p.link} className="grid gap-2 py-6 sm:grid-cols-[120px_1fr]">
                <p className="font-mono text-xs text-dim">{p.date}</p>
                <div>
                  <a href={p.link} target="_blank" rel="noreferrer" className="display text-2xl text-ink hover:text-teal">
                    {p.title}
                  </a>
                  <p className="mt-2 text-sm text-graphite">{p.snippet}</p>
                  <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-dim">{p.source.toUpperCase()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

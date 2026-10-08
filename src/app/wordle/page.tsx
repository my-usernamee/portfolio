import type { Metadata } from "next";
import Wordle from "@/components/Wordle";

export const metadata: Metadata = {
  title: "wordle",
  description: "Rank your Wordle opener against all 12,972 allowed guesses, or let an entropy solver pick your next guess.",
};

// the title, spelled in tiles
const TITLE: [string, string][] = [
  ["w", "1"],
  ["o", "0"],
  ["r", "2"],
  ["d", "1"],
  ["l", "0"],
  ["e", "1"],
];

export default function WordlePage() {
  return (
    <main data-cursor="wordle">
      <header className="mx-auto max-w-6xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:pl-28">
        <p className="font-mono text-xs tracking-[0.18em] text-teal">A SMALL OBSESSION</p>
        <h1 className="mt-4 flex gap-1.5 sm:gap-2" aria-label="wordle">
          {TITLE.map(([ch, s], i) => (
            <span
              key={i}
              data-s={s}
              style={{ ["--i" as string]: i }}
              className="wt wt-flip grid h-12 w-12 place-items-center font-mono text-2xl font-medium uppercase sm:h-20 sm:w-20 sm:text-4xl"
              aria-hidden="true"
            >
              {ch}
            </span>
          ))}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-graphite">How good is your first word? I scored all 12,972 of them.</p>
      </header>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <Wordle />
        <p className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-graphite">
          <span className="text-dim">powered by my actual solver:</span>
          <a href="https://github.com/my-usernamee/wordle" target="_blank" rel="noreferrer" className="link-under text-ink">
            code ↗
          </a>
          <a href="https://medium.com/@thisisnotmygoooglemailid/solving-wordle-with-entropy-4f4b20fb710e" target="_blank" rel="noreferrer" className="link-under text-ink">
            the write-up ↗
          </a>
        </p>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// home page doorway to /wordle: tiles that keep flipping through openers with how they'd score
const WORDS: [string, string][] = [
  ["slate", "1"],
  ["crane", "1"],
  ["adieu", "2"],
  ["fuzzy", "0"],
];

export default function WordleTeaser() {
  const [k, setK] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setK((n) => (n + 1) % WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const [word, s] = WORDS[k];
  return (
    <Link
      href="/wordle"
      className="card lift group mt-7 flex w-fit max-w-full flex-wrap items-center gap-x-5 gap-y-3 p-3 pr-5 hover:border-ink"
      aria-label="Play: rank your Wordle opener"
    >
      <span className="flex gap-1" aria-hidden="true">
        {[...word].map((ch, i) => (
          <span key={`${word}${i}`} data-s={s} style={{ ["--i" as string]: i }} className="wt wt-flip grid h-9 w-9 place-items-center font-mono text-base font-medium uppercase">
            {ch}
          </span>
        ))}
      </span>
      <span>
        <span className="display block text-lg text-ink">what&apos;s your wordle opener?</span>
        <span className="font-mono text-xs text-teal">
          play <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </span>
    </Link>
  );
}

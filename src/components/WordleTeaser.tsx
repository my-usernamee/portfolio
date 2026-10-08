"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// small doorway to /wordle under the Wordle pointer: tiny tiles that keep flipping through openers
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
    <Link href="/wordle" className="group mt-2 flex w-fit items-center gap-2.5 text-xs text-teal">
      <span className="flex gap-0.5" aria-hidden="true">
        {[...word].map((ch, i) => (
          <span key={`${word}${i}`} data-s={s} style={{ ["--i" as string]: i }} className="wt wt-flip grid h-5 w-5 place-items-center !border text-[10px] uppercase">
            {ch}
          </span>
        ))}
      </span>
      <span className="link-under">
        check out my solver <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}

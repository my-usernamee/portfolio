"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// public/wordle/openers.json, built by scripts/wordle-openers.py. Columns in entropy-rank order.
type Openers = { answers: number; word: string[]; entropy: number[]; expected: number[]; patterns: number[]; answer: number[] };

// what /api/wordle (api/wordle.py) sends back
type Turn =
  | { status: "start" | "entropy" | "answers"; turn: number; remaining: number; possible: string[]; warnings: string[]; legal?: number; rows?: Row[] }
  | { status: "found" | "solved" | "none"; turn: number; answer?: string; warnings: string[] };
type Row = { word: string; entropy?: number; likelihood?: number; commonness: number };

const PICK = "slate"; // the opener the solver is simulated with: best two-step score
const fmt = (n: number) => n.toLocaleString("en-US");
const NEXT: Record<string, string> = { "0": "2", "2": "1", "1": "0" }; // grey → yellow → green

// same rules as feedback() in wordle_solver.py, only used to draw how an opener splits the answers
function feedback(guess: string, answer: string) {
  const res = ["0", "0", "0", "0", "0"];
  const counts: Record<string, number> = {};
  for (const ch of answer) counts[ch] = (counts[ch] ?? 0) + 1;
  // greens first
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      res[i] = "1";
      counts[guess[i]]--;
    }
  }
  // yellows second
  for (let i = 0; i < 5; i++) {
    if (res[i] === "0" && counts[guess[i]] > 0) {
      res[i] = "2";
      counts[guess[i]]--;
    }
  }
  return res.join("");
}

function tier(rank: number, total: number) {
  if (rank <= 10) return { label: "pole position", s: "1" };
  if (rank <= 100) return { label: "podium pace", s: "1" };
  if (rank <= 1000) return { label: "in the points", s: "2" };
  if (rank <= total / 2) return { label: "midfield", s: "2" };
  return { label: "backmarker", s: "0" };
}

export default function Wordle() {
  const [data, setData] = useState<Openers | null>(null);

  useEffect(() => {
    fetch("/wordle/openers.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="grid gap-8">
      <OpenerRank data={data} />
      <Solver />
    </div>
  );
}

function Tile({ ch, s, i = 0, anim = "", big }: { ch?: string; s?: string; i?: number; anim?: string; big?: boolean }) {
  return (
    <span
      data-s={s}
      style={{ ["--i" as string]: i }}
      className={`wt grid place-items-center font-mono font-medium uppercase ${anim} ${big ? "h-14 w-14 text-2xl sm:h-16 sm:w-16 sm:text-3xl" : "h-12 w-12 text-xl sm:h-14 sm:w-14"}`}
    >
      {ch ?? ""}
    </span>
  );
}

function MiniTiles({ fb, word }: { fb: string; word?: string }) {
  return (
    <span className="flex gap-0.5">
      {[...fb].map((s, i) => (
        <span key={i} data-s={s} className="wt grid h-5 w-5 place-items-center font-mono text-[10px] uppercase !border">
          {word?.[i] ?? ""}
        </span>
      ))}
    </span>
  );
}

function OpenerRank({ data }: { data: Openers | null }) {
  const [input, setInput] = useState("");
  const [word, setWord] = useState("");
  const [shake, setShake] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = data?.word.length ?? 12972;
  const idx = data && word ? data.word.indexOf(word) : -1;
  const pickIdx = data ? data.word.indexOf(PICK) : 5;
  const t = idx >= 0 ? tier(idx + 1, total) : null;

  const check = (w: string) => {
    const clean = w.trim().toLowerCase();
    setInput(clean);
    setCopied(false);
    if (data && !data.word.includes(clean)) {
      setWord("");
      setShake((n) => n + 1);
      return;
    }
    setWord(clean);
  };

  const share = async () => {
    const text = `My Wordle opener ${word.toUpperCase()} is #${fmt(idx + 1)} of ${fmt(total)} (${t?.label}). Hari's ${PICK.toUpperCase()} is #${pickIdx + 1}.`;
    const url = `${window.location.origin}/wordle`;
    try {
      if (navigator.share) await navigator.share({ text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
      }
    } catch {}
  };

  return (
    <section className="card relative overflow-hidden p-5 sm:p-8">
      <p className="font-mono text-[10px] tracking-[0.2em] text-teal">01 · RATE YOUR OPENER</p>
      <div className="mt-5 grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
        {/* the input is the tiles */}
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.length === 5) check(input);
            }}
          >
            <label key={shake} className={`relative flex w-fit cursor-text gap-1.5 ${shake ? "wt-shake" : ""}`}>
              {Array.from({ length: 5 }, (_, i) =>
                word && t && input === word ? (
                  <Tile key={`${word}${i}`} ch={word[i]} s={t.s} i={i} anim="wt-flip" big />
                ) : (
                  <Tile key={`${i}${input[i] ?? ""}`} ch={input[i]} s={input[i] ? "e" : undefined} anim={input[i] ? "wt-pop" : ""} big />
                ),
              )}
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value.replace(/[^a-z]/gi, "").slice(0, 5).toLowerCase());
                  setWord("");
                }}
                aria-label="type your opener"
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                className="absolute inset-0 cursor-text opacity-0"
              />
            </label>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="submit" disabled={input.length !== 5} className="route-tag !rotate-0 disabled:opacity-40" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
                rank it ↵
              </button>
              {["crane", "adieu", "audio", "soare"].map((w) => (
                <button key={w} type="button" onClick={() => check(w)} className="chip uppercase tracking-[0.15em] hover:bg-ink hover:text-paper">
                  {w}
                </button>
              ))}
            </div>
          </form>
          {input.length === 5 && !word && shake > 0 && <p className="mt-3 font-mono text-xs text-[#d9643a]">not a word wordle accepts</p>}
          {!word && input.length < 5 && <p className="mt-3 font-mono text-xs text-dim">← type a 5-letter word</p>}
        </div>

        {/* result, or a preview of the chart before anything's typed */}
        <div className="min-w-0">
          {data && idx >= 0 && t ? (
            <div>
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <p className="display text-6xl leading-none text-ink sm:text-7xl">#{fmt(idx + 1)}</p>
                <span data-s={t.s} className="wt -rotate-2 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em]">
                  {t.label}
                </span>
                <p className="font-mono text-xs text-dim">of {fmt(total)}</p>
              </div>
              <Histogram data={data} idx={idx} pickIdx={pickIdx} />
            </div>
          ) : (
            data && <Histogram data={data} idx={-1} pickIdx={pickIdx} />
          )}
        </div>
      </div>

      {data && idx >= 0 && (
        <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-[1fr_auto]">
          <Split data={data} word={word} />
          <div className="flex flex-col gap-3 md:w-56">
            {[
              ["answers left, on average", data.expected[idx].toFixed(0)],
              ["colour patterns", String(data.patterns[idx])],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-line pb-2">
                <p className="display text-3xl text-ink">{v}</p>
                <p className="font-mono text-[11px] text-dim">{k}</p>
              </div>
            ))}
            <button type="button" onClick={share} className="route-tag mt-2 w-fit !rotate-0" style={{ ["--tag" as string]: "var(--green)" }}>
              {copied ? "copied ✓" : "share your rank ↗"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// every opener's entropy as a histogram, with you, SLATE and the #1 pinned on it
function Histogram({ data, idx, pickIdx }: { data: Openers; idx: number; pickIdx: number }) {
  const W = 520;
  const H = 120;
  const N = 52;
  const { bins, lo, hi, peak } = useMemo(() => {
    const lo = Math.min(...data.entropy);
    const hi = Math.max(...data.entropy);
    const bins = new Array(N).fill(0);
    for (const e of data.entropy) bins[Math.min(N - 1, Math.floor(((e - lo) / (hi - lo)) * N))]++;
    return { bins, lo, hi, peak: Math.max(...bins) };
  }, [data]);
  const x = (e: number) => ((e - lo) / (hi - lo)) * W;
  const you = idx >= 0 ? data.entropy[idx] : null;
  return (
    <figure className="mt-6">
      <svg viewBox={`-6 -20 ${W + 12} ${H + 40}`} className="w-full overflow-visible" role="img" aria-label="How every opener scores">
        {bins.map((c, i) => {
          const h = (c / peak) * H;
          const binLo = lo + (i / N) * (hi - lo);
          const lit = you !== null && binLo <= you && you < lo + ((i + 1) / N) * (hi - lo) + 1e-9;
          return <rect key={i} x={(i / N) * W + 1} y={H - h} width={W / N - 2} height={h} fill={lit ? "var(--teal-bright)" : "var(--paper-3)"} />;
        })}
        <line x1={0} x2={W} y1={H} y2={H} stroke="var(--line-strong)" />
        {/* one row per label so they never sit on top of each other; text goes on the inner side of its line */}
        {[
          ...(you !== null ? [{ e: you, label: "you", strong: true }] : []),
          { e: data.entropy[pickIdx], label: PICK, strong: false },
          { e: data.entropy[0], label: data.word[0], strong: false },
        ].map((p, k) => {
          const px = x(p.e);
          const y = -6 + k * 15;
          const right = px > W * 0.6;
          return (
            <g key={p.label} transform={`translate(${px},0)`}>
              <line y1={y} y2={H} stroke={p.strong ? "var(--ink)" : "var(--teal)"} strokeWidth={p.strong ? 2 : 1} strokeDasharray={p.strong ? undefined : "2 3"} />
              <circle cy={y} r={p.strong ? 5 : 2.5} fill={p.strong ? "var(--teal-bright)" : "var(--teal)"} stroke={p.strong ? "var(--ink)" : "none"} strokeWidth={2} />
              <text
                x={right ? -9 : 9}
                y={y + 3.5}
                textAnchor={right ? "end" : "start"}
                className={`font-mono uppercase ${p.strong ? "fill-ink text-[12px] font-medium" : "fill-teal text-[10px]"}`}
              >
                {p.label}
              </text>
            </g>
          );
        })}
        <text x={0} y={H + 16} className="fill-dim font-mono text-[10px]">
          ← tells you less
        </text>
        <text x={W} y={H + 16} textAnchor="end" className="fill-dim font-mono text-[10px]">
          tells you more →
        </text>
      </svg>
      <figcaption className="sr-only">Histogram of entropy for all {data.word.length} allowed openers.</figcaption>
    </figure>
  );
}

// how the opener splits the answer list: the biggest colour patterns it can come back with
function Split({ data, word }: { data: Openers; word: string }) {
  const { top, more, total } = useMemo(() => {
    const answers = data.word.filter((_, i) => data.answer[i]);
    const buckets = new Map<string, number>();
    for (const a of answers) {
      const fb = feedback(word, a);
      buckets.set(fb, (buckets.get(fb) ?? 0) + 1);
    }
    const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
    return { top: sorted.slice(0, 6), more: sorted.length - 6, total: answers.length };
  }, [data, word]);
  const max = top[0]?.[1] ?? 1;

  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] text-dim">WHAT {word.toUpperCase()} USUALLY SHOWS YOU</p>
      <ul className="mt-3 grid gap-1.5">
        {top.map(([fb, n]) => (
          <li key={fb} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <MiniTiles fb={fb} word={word} />
            <span className="h-3 bg-paper-3">
              <span className="block h-full bg-teal-bright" style={{ width: `${(n / max) * 100}%` }} />
            </span>
            <span className="w-24 text-right font-mono text-[11px] text-graphite">
              {n} <span className="text-dim">words left</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-[11px] text-dim">
        + {more} rarer patterns · {fmt(total)} possible answers
      </p>
    </div>
  );
}

function Solver() {
  const [rows, setRows] = useState<{ word: string; fb: string }[]>([]);
  const [word, setWord] = useState(PICK);
  const [fb, setFb] = useState("00000");
  const [res, setRes] = useState<Turn | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const over = res?.status === "solved" || res?.status === "found" || res?.status === "none";
  const done = over || rows.length >= 6;

  const ask = async (history: { word: string; fb: string }[]) => {
    const r = await fetch("/api/wordle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: history.map((x) => [x.word, x.fb]) }),
    });
    const body = await r.json();
    if (!r.ok) throw new Error(body.error ?? "Something broke.");
    return body as Turn;
  };

  const submit = async () => {
    if (word.length !== 5 || busy) return;
    const next = [...rows, { word, fb }];
    setBusy(true);
    setError("");
    try {
      const body = await ask(next);
      setRows(next);
      setRes(body);
      if (body.status === "none") setShake((n) => n + 1);
      setWord("rows" in body ? (body.rows?.[0]?.word ?? "") : "");
      setFb("00000");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reach the solver.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setRows([]);
    setRes(null);
    setWord(PICK);
    setFb("00000");
    setError("");
  };

  const undo = async () => {
    const prev = rows.slice(0, -1);
    const last = rows[rows.length - 1];
    setRows(prev);
    setWord(last.word);
    setFb(last.fb);
    setError("");
    if (prev.length === 0) return setRes(null);
    setBusy(true);
    try {
      setRes(await ask(prev));
    } catch {
      setRes(null);
    } finally {
      setBusy(false);
    }
  };

  const tap = (i: number) => {
    if (!word[i]) return inputRef.current?.focus();
    setFb(fb.slice(0, i) + NEXT[fb[i]] + fb.slice(i + 1));
  };

  return (
    <section className="card relative overflow-hidden p-5 sm:p-8">
      <p className="font-mono text-[10px] tracking-[0.2em] text-teal">02 · STUCK ON TODAY&apos;S?</p>
      <div className="mt-5 grid gap-10 lg:grid-cols-[auto_1fr]">
        {/* the board */}
        <div>
          <div className="grid gap-1.5">
            {rows.map((r, k) => (
              <div key={k} className={`flex gap-1.5 ${k === rows.length - 1 && shake && res?.status === "none" ? "wt-shake" : ""}`}>
                {[...r.word].map((ch, i) => (
                  <Tile key={i} ch={ch} s={res?.status === "solved" && k === rows.length - 1 ? "1" : r.fb[i]} i={i} anim="wt-flip" />
                ))}
              </div>
            ))}
            {!done && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="relative flex gap-1.5"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={`${i}${word[i] ?? ""}`}
                    type="button"
                    onClick={() => tap(i)}
                    aria-label={word[i] ? `${word[i]}: tap to change colour` : "type a letter"}
                    className="cursor-pointer"
                  >
                    <Tile ch={word[i]} s={word[i] ? fb[i] : undefined} i={i} anim={busy ? "wt-think" : word[i] ? "wt-pop" : ""} />
                  </button>
                ))}
                <input
                  ref={inputRef}
                  value={word}
                  onChange={(e) => setWord(e.target.value.replace(/[^a-z]/gi, "").slice(0, 5).toLowerCase())}
                  aria-label="the word you played"
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  className="pointer-events-none absolute h-px w-px opacity-0"
                />
                <button type="submit" hidden />
              </form>
            )}
            {Array.from({ length: Math.max(0, 6 - rows.length - (done ? 0 : 1)) }, (_, k) => (
              <div key={k} className="flex gap-1.5 opacity-50">
                {Array.from({ length: 5 }, (_, i) => (
                  <Tile key={i} />
                ))}
              </div>
            ))}
          </div>

          {!done && (
            <>
              <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-graphite">
                tap a letter <MiniTiles fb="021" /> to match your game
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWord("");
                    setFb("00000");
                    inputRef.current?.focus();
                  }}
                  className="chip hover:bg-ink hover:text-paper"
                >
                  ✎ change word
                </button>
                <button type="button" onClick={submit} disabled={word.length !== 5 || busy} className="route-tag !rotate-0 disabled:opacity-40" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
                  {busy ? "thinking…" : "next guess →"}
                </button>
              </div>
            </>
          )}
          {(rows.length > 0 || res) && (
            <p className="mt-4 flex gap-4 font-mono text-xs">
              {rows.length > 0 && !busy && (
                <button type="button" onClick={undo} className="link-under text-graphite">
                  ↶ undo
                </button>
              )}
              <button type="button" onClick={reset} className="link-under text-graphite">
                start over
              </button>
            </p>
          )}
        </div>

        {/* what the solver says */}
        <div className="relative min-w-0">
          {error && <p className="font-mono text-xs text-[#d9643a]">{error}</p>}
          {!res && !error && <Intro />}
          {res && <Result res={res} pick={(w) => { setWord(w); setFb("00000"); }} />}
        </div>
      </div>
    </section>
  );
}

// before the first guess: three steps drawn as tiles
function Intro() {
  return (
    <ol className="grid gap-5">
      {[
        { fb: "00000", word: "slate", text: "type the word you played" },
        { fb: "00200", word: "slate", text: "tap tiles till the colours match" },
        { fb: "11111", word: "found", text: "get the best next guess" },
      ].map((s, k) => (
        <li key={k} className="flex items-center gap-4">
          <span className="display w-6 text-2xl text-teal">{k + 1}</span>
          <MiniTiles fb={k === 0 ? "eeeee" : s.fb} word={s.word} />
          <span className="font-mono text-xs text-graphite">{s.text}</span>
        </li>
      ))}
    </ol>
  );
}

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        x: `${Math.cos((i / 28) * Math.PI * 2) * (90 + (i % 5) * 30)}px`,
        y: `${Math.sin((i / 28) * Math.PI * 2) * (70 + (i % 4) * 25) - 40}px`,
        c: ["var(--green)", "#e2b53c", "var(--teal-bright)", "#8b9198"][i % 4],
        d: `${(i % 7) * 30}ms`,
      })),
    [],
  );
  return (
    <span className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={i} style={{ ["--x" as string]: b.x, ["--y" as string]: b.y, background: b.c, animationDelay: b.d }} />
      ))}
    </span>
  );
}

function Result({ res, pick }: { res: Turn; pick: (w: string) => void }) {
  const warn = res.warnings.length > 0 && <p className="mt-3 font-mono text-[11px] text-[#d9643a]">{res.warnings.join(" ")}</p>;

  if (res.status === "solved" || res.status === "found") {
    const answer = res.answer ?? "";
    return (
      <div className="relative">
        <Confetti />
        <p className="font-mono text-[10px] tracking-[0.2em] text-dim">{res.status === "solved" ? `SOLVED IN ${res.turn}` : "IT'S"}</p>
        <div className="mt-3 flex gap-1.5">
          {[...answer].map((ch, i) => (
            <Tile key={i} ch={ch} s="1" i={i} anim="wt-flip" big />
          ))}
        </div>
        {res.status === "found" && <p className="mt-3 font-mono text-xs text-graphite">only one word fits. go get it in {res.turn}.</p>}
        {warn}
      </div>
    );
  }
  if (res.status === "none")
    return (
      <div>
        <p className="display text-3xl text-ink">no word fits that.</p>
        <p className="mt-2 font-mono text-xs text-graphite">probably a tile colour is off. undo and check.</p>
        {warn}
      </div>
    );
  if (res.status !== "entropy" && res.status !== "answers") return null;

  const entropy = res.status === "entropy";
  const best = res.rows?.[0];
  const top = entropy ? (best?.entropy ?? 1) : (best?.likelihood ?? 1);

  return (
    <div>
      <div className="flex items-end gap-3">
        <p className="display text-6xl leading-none text-ink">{fmt(res.remaining)}</p>
        <p className="pb-1 font-mono text-xs text-graphite">words still possible</p>
      </div>
      {warn}
      <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-dim">{entropy ? "BEST NEXT GUESSES · TAP ONE" : "MOST LIKELY ANSWERS · TAP ONE"}</p>
      <ol className="mt-3 grid gap-1">
        {res.rows?.map((r, i) => {
          const v = entropy ? (r.entropy ?? 0) : (r.likelihood ?? 0);
          return (
            <li key={r.word}>
              <button type="button" onClick={() => pick(r.word)} className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 py-0.5 text-left">
                <MiniTiles fb={i === 0 ? "11111" : "eeeee"} word={r.word} />
                <span className="h-2 bg-paper-3">
                  <span className="block h-full bg-teal transition-colors group-hover:bg-teal-bright" style={{ width: `${(v / top) * 100}%` }} />
                </span>
                <span className="w-16 text-right font-mono text-[11px] text-dim">{entropy ? `${v.toFixed(2)} bits` : `${(v * 100).toFixed(0)}%`}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {res.possible.length > 0 && res.possible.length <= 30 && (
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-dim">
          could be: <span className="uppercase text-graphite">{res.possible.join(" · ")}</span>
        </p>
      )}
    </div>
  );
}

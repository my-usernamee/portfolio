"use client";

import { useEffect, useState } from "react";

// public/wordle/openers.json, built by scripts/wordle-openers.py. Columns in entropy-rank order.
type Openers = { answers: number; word: string[]; entropy: number[]; expected: number[]; patterns: number[]; answer: number[] };

// what /api/wordle (api/wordle.py) sends back
type Turn =
  | { status: "start" | "entropy" | "answers"; turn: number; remaining: number; possible: string[]; warnings: string[]; legal?: number; rows?: Row[] }
  | { status: "found" | "solved" | "none"; turn: number; answer?: string; warnings: string[] };
type Row = { word: string; entropy?: number; likelihood?: number; commonness: number };

const PICK = "slate"; // the opener the solver is simulated with: best two-step score
const fmt = (n: number) => n.toLocaleString("en-US");
const TILE: Record<string, string> = {
  "0": "bg-[#8b9198] border-[#8b9198] text-paper",
  "2": "bg-[#e2b53c] border-[#e2b53c] text-ink",
  "1": "bg-green border-green text-paper",
};
const NEXT: Record<string, string> = { "0": "2", "2": "1", "1": "0" }; // grey → yellow → green

export default function Wordle() {
  const [data, setData] = useState<Openers | null>(null);

  useEffect(() => {
    fetch("/wordle/openers.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <OpenerRank data={data} />
      <Solver />
    </div>
  );
}

function OpenerRank({ data }: { data: Openers | null }) {
  const [input, setInput] = useState("");
  const [word, setWord] = useState("");
  const [copied, setCopied] = useState(false);

  const idx = data && word ? data.word.indexOf(word) : -1;
  const total = data?.word.length ?? 12972;
  const pickRank = data ? data.word.indexOf(PICK) + 1 : 6;
  const at = (rank: number) => (Math.log(rank) / Math.log(total)) * 100;

  const check = (w: string) => {
    const clean = w.trim().toLowerCase();
    setInput(clean);
    setWord(clean);
    setCopied(false);
  };

  const share = async () => {
    const text = `My Wordle opener ${word.toUpperCase()} ranks #${fmt(idx + 1)} of ${fmt(total)} by entropy. Hari's ${PICK.toUpperCase()} is #${pickRank}.`;
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
    <section className="card p-5 sm:p-6 lg:col-span-5">
      <p className="font-mono text-[10px] tracking-[0.2em] text-teal">01 · RATE YOUR OPENER</p>
      <h2 className="display mt-2 text-3xl text-ink">How good is your first guess?</h2>
      <p className="mt-2 text-sm text-graphite">
        Every allowed guess, scored against all {fmt(data?.answers ?? 2315)} possible answers. Higher entropy means the first row tells you more.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          check(input);
        }}
        className="mt-5 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^a-z]/gi, "").slice(0, 5))}
          placeholder="crane"
          aria-label="your opener"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          className="w-full min-w-0 border border-line-strong bg-paper px-3 py-2 font-mono text-lg uppercase tracking-[0.3em] text-ink outline-none focus:border-teal"
        />
        <button type="submit" disabled={input.length !== 5} className="route-tag !rotate-0 shrink-0 disabled:opacity-40" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
          rank it
        </button>
      </form>
      <p className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px] text-dim">
        try
        {["crane", "adieu", "audio", "stare", "soare"].map((w) => (
          <button key={w} type="button" onClick={() => check(w)} className="chip hover:bg-ink hover:text-paper">
            {w}
          </button>
        ))}
      </p>

      {word.length === 5 && data && idx === -1 && (
        <p className="mt-6 font-mono text-sm text-graphite">&apos;{word}&apos; is not in the allowed guess list.</p>
      )}

      {data && idx >= 0 && (
        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="display text-5xl text-ink">#{fmt(idx + 1)}</p>
            <p className="text-right font-mono text-xs text-graphite">
              of {fmt(total)}
              <br />
              better than {(((total - idx - 1) / total) * 100).toFixed(1)}%
            </p>
          </div>

          {/* where it sits in the whole list, log scale so the top hundred isn't one pixel */}
          <div className="relative mt-7 h-8 border-y border-line">
            {[1, 10, 100, 1000, 10000].map((r) => (
              <span key={r} className="absolute top-full mt-1 -translate-x-1/2 font-mono text-[10px] text-dim" style={{ left: `${at(r)}%` }}>
                {r === 1 ? "#1" : fmt(r)}
              </span>
            ))}
            {[
              { r: 1, label: data.word[0] },
              { r: pickRank, label: PICK },
            ].map((m, k) => (
              <span key={m.label} className="absolute top-0 h-full" style={{ left: `${at(m.r)}%` }}>
                <span className="block h-full w-px bg-teal" />
                <span className={`absolute bottom-full mb-0.5 font-mono text-[10px] uppercase text-teal ${k ? "-translate-x-1/2" : ""}`}>{m.label}</span>
              </span>
            ))}
            <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-teal-bright" style={{ left: `${at(idx + 1)}%` }} />
          </div>
          <p className="mt-6" />

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs">
            {[
              ["entropy", `${data.entropy[idx].toFixed(3)} bits`],
              ["answers left, avg", data.expected[idx].toFixed(1)],
              ["feedback patterns", String(data.patterns[idx])],
              ["can be the answer", data.answer[idx] ? "yes" : "no"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-line py-1.5">
                <dt className="text-dim">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <table className="mt-5 w-full font-mono text-xs">
            <tbody>
              {data.word.slice(Math.max(idx - 2, 0), idx + 3).map((w, k) => {
                const r = Math.max(idx - 2, 0) + k;
                return (
                  <tr key={w} className={r === idx ? "text-ink" : "text-graphite"} style={r === idx ? { background: "var(--teal-soft)" } : undefined}>
                    <td className="py-1 pl-2 text-dim">#{fmt(r + 1)}</td>
                    <td className="py-1 uppercase tracking-[0.2em]">{w}</td>
                    <td className="py-1 pr-2 text-right">{data.entropy[r].toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button type="button" onClick={share} className="link-under mt-5 font-mono text-xs text-teal">
            {copied ? "copied ✓" : "share your rank ↗"}
          </button>
        </div>
      )}

      {!word && (
        <p className="mt-6 font-mono text-xs text-graphite">
          The top of the list is <span className="text-ink">SOARE</span>. I open with <span className="text-ink">{PICK.toUpperCase()}</span> (#{pickRank}): it
          has the best two-step score, so the second guess does more work.
        </p>
      )}
    </section>
  );
}

function Solver() {
  const [rows, setRows] = useState<{ word: string; fb: string }[]>([]);
  const [word, setWord] = useState(PICK);
  const [fb, setFb] = useState("00000");
  const [res, setRes] = useState<Turn | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const done = res?.status === "solved" || res?.status === "found" || res?.status === "none" || rows.length >= 6;

  const submit = async () => {
    if (word.length !== 5 || busy) return;
    const next = [...rows, { word, fb }];
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/wordle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: next.map((x) => [x.word, x.fb]) }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "Something broke.");
      setRows(next);
      setRes(body);
      const top = body.rows?.[0]?.word ?? "";
      setWord(top);
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
      const r = await fetch("/api/wordle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ history: prev.map((x) => [x.word, x.fb]) }) });
      setRes(await r.json());
    } catch {
      setRes(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card p-5 sm:p-6 lg:col-span-7">
      <p className="font-mono text-[10px] tracking-[0.2em] text-teal">02 · STUCK ON TODAY&apos;S?</p>
      <h2 className="display mt-2 text-3xl text-ink">Ask the solver</h2>
      <p className="mt-2 text-sm text-graphite">
        Type what you played, tap the tiles to match the colours you got, and it ranks your next guess. It plays hard mode, so greens stay put and yellows get reused.
      </p>

      <div className="mt-5 grid gap-1.5">
        {rows.map((r, i) => (
          <Tiles key={i} word={r.word} fb={r.fb} />
        ))}
        {!done && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="grid gap-3"
          >
            <Tiles word={word} fb={fb} onTap={(i) => setFb(fb.slice(0, i) + NEXT[fb[i]] + fb.slice(i + 1))} editable />
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={word}
                onChange={(e) => setWord(e.target.value.replace(/[^a-z]/gi, "").slice(0, 5).toLowerCase())}
                aria-label="the word you played"
                placeholder="word you played"
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                className="w-40 border border-line-strong bg-paper px-3 py-2 font-mono uppercase tracking-[0.3em] text-ink outline-none focus:border-teal"
              />
              <button type="submit" disabled={word.length !== 5 || busy} className="route-tag !rotate-0 disabled:opacity-40" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
                {busy ? "thinking…" : "next guess →"}
              </button>
              <span className="font-mono text-[11px] text-dim">tap a tile: grey → yellow → green</span>
            </div>
          </form>
        )}
      </div>

      {error && <p className="mt-4 font-mono text-xs text-[#d9643a]">{error}</p>}
      {busy && (
        <p className="mt-4 font-mono text-xs text-graphite">
          {rows.length === 0 ? "scoring every legal guess against what's left…" : "re-running the board…"}
        </p>
      )}

      {res && !busy && <Result res={res} pick={(w) => { setWord(w); setFb("00000"); }} />}

      {(rows.length > 0 || res) && (
        <p className="mt-5 flex gap-4 font-mono text-xs">
          {rows.length > 0 && (
            <button type="button" onClick={undo} className="link-under text-graphite">
              undo
            </button>
          )}
          <button type="button" onClick={reset} className="link-under text-graphite">
            start over
          </button>
        </p>
      )}
    </section>
  );
}

function Result({ res, pick }: { res: Turn; pick: (w: string) => void }) {
  const warn = res.warnings.length > 0 && <p className="mt-2 font-mono text-[11px] text-[#d9643a]">{res.warnings.join(" ")}</p>;

  if (res.status === "solved")
    return (
      <div className="mt-5">
        <p className="display text-2xl text-ink">Solved in {res.turn} turns.</p>
        {warn}
      </div>
    );
  if (res.status === "none")
    return (
      <div className="mt-5">
        <p className="font-mono text-sm text-ink">No answers left. Feedback was probably wrong.</p>
        {warn}
      </div>
    );
  if (res.status === "found")
    return (
      <div className="mt-5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-dim">ANSWER FOUND</p>
        <p className="display mt-1 text-4xl uppercase tracking-[0.1em] text-ink">{res.answer}</p>
        <p className="mt-1 font-mono text-xs text-graphite">solved logically in {res.turn} turns.</p>
        {warn}
      </div>
    );
  if (res.status !== "entropy" && res.status !== "answers") return null;

  const entropy = res.status === "entropy";
  return (
    <div className="mt-6">
      <p className="font-mono text-xs text-graphite">
        <span className="text-ink">{fmt(res.remaining)}</span> possible answers left
        {entropy ? (
          <>
            {" "}· <span className="text-ink">{fmt(res.legal ?? 0)}</span> legal hard-mode guesses, ranked by entropy
          </>
        ) : (
          " · small pool, so these are ranked by how common the word is"
        )}
      </p>
      {warn}
      <ol className="mt-3 divide-y divide-line border-y border-line">
        {res.rows?.map((r, i) => (
          <li key={r.word}>
            <button type="button" onClick={() => pick(r.word)} className="grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 px-1 py-1.5 text-left font-mono text-xs hover:bg-paper-3">
              <span className="text-dim">{i + 1}.</span>
              <span className="uppercase tracking-[0.25em] text-ink">{r.word}</span>
              <span className="text-graphite">
                {entropy ? `${r.entropy!.toFixed(3)} bits` : `${(r.likelihood! * 100).toFixed(1)}%`}
                <span className="ml-3 text-dim">common {(r.commonness * 100).toFixed(0)}%</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      {res.possible.length > 0 && (
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-dim">
          could still be: <span className="uppercase text-graphite">{res.possible.join(", ")}</span>
        </p>
      )}
    </div>
  );
}

function Tiles({ word, fb, onTap, editable }: { word: string; fb: string; onTap?: (i: number) => void; editable?: boolean }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }, (_, i) => {
        const ch = word[i];
        const cls = ch ? TILE[fb[i]] : "border-line-strong bg-paper text-ink";
        return (
          <button
            key={i}
            type="button"
            disabled={!editable || !ch}
            onClick={() => onTap?.(i)}
            aria-label={ch ? `${ch}, ${{ "0": "grey", "2": "yellow", "1": "green" }[fb[i]]}` : "empty"}
            className={`grid h-12 w-12 place-items-center border-2 font-mono text-xl font-medium uppercase transition-colors sm:h-14 sm:w-14 ${cls} ${editable && ch ? "cursor-pointer" : "cursor-default"}`}
          >
            {ch ?? ""}
          </button>
        );
      })}
    </div>
  );
}

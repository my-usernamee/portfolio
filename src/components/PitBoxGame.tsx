"use client";

import { useState, useSyncExternalStore } from "react";
import PitLane, { PIT_BOX } from "./PitLane";

// 404 game: park the car as close to the centre of the box as you can. Best five attempts in this browser.
const KEY = "hari-pitbox-board";
type Entry = { name: string; off: number; at: number };

function grade(off: number) {
  if (off < 1) return "perfect stop. the mechanics didn't even flinch.";
  if (off < 3) return "clean. jack goes up.";
  if (off < 6) return "close enough. the crew shuffles over.";
  if (off <= (PIT_BOX.to - PIT_BOX.from) / 2) return "in the box, just. someone's getting shouted at.";
  return "missed the box. drive-through penalty.";
}

const noop = () => () => {};
const readBoard = () => {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
const readName = () => {
  try {
    return localStorage.getItem("hari-pitbox-name") ?? "";
  } catch {
    return "";
  }
};

export default function PitBoxGame() {
  const storedBoard = useSyncExternalStore(noop, readBoard, () => "[]");
  const storedName = useSyncExternalStore(noop, readName, () => "");
  const [boardState, setBoard] = useState<Entry[] | null>(null);
  const board: Entry[] = boardState ?? (JSON.parse(storedBoard) as Entry[]);
  const [last, setLast] = useState<{ off: number; inBox: boolean } | null>(null);
  const [nameState, setName] = useState<string | null>(null);
  const name = nameState ?? storedName;
  const [pendingOff, setPendingOff] = useState<number | null>(null);
  const [tries, setTries] = useState(0);

  const save = (entries: Entry[]) => {
    const top = [...entries].sort((a, b) => a.off - b.off).slice(0, 5);
    setBoard(top);
    try {
      localStorage.setItem(KEY, JSON.stringify(top));
    } catch {
      /* ignore */
    }
  };

  const onRelease = (pct: number, off: number) => {
    const inBox = pct >= PIT_BOX.from && pct <= PIT_BOX.to;
    setLast({ off, inBox });
    setTries((t) => t + 1);
    if (!inBox) return;
    const qualifies = board.length < 5 || off < board[board.length - 1].off;
    if (qualifies) setPendingOff(off);
  };

  const commit = () => {
    if (pendingOff === null) return;
    const n = (name.trim() || "???").slice(0, 3).toUpperCase();
    try {
      localStorage.setItem("hari-pitbox-name", n);
    } catch {
      /* ignore */
    }
    save([...board, { name: n, off: pendingOff, at: Date.now() }]);
    setPendingOff(null);
  };

  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="card p-5 md:col-span-7">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-dim">
          <span>WHILE YOU&apos;RE HERE</span>
          <span>{tries ? `${tries} ${tries === 1 ? "try" : "tries"}` : "PIT STOP PRACTICE"}</span>
        </div>
        <h2 className="display mt-3 text-2xl text-ink">
          park it dead centre of the <span className="hl">pit box</span>
        </h2>
        <p className="mt-1 font-mono text-xs text-graphite">drag the car right and let go. closer to the middle is better.</p>
        <PitLane onPass={() => {}} onMiss={() => {}} onStart={() => setLast(null)} onRelease={onRelease} />
        <p className="mt-2 min-h-5 font-mono text-xs" aria-live="polite">
          {last && (
            <>
              <span className={last.inBox ? "text-teal" : "text-[#c0392b]"}>{last.off.toFixed(1)}% off centre.</span> <span className="text-graphite">{grade(last.off)}</span>
            </>
          )}
        </p>
        {pendingOff !== null && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commit();
            }}
            className="mt-3 flex items-center gap-2 font-mono text-xs"
          >
            <span className="text-teal">top 5.</span>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 3))} placeholder="AAA" maxLength={3} aria-label="your initials" className="w-14 border border-line-strong bg-paper px-2 py-1 uppercase tracking-[0.2em] text-ink outline-none focus:border-teal" />
            <button type="submit" className="route-tag !rotate-0" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
              save
            </button>
          </form>
        )}
      </div>
      <div className="card p-5 md:col-span-5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-dim">BEST STOPS · THIS BROWSER</p>
        {board.length === 0 ? (
          <p className="mt-4 font-mono text-xs text-graphite">nobody&apos;s parked yet.</p>
        ) : (
          <ol className="mt-3 divide-y divide-line font-mono text-sm">
            {board.map((e, i) => (
              <li key={e.at} className="flex items-center gap-3 py-2">
                <span className="w-6 text-dim">P{i + 1}</span>
                <span className="tracking-[0.2em] text-ink">{e.name}</span>
                <span className="ml-auto text-graphite">{e.off.toFixed(1)}% off</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

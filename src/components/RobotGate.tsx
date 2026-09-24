"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import PitLane from "./PitLane";
import { CarSvg } from "./ScrollCar";

const KEY = "hari-gate-passed";

type Kind = "car" | "sub" | "hold" | "tyre";

function SubSvg() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <g stroke="var(--ink)" strokeWidth="1.6" fill="var(--paper)" strokeLinejoin="round" strokeLinecap="round">
        <rect x="8" y="26" width="44" height="18" rx="9" />
        <rect x="24" y="16" width="14" height="10" rx="2" />
        <path d="M31 16 V10" />
        <circle cx="20" cy="35" r="3" fill="var(--teal-bright)" />
        <circle cx="31" cy="35" r="3" fill="var(--teal-bright)" />
        <path d="M52 32 L60 26 V44 L52 38" />
      </g>
    </svg>
  );
}
function HoldSvg() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <path d="M14 40 C6 30 12 14 28 14 C44 14 54 28 46 40 C40 50 22 52 14 40 Z" fill="#3f9a5a" stroke="var(--ink)" strokeWidth="1.6" />
      <circle cx="30" cy="30" r="2" fill="var(--ink)" opacity="0.5" />
    </svg>
  );
}
function TyreSvg() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill="var(--ink)" stroke="var(--ink)" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="11" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="4" fill="var(--teal-bright)" />
      <path d="M32 10 A22 22 0 0 1 54 32" stroke="var(--teal-bright)" strokeWidth="3" fill="none" />
    </svg>
  );
}

function Tile({ kind }: { kind: Kind }) {
  if (kind === "car") return <CarSvg className="h-full w-full -rotate-90" />;
  if (kind === "sub") return <SubSvg />;
  if (kind === "hold") return <HoldSvg />;
  return <TyreSvg />;
}

const names: Record<Kind, string> = { car: "race car", sub: "submarine", hold: "climbing hold", tyre: "tyre" };

function shuffle<T>(a: T[]) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function makeGrid(): Kind[] {
  const cars = 2 + Math.floor(Math.random() * 3); // 2-4 cars
  const others: Kind[] = ["sub", "hold", "tyre"];
  const rest = Array.from({ length: 9 - cars }, (_, i) => others[i % 3]);
  return shuffle([...Array<Kind>(cars).fill("car"), ...rest]);
}

const noop = () => () => {};
const readGate = () => {
  try {
    return !localStorage.getItem(KEY);
  } catch {
    return false;
  }
};
const readCoarse = () => (typeof window !== "undefined" ? window.matchMedia("(pointer: coarse), (max-width: 767px)").matches : false);

export default function RobotGate() {
  const shouldGate = useSyncExternalStore(noop, readGate, () => false);
  const coarse = useSyncExternalStore(noop, readCoarse, () => false);
  const [dismissed, setDismissed] = useState(false);
  const open = shouldGate && !dismissed;
  const [seed, setSeed] = useState(0);
  const grid = useMemo(() => makeGrid(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const toggle = (i: number) => {
    setMsg(null);
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const verify = () => {
    const cars = new Set(grid.map((k, i) => (k === "car" ? i : -1)).filter((i) => i >= 0));
    const wrong = [...picked].find((i) => !cars.has(i));
    if (wrong !== undefined) {
      setMsg(`that's a ${names[grid[wrong]]}.`);
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    if (picked.size < cars.size) {
      setMsg(`missed ${cars.size - picked.size}. lidar would've caught that.`);
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    setPassed(true);
    setTimeout(close, 1300);
  };

  const reset = () => {
    setPicked(new Set());
    setMsg(null);
    setSeed((s) => s + 1);
  };

  const pitPass = () => {
    setMsg(null);
    setPassed(true);
    setTimeout(close, 1300);
  };
  const pitMiss = (m: string) => {
    setMsg(m);
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="gate-title" className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className={`card w-full max-w-sm bg-paper p-5 ${shake ? "gate-shake" : ""}`}>
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-dim">
          <span>PIT LANE ENTRY</span>
          <span className="text-teal">SECURITY CHECK</span>
        </div>
        {passed ? (
          <div className="py-10 text-center">
            <p className="display text-3xl text-ink">verified.</p>
            <p className="mt-2 font-mono text-xs text-graphite">human, or a very good robot. both welcome.</p>
          </div>
        ) : coarse ? (
          <>
            <h2 id="gate-title" className="display mt-3 text-2xl text-ink">
              park it in the <span className="hl">pit box</span>
            </h2>
            <p className="mt-1 font-mono text-xs text-graphite">touch anywhere on the lane, slide the car right, let go in the box.</p>
            <PitLane onPass={pitPass} onMiss={pitMiss} onStart={() => setMsg(null)} />
            <p className="mt-2 h-5 font-mono text-xs text-teal" aria-live="polite">
              {msg ?? ""}
            </p>
            <div className="mt-2">
              <button type="button" onClick={close} className="link-under py-2 font-mono text-[11px] text-dim hover:text-ink">
                skip, i&apos;m in a hurry
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="gate-title" className="display mt-3 text-2xl text-ink">
              select all tiles with a <span className="hl">race car</span>
            </h2>
            <p className="mt-1 font-mono text-xs text-graphite">robots welcome, but prove you can tell a car from a submarine.</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {grid.map((k, i) => {
                const on = picked.has(i);
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={on}
                    aria-label={`tile ${i + 1}`}
                    onClick={() => toggle(i)}
                    className={`aspect-square border p-3 transition ${on ? "border-teal bg-teal/15" : "border-line-strong bg-paper-2 hover:bg-paper"}`}
                  >
                    <Tile kind={k} />
                  </button>
                );
              })}
            </div>
            <p className="mt-3 h-5 font-mono text-xs text-teal" aria-live="polite">
              {msg ?? ""}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-3 font-mono text-[11px]">
                <button type="button" onClick={reset} className="link-under text-graphite hover:text-ink">
                  new tiles
                </button>
                <button type="button" onClick={close} className="link-under text-dim hover:text-ink">
                  skip, i&apos;m in a hurry
                </button>
              </div>
              <button
                type="button"
                onClick={verify}
                disabled={picked.size === 0}
                className="route-tag !rotate-0 disabled:opacity-40"
                style={{ ["--tag" as string]: "var(--teal-bright)" }}
              >
                verify
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

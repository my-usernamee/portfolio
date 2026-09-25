"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// Climbing holds sprinkled at random positions across a section. Hover one and the cursor becomes a hand.
// Positions are picked once per page load on the client so the server never renders anything to mismatch.

type HoldProps = { color?: string; rotate?: number; size?: number; kind?: "jug" | "crimp" | "sloper" };

export function Hold({ color = "#3f9a5a", rotate = 0, size = 34, kind = "jug" }: HoldProps) {
  const d =
    kind === "crimp"
      ? "M6 30 C10 14 26 8 40 10 C54 12 60 22 56 30 C50 36 12 36 6 30 Z"
      : kind === "sloper"
        ? "M8 36 C8 20 20 12 32 12 C44 12 56 20 56 36 C56 40 8 40 8 36 Z"
        : "M14 40 C6 30 12 14 28 14 C44 14 54 28 46 40 C40 50 22 52 14 40 Z";
  return (
    <svg
      data-hold=""
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ transform: `rotate(${rotate}deg)` }}
      className="hold"
      aria-hidden="true"
    >
      <path d={d} fill={color} stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="30" cy="28" r="2" fill="var(--ink)" opacity="0.5" />
    </svg>
  );
}

const COLORS = ["#3f9a5a", "#e8843a", "#3b6fd6", "#f2c94c", "#d63b3b", "#7b4fb8"];
const KINDS: HoldProps["kind"][] = ["jug", "crimp", "sloper"];

type Placed = { side: "left" | "right"; u: number; v: number; color: string; rotate: number; size: number; kind: HoldProps["kind"] };

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Scatter n holds in the gutters either side of the content column, never over text.
// Colours and shapes come from a per-page-load seed; x positions are measured from the layout
// on mount and resize so they track whatever width the content column ends up with.
function scatter(n: number, seed: number): Placed[] {
  const rnd = seeded(seed);
  const out: Placed[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      side: rnd() < 0.5 ? "left" : "right",
      u: rnd(),
      v: 0.04 + rnd() * 0.9,
      color: COLORS[Math.floor(rnd() * COLORS.length)],
      rotate: -40 + rnd() * 80,
      size: 22 + Math.floor(rnd() * 18),
      kind: KINDS[Math.floor(rnd() * KINDS.length)],
    });
  }
  return out;
}

// one random seed per page load, shared by every field so re-renders don't reshuffle
let pageSeed = 0;
const subscribe = () => () => {};
const getSeed = () => {
  if (!pageSeed) pageSeed = Math.floor(Math.random() * 1e9) || 1;
  return pageSeed;
};
const EMPTY: Placed[] = [];
const cache = new Map<string, Placed[]>();

export function HoldField({ n = 5, seed, className = "" }: { n?: number; seed?: number; className?: string }) {
  const s = useSyncExternalStore(subscribe, () => seed ?? getSeed(), () => 0);
  const key = `${n}:${s}`;
  let holds = EMPTY;
  if (s) {
    if (!cache.has(key)) cache.set(key, scatter(n, s));
    holds = cache.get(key)!;
  }
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || holds.length === 0) return;
    const place = () => {
      const parent = el.parentElement;
      if (!parent) return;
      const box = parent.classList.contains("max-w-6xl") ? parent : (parent.querySelector<HTMLElement>(".max-w-6xl") ?? parent);
      const rect = box.getBoundingClientRect();
      const prect = parent.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(box).paddingLeft) || 0;
      const vw = window.innerWidth;
      const leftMin = 112; // clear of the road
      const leftMax = rect.left + pad - 48;
      const rightMin = rect.right + 12;
      const rightMax = vw - 56;
      const leftOk = leftMax - leftMin > 28;
      const rightOk = rightMax - rightMin > 28;
      Array.from(el.children).forEach((c, i) => {
        const span = c as HTMLElement;
        const h = holds[i];
        if (!h) return;
        let side = h.side;
        if (side === "left" && !leftOk) side = "right";
        if (side === "right" && !rightOk) side = "left";
        if (!leftOk && !rightOk) {
          span.style.display = "none";
          return;
        }
        const x = side === "left" ? leftMin + h.u * (leftMax - leftMin) : rightMin + h.u * (rightMax - rightMin);
        span.style.display = "";
        span.style.left = `${x - prect.left}px`;
        span.style.top = `${h.v * 100}%`;
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [holds]);

  const phoneSpots = [{ right: 6, top: "9%" }, { left: 4, top: "38%" }, { right: 8, top: "71%" }] as const;
  return (
    <>
      <div ref={root} className={`pointer-events-none absolute inset-0 hidden lg:block ${className}`} aria-hidden="true">
        {holds.map((h, i) => (
          <span key={i} className="pointer-events-auto absolute" style={{ display: "none" }}>
            <Hold color={h.color} rotate={h.rotate} size={h.size} kind={h.kind} />
          </span>
        ))}
      </div>
      {/* phones: a few holds along the edges, behind the content, so the tilt has something to move */}
      <div className="pointer-events-none absolute inset-0 -z-10 lg:hidden" aria-hidden="true">
        {holds.slice(0, 3).map((h, i) => (
          <span key={i} className="tilt-far absolute" style={{ ...phoneSpots[i] }}>
            <Hold color={h.color} rotate={h.rotate} size={Math.min(h.size, 26)} kind={h.kind} />
          </span>
        ))}
      </div>
    </>
  );
}

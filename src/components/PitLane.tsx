"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CarSvg } from "./ScrollCar";

// Phone check: drag the car along the lane and let go inside the pit box.
// The whole lane strip is the touch target, so a tap anywhere grabs the car and it snaps under the finger.
const START = 8; // % of lane width, car centre
const BOX = { from: 62, to: 82 }; // forgiving box, car centre must land inside

type Props = { onPass: () => void; onMiss: (msg: string) => void; onStart?: () => void; onRelease?: (pct: number, offCentre: number) => void };

export const PIT_BOX = BOX;

export default function PitLane({ onPass, onMiss, onStart, onRelease }: Props) {
  const lane = useRef<HTMLDivElement>(null);
  const xRef = useRef(START);
  const [x, setX] = useState(START);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const wasInBox = useRef(false);

  const inBox = x >= BOX.from && x <= BOX.to;

  const move = useCallback((clientX: number) => {
    const r = lane.current?.getBoundingClientRect();
    if (!r) return;
    const pct = Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100));
    xRef.current = pct;
    setX(pct);
    const nowIn = pct >= BOX.from && pct <= BOX.to;
    if (nowIn && !wasInBox.current && "vibrate" in navigator) navigator.vibrate?.(15);
    wasInBox.current = nowIn;
  }, []);

  const release = useCallback(() => {
    const v = xRef.current;
    if (onRelease) {
      onRelease(v, Math.abs(v - (BOX.from + BOX.to) / 2));
      window.setTimeout(() => {
        xRef.current = START;
        setX(START);
        wasInBox.current = false;
      }, 900);
      return;
    }
    if (v >= BOX.from && v <= BOX.to) {
      onPass();
      return;
    }
    onMiss(v > BOX.to ? "box box box. you overshot the pit box." : v < 30 ? "you haven't left the garage. drag it right." : "not quite. a bit further.");
    // roll back to the start so the next try is obvious
    window.setTimeout(() => {
      xRef.current = START;
      setX(START);
      wasInBox.current = false;
    }, 350);
  }, [onPass, onMiss, onRelease]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    lane.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    setTouched(true);
    onStart?.();
    move(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging) move(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    lane.current?.releasePointerCapture(e.pointerId);
    setDragging(false);
    release();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setTouched(true);
      const next = Math.min(96, Math.max(4, xRef.current + (e.key === "ArrowRight" ? 5 : -5)));
      xRef.current = next;
      setX(next);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      release();
    }
  };

  // stop the page scrolling under the finger while dragging on iOS
  useEffect(() => {
    const el = lane.current;
    if (!el) return;
    const block = (ev: TouchEvent) => ev.preventDefault();
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, []);

  return (
    <div
      ref={lane}
      role="slider"
      tabIndex={0}
      aria-label="drag the car into the pit box"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(x)}
      aria-valuetext={inBox ? "inside the pit box" : "outside the pit box"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className="relative mt-6 h-28 cursor-grab touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-teal active:cursor-grabbing"
    >
      {/* lane */}
      <div className="absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 border-y border-dashed border-line-strong bg-paper-2" />
      {/* direction chevrons */}
      <div className="pointer-events-none absolute top-1/2 flex -translate-y-1/2 gap-3 font-mono text-sm text-line-strong" style={{ left: "22%" }} aria-hidden="true">
        <span>›</span>
        <span>›</span>
        <span>›</span>
        <span>›</span>
      </div>
      {/* pit box */}
      <div
        className={`pointer-events-none absolute top-1/2 h-16 -translate-y-1/2 border-2 transition-colors ${
          inBox ? "border-teal bg-teal/30" : "border-teal/70 bg-teal/10"
        } ${!touched ? "pit-pulse" : ""}`}
        style={{ left: `${BOX.from}%`, width: `${BOX.to - BOX.from}%` }}
      >
        <span className="absolute -top-5 left-0 font-mono text-[10px] tracking-[0.2em] text-teal">{inBox && dragging ? "LET GO" : "BOX"}</span>
      </div>
      {/* car */}
      <div
        className={`pointer-events-none absolute top-1/2 flex h-12 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${
          dragging ? "" : "transition-[left] duration-300 ease-out"
        }`}
        style={{ left: `${x}%` }}
      >
        <CarSvg className={`h-[72px] w-[38px] -rotate-90 transition-transform ${dragging ? "scale-110" : ""}`} />
      </div>
      {/* first-time hint */}
      {!touched && (
        <div className="pointer-events-none absolute bottom-0 flex items-center gap-1 font-mono text-[11px] text-teal pit-hint" style={{ left: `${START}%` }} aria-hidden="true">
          <span className="text-base">☝</span> drag →
        </div>
      )}
    </div>
  );
}

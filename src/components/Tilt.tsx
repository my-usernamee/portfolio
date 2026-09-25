"use client";

import { useEffect } from "react";

// Touch devices only: the phone's tilt nudges the polaroids, cards, and holds a few pixels.
// Reads the gyroscope, takes the first reading as "level", and writes --tx / --ty (-1..1) to <html>.
// iOS needs permission from a tap, so the first touch on the page asks once.
export default function Tilt() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let base: { b: number; g: number } | null = null;
    let tx = 0, ty = 0, gx = 0, gy = 0, raf = 0, on = false;
    const RANGE = 18; // degrees of tilt that maps to a full nudge

    const tick = () => {
      raf = 0;
      tx += (gx - tx) * 0.12;
      ty += (gy - ty) * 0.12;
      root.style.setProperty("--tx", tx.toFixed(3));
      root.style.setProperty("--ty", ty.toFixed(3));
      if (Math.abs(gx - tx) > 0.002 || Math.abs(gy - ty) > 0.002) raf = requestAnimationFrame(tick);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      // landscape flips the axes; keep it simple and use whichever axis the screen is oriented along
      const landscape = Math.abs(window.orientation ?? (screen.orientation?.angle ?? 0)) === 90;
      const b = landscape ? e.gamma : e.beta, g = landscape ? e.beta : e.gamma;
      if (!base) base = { b, g };
      gx = Math.max(-1, Math.min(1, (g - base.g) / RANGE));
      gy = Math.max(-1, Math.min(1, (b - base.b) / RANGE));
      if (!on) { on = true; root.classList.add("tilt"); }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const start = () => window.addEventListener("deviceorientation", onOrient);
    type WithPermission = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };
    const DOE = DeviceOrientationEvent as WithPermission;
    let cleanupTap: (() => void) | null = null;
    if (typeof DOE.requestPermission === "function") {
      const ask = () => {
        DOE.requestPermission!().then((r) => r === "granted" && start()).catch(() => {});
        cleanupTap?.();
      };
      window.addEventListener("pointerup", ask, { once: true });
      cleanupTap = () => window.removeEventListener("pointerup", ask);
    } else start();
    // re-level if the user rotates the phone
    const onRotate = () => { base = null; };
    window.addEventListener("orientationchange", onRotate);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("orientationchange", onRotate);
      cleanupTap?.();
      cancelAnimationFrame(raf);
      root.classList.remove("tilt");
    };
  }, []);
  return null;
}

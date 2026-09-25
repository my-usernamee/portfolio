"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CarSvg } from "./ScrollCar";

// Page transitions: a paper panel wipes across with the car on its leading edge, the new page
// loads underneath, then the panel wipes away. Internal links only; skipped for reduced motion.
const COVER_MS = 380;

export default function PageWipe() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "cover" | "uncover">("idle");
  const pendingRef = useRef<string | null>(null);
  const fallbackRef = useRef<number>(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = (href: string) => {
      if (reduce) {
        router.push(href);
        return;
      }
      if (pendingRef.current) return;
      pendingRef.current = href;
      setPhase("cover");
      window.setTimeout(() => router.push(href), COVER_MS * 0.7);
      // if the route doesn't change (same page, or a slow load), don't leave the cover up forever
      fallbackRef.current = window.setTimeout(() => {
        pendingRef.current = null;
        setPhase("uncover");
      }, 2500);
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (!href.startsWith("/") || href.startsWith("//") || a.target === "_blank" || a.hasAttribute("download") || href.endsWith(".pdf")) return;
      const [path] = href.split("#");
      if (!path || path === window.location.pathname) return; // same page: let hash links behave normally
      e.preventDefault();
      go(href);
    };
    const onNav = (e: Event) => go((e as CustomEvent<string>).detail);
    document.addEventListener("click", onClick, true);
    window.addEventListener("hari:navigate", onNav);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hari:navigate", onNav);
    };
  }, [router]);

  // the route changed under the cover: lift it
  useEffect(() => {
    if (!pendingRef.current) return;
    window.clearTimeout(fallbackRef.current);
    pendingRef.current = null;
    window.scrollTo({ top: 0 });
    const t = window.setTimeout(() => setPhase("uncover"), 60);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (phase === "idle") return null;
  return (
    <div className={`wipe ${phase}`} aria-hidden="true" onAnimationEnd={() => phase === "uncover" && setPhase("idle")}>
      <div className="wipe-edge">
        <CarSvg className="wipe-car" />
      </div>
    </div>
  );
}

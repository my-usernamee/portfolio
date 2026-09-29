"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Tells /api/track about each page view. The referrer only counts for the first page of a visit.
export default function Track() {
  const path = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (path.startsWith("/admin")) return;
    const ref = first.current ? document.referrer : "";
    first.current = false;
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path, ref }), keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}

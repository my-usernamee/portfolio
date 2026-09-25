"use client";

// Small buttons on the team cards that fire the LiDAR playground and dive mode.
export function DeepSpeedDemoButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("hari:lidar"))} className="route-tag !rotate-0" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
      ▶ see how it drives
    </button>
  );
}
export function DiveButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("hari:dive"))} className="route-tag !rotate-0" style={{ ["--tag" as string]: "#3b6fd6" }}>
      ⬇ dive
    </button>
  );
}
export function SubDemoButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("hari:sub"))} className="route-tag !rotate-0" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
      ▶ see how it swims
    </button>
  );
}

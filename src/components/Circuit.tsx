import { circuits } from "@/data/circuits";

// Real circuit outlines (see scripts/circuits.json), drawn as a paper road with a teal dashed centre line.
export default function Circuit({ slug, className = "" }: { slug: string; className?: string }) {
  const d = circuits[slug];
  if (!d) return null;
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke="var(--line-strong)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke="var(--paper)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke="var(--teal)" strokeWidth="1.2" strokeDasharray="3 4" strokeLinejoin="round" />
    </svg>
  );
}

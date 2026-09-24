// Stylised circuit outlines, not to scale.
const paths: Record<string, string> = {
  "marina-bay": "M30 82 L30 40 L72 40 L72 24 L124 24 L124 46 L152 46 L152 70 L172 70 L172 96 L110 96 L110 82 Z",
  "albert-park": "M22 62 C22 32 62 20 102 24 C142 28 180 40 180 66 C180 92 142 102 100 96 C70 92 52 100 32 90 C16 82 22 72 22 62 Z",
  sepang: "M30 90 L30 36 C30 20 50 20 60 30 L100 60 C110 68 124 60 130 50 L150 30 C160 20 180 26 180 42 L180 70 C180 86 164 92 150 86 L120 76 C110 72 100 80 95 90 C86 106 40 106 30 90 Z",
};

export default function Circuit({ slug, className = "" }: { slug: string; className?: string }) {
  const d = paths[slug] ?? paths["marina-bay"];
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke="var(--line-strong)" strokeWidth="9" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="var(--paper)" strokeWidth="5" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="4 5" strokeLinejoin="round" />
    </svg>
  );
}

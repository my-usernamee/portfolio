import type { ReactNode } from "react";

// Renders a string with ==marked== phrases as teal highlights. Used across the copy so
// data files stay plain strings.
export default function Hl({ children, className = "" }: { children: string; className?: string }) {
  const parts = children.split(/(==[^=]+==)/g);
  const out: ReactNode[] = parts.map((p, i) =>
    p.startsWith("==") && p.endsWith("==") ? (
      <span key={i} className="hl">
        {p.slice(2, -2)}
      </span>
    ) : (
      p
    ),
  );
  return <span className={className}>{out}</span>;
}

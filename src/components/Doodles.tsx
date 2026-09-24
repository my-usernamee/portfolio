// Small hand-drawn-ish decorations: climbing holds and mountains, sprinkled around the pages.
// All aria-hidden and pointer-events-none; purely for fun.

type HoldProps = { color?: string; className?: string; rotate?: number; size?: number };

export function Hold({ color = "#3f9a5a", className = "", rotate = 0, size = 34 }: HoldProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={`pointer-events-none ${className}`} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true">
      <path d="M14 40 C6 30 12 14 28 14 C44 14 54 28 46 40 C40 50 22 52 14 40 Z" fill={color} stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="30" cy="30" r="2" fill="var(--ink)" opacity="0.5" />
    </svg>
  );
}

export function Crimp({ color = "#e8843a", className = "", rotate = 0, size = 30 }: HoldProps) {
  return (
    <svg viewBox="0 0 64 40" width={size} height={size * 0.62} className={`pointer-events-none ${className}`} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true">
      <path d="M6 30 C10 14 26 8 40 10 C54 12 60 22 56 30 C50 36 12 36 6 30 Z" fill={color} stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="30" cy="22" r="2" fill="var(--ink)" opacity="0.5" />
    </svg>
  );
}

export function Mountains({ className = "", width = 220 }: { className?: string; width?: number }) {
  return (
    <svg viewBox="0 0 220 80" width={width} height={width * 0.36} className={`pointer-events-none ${className}`} aria-hidden="true">
      <g fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        <path d="M4 72 L48 24 L70 46 L96 10 L132 54 L150 36 L182 66 L216 72" />
        <path d="M88 20 L96 10 L104 20" stroke="var(--teal)" strokeWidth="2" />
        <path d="M60 36 L70 46 L80 34" opacity="0.5" />
        <path d="M118 40 L132 54 L142 44" opacity="0.5" />
      </g>
      {/* summit flag */}
      <path d="M96 10 V-2" stroke="var(--ink)" strokeWidth="1.4" />
      <path d="M96 -2 L108 2 L96 6 Z" fill="var(--teal-bright)" stroke="var(--ink)" strokeWidth="1" />
      {/* snow line */}
      <path d="M8 72 H212" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 4" />
    </svg>
  );
}

export function Carabiner({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 40 64" width={size} height={size * 1.6} className={`pointer-events-none ${className}`} aria-hidden="true">
      <path d="M20 6 C8 6 6 16 6 26 V40 C6 52 12 58 20 58 C28 58 34 52 34 40 V26 C34 16 32 6 20 6 Z" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M32 22 L32 40" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Line-art illustrations for the project cards. Paper background, ink strokes, one teal accent.
const common = { stroke: "var(--ink)", strokeWidth: 1.6, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function DeblurIllo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden="true">
      <rect width="320" height="200" fill="var(--paper-3)" />
      {/* blurry input */}
      <g opacity="0.55">
        <rect x="36" y="48" width="96" height="104" rx="6" {...common} strokeWidth={5} stroke="var(--graphite)" />
        <path d="M60 128 L84 96 L100 116 L114 100 L124 128 Z" fill="var(--graphite)" opacity="0.35" />
        <circle cx="106" cy="76" r="9" fill="var(--graphite)" opacity="0.35" />
      </g>
      {/* arrow through the network */}
      <path d="M144 100 H176" {...common} />
      <path d="M170 94 L176 100 L170 106" {...common} />
      <rect x="150" y="70" width="8" height="60" rx="2" fill="var(--teal-bright)" opacity="0.6" />
      <rect x="160" y="82" width="8" height="36" rx="2" fill="var(--teal-bright)" />
      {/* sharp output */}
      <rect x="188" y="48" width="96" height="104" rx="6" {...common} />
      <path d="M212 128 L236 96 L252 116 L266 100 L276 128 Z" {...common} fill="var(--paper)" />
      <circle cx="258" cy="76" r="9" {...common} fill="var(--teal-bright)" />
      <text x="84" y="172" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="10" fill="var(--graphite)" letterSpacing="2">BLURRY</text>
      <text x="236" y="172" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="10" fill="var(--teal)" letterSpacing="2">SHARP</text>
    </svg>
  );
}

export function ShadyIllo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden="true">
      <rect width="320" height="200" fill="var(--paper-3)" />
      {/* sun */}
      <circle cx="262" cy="52" r="18" fill="var(--teal-bright)" stroke="var(--ink)" strokeWidth="1.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1={262 + 26 * Math.cos((a * Math.PI) / 180)} y1={52 + 26 * Math.sin((a * Math.PI) / 180)} x2={262 + 34 * Math.cos((a * Math.PI) / 180)} y2={52 + 34 * Math.sin((a * Math.PI) / 180)} {...common} />
      ))}
      {/* rays onto the bus */}
      <path d="M240 70 L190 108 M232 84 L196 116" stroke="var(--teal)" strokeWidth="1.2" strokeDasharray="3 4" />
      {/* bus */}
      <rect x="60" y="92" width="170" height="60" rx="8" {...common} fill="var(--paper)" />
      <rect x="72" y="102" width="28" height="22" rx="2" {...common} />
      <rect x="108" y="102" width="28" height="22" rx="2" {...common} />
      <rect x="144" y="102" width="28" height="22" rx="2" {...common} fill="var(--teal-bright)" opacity="0.9" />
      <rect x="180" y="102" width="28" height="22" rx="2" {...common} />
      <circle cx="92" cy="156" r="10" {...common} fill="var(--ink)" />
      <circle cx="198" cy="156" r="10" {...common} fill="var(--ink)" />
      <path d="M60 136 H230" {...common} />
      {/* shade side label */}
      <path d="M40 60 L40 92" {...common} />
      <text x="40" y="52" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="10" fill="var(--teal)" letterSpacing="2">SIT LEFT</text>
      <text x="160" y="182" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="10" fill="var(--graphite)" letterSpacing="2">UV · HIGH</text>
    </svg>
  );
}

export function UrecaIllo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden="true">
      <rect width="320" height="200" fill="var(--paper-3)" />
      {/* student bubble */}
      <path d="M36 52 H164 A8 8 0 0 1 172 60 V96 A8 8 0 0 1 164 104 H72 L52 122 V104 H36 A8 8 0 0 1 28 96 V60 A8 8 0 0 1 36 52 Z" {...common} fill="var(--paper)" />
      <text x="100" y="84" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="11" fill="var(--ink)">what&apos;s the answer?</text>
      {/* bot bubble */}
      <path d="M156 112 H284 A8 8 0 0 1 292 120 V156 A8 8 0 0 1 284 164 H268 V182 L248 164 H156 A8 8 0 0 1 148 156 V120 A8 8 0 0 1 156 112 Z" {...common} fill="var(--teal-bright)" />
      <text x="220" y="144" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="11" fill="var(--ink)">which forces act?</text>
      {/* incline with a block */}
      <path d="M200 96 L284 40" {...common} />
      <path d="M200 96 H284" {...common} />
      <rect x="230" y="60" width="22" height="16" rx="2" transform="rotate(-33 241 68)" {...common} fill="var(--paper)" />
      <path d="M241 78 L241 100" stroke="var(--teal)" strokeWidth="1.6" strokeDasharray="3 3" />
      <text x="60" y="176" fontFamily="var(--font-plex-mono)" fontSize="10" fill="var(--graphite)" letterSpacing="2">SOCRATIC MODE · ON</text>
    </svg>
  );
}

export const illustrations: Record<string, (p: { className?: string }) => React.JSX.Element> = {
  deblur: DeblurIllo,
  shady: ShadyIllo,
  ureca: UrecaIllo,
};

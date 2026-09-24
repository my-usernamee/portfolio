// A row of hand-drawn-ish climbing holds used as decoration on the climbing page.
export default function Holds({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 60" className={className} aria-hidden="true">
      <g stroke="var(--ink)" strokeWidth="1.5" fill="var(--paper-2)">
        <path d="M14 40 C6 30 12 14 28 14 C44 14 52 28 44 40 C38 48 22 50 14 40 Z" fill="#3f9a5a" />
        <path d="M78 18 C96 10 118 20 116 34 C114 46 92 52 80 44 C68 36 66 24 78 18 Z" fill="#e8843a" />
        <path d="M150 44 C136 40 134 22 150 16 C166 10 190 18 186 32 C182 44 164 48 150 44 Z" fill="#3b6fd6" />
        <path d="M212 36 C206 22 226 8 246 14 C264 20 262 40 246 46 C232 51 218 46 212 36 Z" fill="#f2c94c" />
        <path d="M282 20 C296 8 316 18 312 32 C308 46 288 50 278 40 C270 32 272 26 282 20 Z" fill="#d63b3b" />
      </g>
      <g fill="var(--ink)" opacity="0.5">
        <circle cx="29" cy="30" r="2" /><circle cx="97" cy="31" r="2" /><circle cx="160" cy="30" r="2" /><circle cx="237" cy="30" r="2" /><circle cx="294" cy="30" r="2" />
      </g>
    </svg>
  );
}

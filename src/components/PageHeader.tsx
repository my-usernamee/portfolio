import type { ReactNode } from "react";

export default function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mx-auto max-w-6xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:pl-28">
      <p className="font-mono text-xs tracking-[0.18em] text-teal">{eyebrow}</p>
      <h1 className="display mt-3 text-5xl text-ink sm:text-7xl">{title}</h1>
      {children && <div className="mt-5 max-w-2xl text-lg text-graphite">{children}</div>}
    </header>
  );
}

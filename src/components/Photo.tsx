import { existsSync } from "node:fs";
import path from "node:path";

type Props = { src: string; alt: string; className?: string; label?: string; mono?: boolean };

// Server component: renders the photo when the file is in /public, otherwise a
// hatched paper placeholder that names the file to drop in.
export default function Photo({ src, alt, className = "", label, mono = false }: Props) {
  const exists = existsSync(path.join(process.cwd(), "public", src));
  if (exists) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`${className} ${mono ? "grayscale" : ""}`} loading="lazy" />;
  }
  return (
    <div className={`ph-hatch relative h-full w-full ${className}`} role="img" aria-label={`${alt} (photo coming soon)`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center font-mono text-[10px] tracking-[0.14em] text-graphite">
        <span className="h-5 w-5 rounded-full border border-line-strong" />
        <span className="break-all">{label ?? "PHOTO"} · {src}</span>
      </div>
    </div>
  );
}

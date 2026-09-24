import Link from "next/link";
import Photo from "./Photo";

type Props = { src: string; alt: string; title: string; caption: string; href?: string; label?: string; mono?: boolean };

export default function Polaroid({ src, alt, title, caption, href, label, mono = true }: Props) {
  const inner = (
    <>
      <span className="tape" />
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Photo src={src} alt={alt} label={label} mono={mono} className="h-full w-full object-cover" />
      </div>
      <h3 className="display mt-3 text-xl text-ink">{title}</h3>
      <p className="mt-1 font-mono text-xs leading-relaxed text-graphite">{caption}</p>
    </>
  );
  return href ? (
    <Link href={href} className="polaroid relative mb-5 block transition-transform hover:-translate-y-0.5">
      {inner}
    </Link>
  ) : (
    <div className="polaroid relative mb-5">{inner}</div>
  );
}

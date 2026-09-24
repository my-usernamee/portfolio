import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:pl-28">
      <p className="font-mono text-xs tracking-[0.18em] text-teal">OFF TRACK</p>
      <h1 className="display mt-3 text-6xl text-ink sm:text-8xl">404</h1>
      <p className="mt-4 max-w-md text-lg text-graphite">
        That corner doesn&apos;t exist. Either the page moved or I clipped the wall.
      </p>
      <Link href="/" className="route-tag mt-8" style={{ ["--tag" as string]: "var(--teal-bright)" }}>
        back to the grid
      </Link>
    </main>
  );
}

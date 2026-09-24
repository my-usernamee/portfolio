import { profile } from "@/data/profile";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 font-mono text-xs text-dim sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:pl-28">
      <p>
        © {year} hari · built with next.js, too much teal
        <span className="hidden md:inline"> · press <kbd className="rounded border border-line-strong px-1 text-ink">`</kbd> for a terminal</span>
      </p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {[
          ["email", `mailto:${profile.email}`],
          ["github", profile.links.github],
          ["linkedin", profile.links.linkedin],
          ["deepspeed", profile.links.team],
          ["mecatron", profile.links.mecatron],
          ["medium", profile.links.medium],
        ].map(([label, href]) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noreferrer" className="link-under hover:text-ink">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}

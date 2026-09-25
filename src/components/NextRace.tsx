import type { NextRace as NextRaceT } from "@/lib/f1";

function when(r: NextRaceT) {
  if (r.daysAway === 0) return "today";
  if (r.daysAway === 1) return "tomorrow";
  return `in ${r.daysAway} days`;
}

// Full card for the F1 page.
export function NextRaceCard({ race }: { race: NextRaceT | null }) {
  if (!race) return null;
  const local = new Date(`${race.date}T${race.time ?? "12:00:00Z"}`);
  const stamp = local.toLocaleString("en-SG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Singapore" });
  return (
    <div className="card mb-10 p-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-dim">
          NEXT ON THE CALENDAR · ROUND {race.round}
          {race.isThisWeekend && <span className="ml-2 bg-teal-bright px-1.5 py-0.5 text-ink">RACE WEEK</span>}
        </p>
        <h2 className="display mt-2 text-3xl text-ink sm:text-4xl">
          {race.name}, <span className="hl">{when(race)}</span>
        </h2>
        <p className="mt-1 font-mono text-xs text-graphite">
          {race.circuit} · {race.locality} · lights out {stamp} SGT
        </p>
      </div>
    </div>
  );
}

// One line for the home page.
export function NextRaceLine({ race }: { race: NextRaceT | null }) {
  if (!race) return null;
  return (
    <span className="font-mono text-xs text-dim">
      next race: <span className="text-ink">{race.locality}</span>, {when(race)}
    </span>
  );
}

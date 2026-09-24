// Next race on the F1 calendar, from the Jolpica (Ergast successor) API. Cached for an hour.
export type NextRace = { name: string; circuit: string; locality: string; country: string; date: string; time?: string; round: string; daysAway: number; isThisWeekend: boolean };

type Race = { round: string; raceName: string; date: string; time?: string; Circuit: { circuitName: string; Location: { locality: string; country: string } } };

export async function getNextRace(): Promise<NextRace | null> {
  try {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/current.json?limit=30", { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const races: Race[] = (await res.json()).MRData.RaceTable.Races;
    const now = Date.now();
    const next = races.find((r) => new Date(`${r.date}T${r.time ?? "12:00:00Z"}`).getTime() + 3 * 3600_000 > now);
    if (!next) return null;
    const start = new Date(`${next.date}T${next.time ?? "12:00:00Z"}`).getTime();
    const daysAway = Math.max(0, Math.ceil((start - now) / 86_400_000));
    return {
      name: next.raceName,
      circuit: next.Circuit.circuitName,
      locality: next.Circuit.Location.locality,
      country: next.Circuit.Location.country,
      date: next.date,
      time: next.time,
      round: next.round,
      daysAway,
      isThisWeekend: daysAway <= 3,
    };
  } catch {
    return null;
  }
}

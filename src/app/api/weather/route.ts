import { NextResponse } from "next/server";

// Is it raining at NTU right now? Singapore's open data: 5-minute rainfall by station, the 2-hour
// area forecast, and air temperature. Refreshed every 10 minutes. No key needed.
export const revalidate = 600;

const NTU_STATIONS = ["Nanyang Avenue", "Jurong West Street 42", "Jurong West Street 73", "Taman Jurong Greens", "Jurong West Stadium"];
const WET = /rain|shower|thunder/i;

type Rainfall = { data: { stations: { id: string; name: string }[]; readings: { timestamp: string; data: { stationId: string; value: number }[] }[] } };
type Forecast = { data: { items: { valid_period: { text: string }; forecasts: { area: string; forecast: string }[] }[] } };
type Temp = { data: { readings: { data: { value: number }[] }[] } };

async function get<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { next: { revalidate: 600 } });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const base = "https://api-open.data.gov.sg/v2/real-time/api";
  const [rain, fc, temp] = await Promise.all([get<Rainfall>(`${base}/rainfall`), get<Forecast>(`${base}/two-hr-forecast`), get<Temp>(`${base}/air-temperature`)]);

  let mmAtNtu = 0, mmIsland = 0, wetStations = 0, at = "";
  if (rain) {
    const names = new Map(rain.data.stations.map((s) => [s.id, s.name]));
    const reading = rain.data.readings[0];
    at = reading?.timestamp ?? "";
    for (const d of reading?.data ?? []) {
      mmIsland += d.value;
      if (d.value > 0) wetStations++;
      if (NTU_STATIONS.includes(names.get(d.stationId) ?? "")) mmAtNtu = Math.max(mmAtNtu, d.value);
    }
  }
  const forecast = fc?.data.items[0]?.forecasts.find((f) => f.area === "Jurong West")?.forecast ?? "";
  const validUntil = fc?.data.items[0]?.valid_period.text ?? "";
  const tempC = temp ? Math.round((temp.data.readings[0].data.reduce((a, d) => a + d.value, 0) / temp.data.readings[0].data.length) * 10) / 10 : null;

  const raining = mmAtNtu > 0 || (wetStations > 20 && WET.test(forecast));
  const expected = !raining && WET.test(forecast);
  return NextResponse.json({ raining, expected, forecast, validUntil, mmAtNtu, wetStations, mmIsland: Math.round(mmIsland * 10) / 10, tempC, at, station: "Nanyang Avenue" }, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60" } });
}

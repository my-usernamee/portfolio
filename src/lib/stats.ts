import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Page-view counters. In production they live in Upstash Redis (REST, so no client library);
// without it, `next dev` falls back to a JSON file in .data/ so the dashboard works locally.
// Nothing personal is kept: no IPs, no cookies. A visitor is a salted hash that only ever
// goes into a HyperLogLog, which can count but not list.

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const FILE = path.join(process.cwd(), ".data", "stats.json");
const RECENT = 40;

export const storage: "redis" | "file" | "none" = URL_ && TOKEN ? "redis" : process.env.VERCEL ? "none" : "file";

export type Hit = { path: string; ref: string; country: string; device: string; browser: string; visitor: string };
export type Recent = { t: number; path: string; ref: string; country: string; device: string };
export type Day = { date: string; views: number; visitors: number };
export type Stats = {
  total: number;
  visitors: number;
  days: Day[];
  pages: [string, number][];
  refs: [string, number][];
  countries: [string, number][];
  devices: [string, number][];
  browsers: [string, number][];
  recent: Recent[];
};

// days roll over at midnight in Singapore, not UTC
const sgt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore" });
export const dayKey = (d = new Date()) => sgt.format(d);

export function visitorId(ip: string, ua: string) {
  return createHash("sha256").update(`${ip}|${ua}|${process.env.SESSION_SECRET ?? ""}`).digest("hex").slice(0, 16);
}

type Cmd = (string | number)[];
async function redis(cmds: Cmd[]): Promise<unknown[]> {
  const r = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return ((await r.json()) as { result: unknown }[]).map((x) => x.result);
}

type FileDb = { total: number; days: Record<string, Record<string, number>>; uniq: Record<string, string[]>; recent: Recent[]; tries: Record<string, { n: number; until: number }> };
async function load(): Promise<FileDb> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as FileDb;
  } catch {
    return { total: 0, days: {}, uniq: {}, recent: [], tries: {} };
  }
}
async function save(db: FileDb) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(db));
}

export async function record(h: Hit) {
  if (storage === "none") return;
  const date = dayKey();
  const fields = ["views", `p:${h.path}`, `c:${h.country}`, `v:${h.device}`, `b:${h.browser}`, ...(h.ref ? [`r:${h.ref}`] : [])];
  const recent: Recent = { t: Date.now(), path: h.path, ref: h.ref, country: h.country, device: h.device };

  if (storage === "redis") {
    await redis([
      ["INCR", "total"],
      ...fields.map((f) => ["HINCRBY", `d:${date}`, f, 1]),
      ["PFADD", `u:${date}`, h.visitor],
      ["PFADD", "u:all", h.visitor],
      ["LPUSH", "recent", JSON.stringify(recent)],
      ["LTRIM", "recent", 0, RECENT - 1],
    ]);
    return;
  }
  const db = await load();
  db.total++;
  const day = (db.days[date] ??= {});
  for (const f of fields) day[f] = (day[f] ?? 0) + 1;
  for (const k of [date, "all"]) if (!(db.uniq[k] ??= []).includes(h.visitor)) db.uniq[k].push(h.visitor);
  db.recent = [recent, ...db.recent].slice(0, RECENT);
  await save(db);
}

export async function read(span: number): Promise<Stats> {
  const dates = Array.from({ length: span }, (_, i) => dayKey(new Date(Date.now() - (span - 1 - i) * 86400_000)));
  let total = 0, visitors = 0, recent: Recent[] = [];
  let perDay: Record<string, number>[] = dates.map(() => ({}));
  let uniq: number[] = dates.map(() => 0);

  if (storage === "redis") {
    const out = await redis([["GET", "total"], ["PFCOUNT", "u:all"], ["LRANGE", "recent", 0, RECENT - 1], ...dates.map((d) => ["HGETALL", `d:${d}`]), ...dates.map((d) => ["PFCOUNT", `u:${d}`])]);
    total = Number(out[0] ?? 0);
    visitors = Number(out[1] ?? 0);
    recent = ((out[2] as string[]) ?? []).map((s) => JSON.parse(s) as Recent);
    perDay = dates.map((_, i) => {
      const flat = (out[3 + i] as string[]) ?? [];
      const o: Record<string, number> = {};
      for (let k = 0; k < flat.length; k += 2) o[flat[k]] = Number(flat[k + 1]);
      return o;
    });
    uniq = dates.map((_, i) => Number(out[3 + span + i] ?? 0));
  } else if (storage === "file") {
    const db = await load();
    total = db.total;
    visitors = db.uniq.all?.length ?? 0;
    recent = db.recent;
    perDay = dates.map((d) => db.days[d] ?? {});
    uniq = dates.map((d) => db.uniq[d]?.length ?? 0);
  }

  const sums: Record<string, Map<string, number>> = { p: new Map(), r: new Map(), c: new Map(), v: new Map(), b: new Map() };
  for (const day of perDay)
    for (const [f, n] of Object.entries(day)) {
      const m = sums[f[0]];
      if (f[1] === ":" && m) m.set(f.slice(2), (m.get(f.slice(2)) ?? 0) + n);
    }
  const top = (k: string, n = 8) => [...sums[k]].sort((a, b) => b[1] - a[1]).slice(0, n);

  return {
    total,
    visitors,
    days: dates.map((date, i) => ({ date, views: perDay[i].views ?? 0, visitors: uniq[i] })),
    pages: top("p", 10),
    refs: top("r"),
    countries: top("c"),
    devices: top("v"),
    browsers: top("b"),
    recent,
  };
}

// login throttle: 5 wrong tries per address, then a 15 minute wait
const MAX_TRIES = 5, LOCK_S = 900;
const mem = new Map<string, { n: number; until: number }>();

export async function locked(ip: string) {
  if (storage === "redis") return Number((await redis([["GET", `try:${ip}`]]))[0] ?? 0) >= MAX_TRIES;
  const t = mem.get(ip);
  if (t && t.until < Date.now()) mem.delete(ip);
  return (mem.get(ip)?.n ?? 0) >= MAX_TRIES;
}
export async function failed(ip: string) {
  if (storage === "redis") {
    await redis([["INCR", `try:${ip}`], ["EXPIRE", `try:${ip}`, LOCK_S]]);
    return;
  }
  mem.set(ip, { n: (mem.get(ip)?.n ?? 0) + 1, until: Date.now() + LOCK_S * 1000 });
}

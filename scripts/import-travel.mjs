#!/usr/bin/env node
// Import travel photos: read EXIF date + GPS, reverse-geocode GPS to a place name,
// bake in rotation, resize, strip ALL metadata (incl. GPS) from the published copy,
// and write src/data/travel.json for the /photos page.
//
//   node scripts/import-travel.mjs <input-folder> [scripts/travel-manifest.json]
//
// Needs exiftool (brew install exiftool) and macOS `sips`.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const inDir = path.resolve(process.argv[2] ?? "photos-inbox");
const manifestPath = path.resolve(process.argv[3] ?? path.join(root, "scripts/travel-manifest.json"));
const outDir = path.join(root, "public/images/travel");
const dataPath = path.join(root, "src/data/travel.json");
const MAX = 1600;

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function exif(file) {
  const out = execFileSync("exiftool", ["-j", "-n", "-DateTimeOriginal", "-CreateDate", "-GPSLatitude", "-GPSLongitude", "-Orientation", file], { encoding: "utf8" });
  return JSON.parse(out)[0];
}

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=en&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { headers: { "User-Agent": "hari-portfolio-travel-import/1.0 (github.com/my-usernamee/portfolio)" } });
  if (!res.ok) return null;
  const d = await res.json();
  const a = d.address ?? {};
  const raw = a.city ?? a.town ?? a.municipality ?? a.state_district ?? a.county ?? d.name ?? "";
  // "Mumbai City District" -> "Mumbai", "Kandy District" -> "Kandy"
  return { city: raw.replace(/\s+(City\s+)?District$/i, ""), country: a.country };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rotationFor = { 3: 180, 6: 90, 8: 270 };

fs.mkdirSync(outDir, { recursive: true });
const entries = [];

for (const [file, meta] of Object.entries(manifest)) {
  if (file.startsWith("_")) continue;
  const src = path.join(inDir, file);
  if (!fs.existsSync(src)) {
    console.warn(`skip ${file}: not found in ${inDir}`);
    continue;
  }
  const x = exif(src);
  const when = x.DateTimeOriginal ?? x.CreateDate ?? null; // "YYYY:MM:DD HH:MM:SS"
  const hasGps = typeof x.GPSLatitude === "number" && typeof x.GPSLongitude === "number";

  let geo = null;
  if (hasGps) {
    geo = await reverseGeocode(x.GPSLatitude, x.GPSLongitude);
    await sleep(1100); // Nominatim usage policy: max 1 request per second
  }

  const year = meta.year ?? (when ? when.slice(0, 4) : "");
  const month = !meta.year && when ? MONTHS[Number(when.slice(5, 7)) - 1] : "";
  // an override like "Jun 2026" sorts by that month; a bare "2025" sorts to the start of that year
  const om = meta.year?.match(/^([A-Z][a-z]{2}) (\d{4})$/);
  const overrideSort = om ? `${om[2]}-${String(MONTHS.indexOf(om[1]) + 1).padStart(2, "0")}-15` : year ? `${year}-01-01` : "0000-00-00";
  const entry = {
    slug: meta.slug,
    src: `/images/travel/${meta.slug}.jpg`,
    place: meta.place ?? geo?.city ?? "",
    country: meta.country ?? geo?.country ?? "",
    when: [month, year].filter(Boolean).join(" "),
    sort: meta.year ? overrideSort : when ? when.slice(0, 10).replaceAll(":", "-") : "0000-00-00",
    source: hasGps ? "gps" : when ? "date" : "seen",
    cc: "",
    width: 0,
    height: 0,
  };

  // publish: rotate per EXIF orientation, resize, re-encode, then strip every metadata tag
  const dest = path.join(root, "public", entry.src.slice(1));
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", src, "--out", dest], { stdio: "ignore" });
  const rot = rotationFor[x.Orientation];
  if (rot) execFileSync("sips", ["-r", String(rot), dest], { stdio: "ignore" });
  execFileSync("sips", ["-Z", String(MAX), dest], { stdio: "ignore" });
  // drop every tag (GPS, camera, dates) but keep the colour profile so iPhone P3 photos don't go dull
  execFileSync("exiftool", ["-all=", "-tagsfromfile", "@", "-icc_profile", "-overwrite_original", "-q", "-q", dest]);
  const dims = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", dest], { encoding: "utf8" });
  entry.width = Number(dims.match(/pixelWidth: (\d+)/)[1]);
  entry.height = Number(dims.match(/pixelHeight: (\d+)/)[1]);

  entries.push(entry);
  console.log(`${file.padEnd(8)} -> ${entry.slug.padEnd(22)} ${entry.place}, ${entry.country} · ${entry.when || "?"}  [${entry.source}${hasGps ? `: ${geo?.city}, ${geo?.country}` : ""}] ${entry.width}x${entry.height}`);
}

const CC = { India: "IN", "Sri Lanka": "LK", Australia: "AU", China: "CN", Malaysia: "MY", Japan: "JP", "South Korea": "KR", Brunei: "BN", Singapore: "SG" };
for (const e of entries) e.cc = CC[e.country] ?? "";
entries.sort((a, b) => b.sort.localeCompare(a.sort));

// prune published files that are no longer in the manifest (cover.jpg is set by hand)
const keep = new Set(entries.map((e) => path.basename(e.src)).concat("cover.jpg"));
for (const f of fs.readdirSync(outDir)) if (f.endsWith(".jpg") && !keep.has(f)) { fs.unlinkSync(path.join(outDir, f)); console.log(`pruned ${f}`); }

// spread: keep newest-first feel but never put two photos from the same country side by side
const cityKey = (e) => e.country + ":" + e.place.split(/[ ,]/)[0].toLowerCase();
const spread = [];
const pool = [...entries];
while (pool.length) {
  const lastCountries = spread.slice(-2).map((e) => e.country);
  const lastCities = spread.slice(-4).map(cityKey);
  let i = pool.findIndex((e) => !lastCountries.includes(e.country) && !lastCities.includes(cityKey(e)));
  if (i < 0) i = pool.findIndex((e) => !lastCities.includes(cityKey(e)));
  if (i < 0) i = 0;
  spread.push(pool.splice(i, 1)[0]);
}
entries.length = 0;
entries.push(...spread);
fs.writeFileSync(dataPath, JSON.stringify(entries, null, 2) + "\n");
console.log(`\nwrote ${entries.length} photos to ${path.relative(root, dataPath)}`);

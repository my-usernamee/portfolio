#!/usr/bin/env node
// World outline for the travel map: Natural Earth land (110m) projected with Natural Earth 1,
// plus each travel photo's dot position. Writes src/data/world.json.
import fs from "node:fs";
import path from "node:path";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const W = 960, H = 480;
const land = JSON.parse(fs.readFileSync(path.join(root, "node_modules/world-atlas/land-110m.json"), "utf8"));
const geo = feature(land, land.objects.land);
const projection = geoNaturalEarth1().fitSize([W, H], geo);
const pathGen = geoPath(projection);
const d = pathGen(geo);

const photos = JSON.parse(fs.readFileSync(path.join(root, "src/data/travel.json"), "utf8"));
const points = photos
  .filter((p) => p.lat != null && p.lon != null)
  .map((p) => {
    const [x, y] = projection([p.lon, p.lat]);
    return { slug: p.slug, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

// nudge dots that land on top of each other apart (Tokyo, Sydney, Yunnan) so each one can be hovered
const MIN = 15;
for (let pass = 0; pass < 60; pass++) {
  let moved = false;
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i], b = points[j];
      let dx = b.x - a.x, dy = b.y - a.y;
      let d = Math.hypot(dx, dy);
      if (d >= MIN) continue;
      if (d < 0.01) { dx = Math.cos(i + j); dy = Math.sin(i + j); d = 1; }
      const push = (MIN - d) / 2 + 0.05;
      a.x -= (dx / d) * push; a.y -= (dy / d) * push;
      b.x += (dx / d) * push; b.y += (dy / d) * push;
      moved = true;
    }
  if (!moved) break;
}
for (const p of points) { p.x = Math.round(p.x * 10) / 10; p.y = Math.round(p.y * 10) / 10; }

fs.writeFileSync(path.join(root, "src/data/world.json"), JSON.stringify({ w: W, h: H, land: d, points }) + "\n");
console.log(`world outline ${d.length} chars, ${points.length} dots`);

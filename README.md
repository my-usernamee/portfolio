# hari.portfolio

Personal site for Sarvajana Hari. Cream paper, Petronas teal, a small F1 car that drives down a wiggly road on the left edge as you scroll, and climbing-gym route tags for navigation. Next.js 16, Tailwind v4, Motion.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Pages

| Route        | What                                             | Data file               |
| ------------ | ------------------------------------------------ | ----------------------- |
| `/`          | intro, facts, teams, resume projects, experience | `src/data/profile.ts`   |
| `/interests` | index of the hobby pages                         | `src/data/profile.ts`   |
| `/writing`   | Medium posts (RSS, revalidated hourly) + manual  | `src/data/writing.ts`   |
| `/photos`    | travel logs with photo grids                     | `src/data/travel.ts`    |
| `/climbing`  | grade, gym colour key, current project, send log | `src/data/climbing.ts`  |
| `/f1`        | circuits visited, allegiance, wishlist           | `src/data/f1.ts`        |

Everything visible is in those data files. Components don't hold copy.

## Photos

Drop files into `public/images/` using the names in `public/images/README.md`. A missing file shows a hatched placeholder that names the expected path, so nothing breaks while you collect them.

## Things marked TODO or EXAMPLE

- `profile.email` is a placeholder.
- F1 trip years are `20XX`.
- Climbing send log rows and travel logs are marked `example: true` and show an EXAMPLE tag until replaced.
- URECA needs a supervisor / lab line. DeepSpeed results in Vienna, Korea and sim racing are described loosely, add placings if you want them.

## Layout

- `src/app/layout.tsx`        fonts (Archivo with width axis, IBM Plex Mono), nav, footer, car
- `src/app/globals.css`       colour tokens, `.display` heading style, route tags, cards, polaroids
- `src/components/ScrollCar.tsx`   the wiggly road, the car that follows it, and the car SVG
- `src/components/Photo.tsx`  server component that swaps in a placeholder when an image is missing
- `src/components/Circuit.tsx`     stylised circuit outlines for the F1 page

## Deploy

Push to GitHub and import into Vercel, or `npx vercel`. No env vars needed.

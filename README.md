# hari.

Personal site for Sarvajana Hari. Cream paper, Petronas teal, a line-art F1 car that drives a wiggly road as you scroll, climbing holds scattered in the margins, and a "prove you're not a robot" check on first visit.

Next.js 16 · Tailwind v4 · Motion. Every page is static except `/writing`, which re-pulls Medium hourly.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production, same as Vercel
```

## Pages and where their content lives

| Route        | What                                              | Edit                   |
| ------------ | ------------------------------------------------- | ---------------------- |
| `/`          | bio, teams, projects, experience, stack, shelf    | `src/data/profile.ts`  |
| `/writing`   | Medium posts via RSS                               | `src/data/writing.ts`  |
| `/interests` | index of the hobby pages                           | `src/app/interests`    |
| `/climbing`  | facts and two photos                               | `src/data/climbing.ts` |
| `/f1`        | circuits and years                                 | `src/data/f1.ts`       |
| `/photos`    | travel photo wall, hover for place and year        | `src/data/travel.ts`   |

## Photos

Drop files into `public/images/`. Naming is in `public/images/README.md`.
In dev a missing photo shows a hatched box with the expected path. In production the path is hidden, and travel tiles without a photo are left out.

## Circuit outlines

The F1 page draws real track layouts. Paths live in `scripts/circuits.json`, taken from Wikimedia Commons track maps (CC BY-SA). `npm run circuits:build` normalises them into `src/data/circuits.ts`.

## Deploy

Import the GitHub repo into Vercel. No env vars. Framework and build settings are auto-detected.

// Travel photo wall. Photos go in /public/images/travel/<slug>-1.jpg, <slug>-2.jpg ...
// Hover a tile for the place and year. Leave year as "" to show the country only.
export type Place = { slug: string; place: string; country: string; year: string; photos: number; wide?: boolean };

export const places: Place[] = [
  { slug: "melbourne", place: "Melbourne", country: "Australia", year: "2025", photos: 2, wide: true },
  { slug: "japan", place: "Japan", country: "Japan", year: "", photos: 2 },
  { slug: "srilanka", place: "Sri Lanka", country: "Sri Lanka", year: "", photos: 2 },
  { slug: "mumbai", place: "Mumbai", country: "India", year: "", photos: 1 },
  { slug: "uttarakhand", place: "Uttarakhand trek", country: "India", year: "", photos: 3, wide: true },
  { slug: "kl", place: "Kuala Lumpur", country: "Malaysia", year: "2026", photos: 1 },
  { slug: "ipoh", place: "Ipoh", country: "Malaysia", year: "", photos: 1 },
  { slug: "korea", place: "Korea", country: "South Korea", year: "2026", photos: 2 },
  { slug: "brunei", place: "Brunei", country: "Brunei", year: "", photos: 1 },
];

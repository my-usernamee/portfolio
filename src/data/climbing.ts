// TODO(hari): confirm the gym name and grades, replace example sends
export const climbing = {
  grade: "for fun",
  gradeNote: "greens at Boulder+ on a good day, mostly just for the falling",
  homeGym: "Boulder+ (Chevron House)",
  since: "2025",
  style: "Slab and crimps. Roofs and dynos are the project.",
  currentProject: {
    name: "The roof green by the mats",
    gym: "Boulder+ Chevron House",
    grade: "green",
    attempts: 11,
    note: "Have the first three moves and the top. The heel hook in the middle keeps popping.",
  },
};

// Boulder+ colour circuit against an approximate V-scale
export const gradeKey = [
  { color: "#f2c94c", name: "yellow", v: "V0–V1" },
  { color: "#e8843a", name: "orange", v: "V1–V2" },
  { color: "#3f9a5a", name: "green", v: "V3–V4" },
  { color: "#3b6fd6", name: "blue", v: "V4–V5" },
  { color: "#d63b3b", name: "red", v: "V5–V6" },
  { color: "#15171a", name: "black", v: "V6+" },
];

export type Send = { date: string; problem: string; gym: string; grade: string; style: string; note?: string; example?: boolean };

export const sends: Send[] = [
  { date: "2026-09", problem: "Overhang green, left arête", gym: "Boulder+ Chevron House", grade: "green", style: "overhang", note: "Flash. Felt like a gift.", example: true },
  { date: "2026-08", problem: "Slab green, no hands finish", gym: "Boulder+ Chevron House", grade: "green", style: "slab", note: "Took a week of sessions.", example: true },
  { date: "2026-07", problem: "First blue", gym: "Boulder+ Chevron House", grade: "blue", style: "crimps", note: "One blue. Once. It counts.", example: true },
];

export const outdoorWishlist = [
  { place: "Dairy Farm Quarry", where: "Singapore", why: "The only real rock at home." },
  { place: "Railay & Tonsai", where: "Krabi, Thailand", why: "Limestone, beach, deep water solo." },
  { place: "Fontainebleau", where: "France", why: "Where bouldering started. Sandstone slopers." },
];
